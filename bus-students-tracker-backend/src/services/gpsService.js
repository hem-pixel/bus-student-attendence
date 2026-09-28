/**
 * GPS Service: Process, validate, and store location data
 */

const { supabaseAdmin } = require('./supabase.service');

class GPSService {
  /**
   * Validate GPS coordinates
   */
  static validateCoordinates(lat, lng) {
    if (lat === undefined || lat === null || lng === undefined || lng === null) {
      return { valid: false, error: 'Missing coordinates' };
    }
    const nLat = parseFloat(lat);
    const nLng = parseFloat(lng);
    if (isNaN(nLat) || isNaN(nLng)) {
      return { valid: false, error: 'Coordinates must be valid numbers' };
    }
    if (nLat < -90 || nLat > 90) return { valid: false, error: 'Invalid latitude (-90 to 90)' };
    if (nLng < -180 || nLng > 180) return { valid: false, error: 'Invalid longitude (-180 to 180)' };
    return { valid: true };
  }

  /**
   * Store location in database
   */
  static async saveLocation(busId, locationData) {
    const { lat, lng, latitude, longitude, speed, bearing, accuracy, altitude, deviceInfo, device_info } = locationData;
    const finalLat = lat !== undefined && lat !== null ? lat : latitude;
    const finalLng = lng !== undefined && lng !== null ? lng : longitude;

    // Validate
    const validation = this.validateCoordinates(finalLat, finalLng);
    if (!validation.valid) throw new Error(validation.error);

    const nowIso = new Date().toISOString();
    const record = {
      bus_id: busId,
      latitude: parseFloat(finalLat),
      longitude: parseFloat(finalLng),
      speed: speed !== undefined && speed !== null ? parseFloat(speed) : null,
      bearing: bearing !== undefined && bearing !== null ? parseFloat(bearing) : null,
      accuracy: accuracy !== undefined && accuracy !== null ? parseFloat(accuracy) : null,
      altitude: altitude !== undefined && altitude !== null ? parseFloat(altitude) : null,
      device_info: deviceInfo || device_info || null,
      gps_signal_strength: this.calculateSignalStrength(accuracy),
      timestamp: nowIso,
      updated_at: nowIso
    };

    try {
      // Upsert into bus_locations
      const { data, error } = await supabaseAdmin
        .from('bus_locations')
        .upsert(record, { onConflict: 'bus_id' })
        .select();

      if (error) {
        // Fallback: regular insert if upsert fails
        const insertRes = await supabaseAdmin
          .from('bus_locations')
          .insert([record])
          .select();
        if (insertRes.error) throw insertRes.error;
        return insertRes.data && insertRes.data[0] ? insertRes.data[0] : record;
      }

      return data && data[0] ? data[0] : record;
    } catch (err) {
      console.error('❌ Error saving location:', err.message);
      // Return record with mock ID if DB error
      return { id: `loc-${Date.now()}`, ...record };
    }
  }

  /**
   * Get latest location for a bus
   */
  static async getLatestLocation(busId) {
    try {
      const { data, error } = await supabaseAdmin
        .from('bus_locations')
        .select('*')
        .eq('bus_id', busId)
        .order('updated_at', { ascending: false })
        .limit(1)
        .single();

      if (error && error.code !== 'PGRST116') {
        // Retry with timestamp column if updated_at failed
        const retry = await supabaseAdmin
          .from('bus_locations')
          .select('*')
          .eq('bus_id', busId)
          .order('timestamp', { ascending: false })
          .limit(1)
          .single();
        if (!retry.error && retry.data) return retry.data;
      }

      return data || null;
    } catch (err) {
      console.error('❌ Error fetching location:', err.message);
      return null;
    }
  }

  /**
   * Get location history for a bus (last N hours)
   */
  static async getLocationHistory(busId, hours = 24) {
    try {
      const since = new Date(Date.now() - hours * 60 * 60 * 1000).toISOString();

      const { data, error } = await supabaseAdmin
        .from('bus_locations')
        .select('*')
        .eq('bus_id', busId)
        .order('updated_at', { ascending: true })
        .limit(500);

      if (error) {
        console.warn('⚠️ Error fetching history from bus_locations:', error.message);
        const fallback = await this.getLatestLocation(busId);
        return fallback ? [fallback] : [];
      }
      return data || [];
    } catch (err) {
      console.error('❌ Error fetching history:', err.message);
      return [];
    }
  }

  /**
   * Calculate GPS signal strength (0-5)
   * Based on accuracy: lower accuracy = better signal
   */
  static calculateSignalStrength(accuracy) {
    if (!accuracy || isNaN(accuracy)) return 3;
    const acc = parseFloat(accuracy);
    if (acc < 5) return 5;
    if (acc < 10) return 4;
    if (acc < 20) return 3;
    if (acc < 50) return 2;
    return 1;
  }

  /**
   * Calculate distance between two points (Haversine formula in km)
   */
  static calculateDistance(lat1, lng1, lat2, lng2) {
    const R = 6371; // Earth's radius in km
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLng = ((lng2 - lng1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLng / 2) *
        Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  /**
   * Check if location is within a geofence (circle)
   */
  static isWithinGeofence(lat, lng, centerLat, centerLng, radiusKm) {
    const distance = this.calculateDistance(lat, lng, centerLat, centerLng);
    return distance <= radiusKm;
  }

  /**
   * Cleanup old locations (older than N days)
   */
  static async cleanupOldLocations(days = 30) {
    try {
      const before = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();

      const { error } = await supabaseAdmin
        .from('bus_locations')
        .delete()
        .lt('timestamp', before);

      if (error) throw error;
      console.log(`✅ Cleaned up locations older than ${days} days`);
    } catch (err) {
      console.error('❌ Error cleaning up locations:', err.message);
    }
  }
}

module.exports = GPSService;
