/**
 * Location Controller: API endpoints for location management
 */

const GPSService = require('../services/gpsService');
const SocketService = require('../services/socketService');
const { supabaseAdmin } = require('../services/supabase.service');

class LocationController {
  /**
   * GET /api/locations/:busId/latest
   * GET /api/locations/:busId
   * GET /api/buses/:busId/location
   * Get latest location for a bus
   */
  static async getLatestLocation(req, res) {
    try {
      const busId = req.params.busId || req.params.id;

      let location = await GPSService.getLatestLocation(busId);
      if (!location) {
        // Fallback default coordinates if no location recorded yet
        location = {
          bus_id: busId,
          latitude: 10.7624,
          longitude: 78.7624,
          speed: 0,
          accuracy: 10,
          gps_signal_strength: 3,
          timestamp: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          is_fallback: true
        };
      }

      res.status(200).json({
        success: true,
        message: 'Bus location fetched successfully',
        data: location,
      });
    } catch (err) {
      console.error('getLatestLocation error:', err);
      res.status(500).json({ success: false, error: err.message });
    }
  }

  /**
   * GET /api/locations/:busId/history
   * GET /api/buses/:busId/location/history
   * Get location history for a bus
   * Query params: hours (default: 24), limit
   */
  static async getLocationHistory(req, res) {
    try {
      const busId = req.params.busId || req.params.id;
      const { hours = 24, limit = 100 } = req.query;

      let history = await GPSService.getLocationHistory(busId, parseInt(hours));

      if (!history || history.length === 0) {
        // If empty, generate a plausible starting point or fallback
        const latest = await GPSService.getLatestLocation(busId);
        if (latest) {
          history = [latest];
        }
      }

      res.status(200).json({
        success: true,
        message: 'Location history fetched successfully',
        data: history.slice(0, parseInt(limit)),
        count: history.length,
      });
    } catch (err) {
      console.error('getLocationHistory error:', err);
      res.status(500).json({ success: false, error: err.message });
    }
  }

  /**
   * POST /api/locations/update
   * POST /api/locations
   * Update bus location and broadcast to WebSocket subscribers
   */
  static async updateLocation(req, res) {
    try {
      const { 
        busId, 
        bus_id, 
        lat, 
        lng, 
        latitude, 
        longitude, 
        speed, 
        bearing, 
        accuracy, 
        altitude, 
        deviceInfo, 
        device_info 
      } = req.body;

      const targetBusId = busId || bus_id;
      const targetLat = lat !== undefined ? lat : latitude;
      const targetLng = lng !== undefined ? lng : longitude;

      if (!targetBusId || targetLat === undefined || targetLng === undefined) {
        return res.status(400).json({ 
          success: false, 
          error: 'busId (or bus_id), latitude, and longitude are required' 
        });
      }

      const location = await GPSService.saveLocation(targetBusId, {
        lat: targetLat,
        lng: targetLng,
        speed,
        bearing,
        accuracy,
        altitude,
        deviceInfo: deviceInfo || device_info,
      });

      // Broadcast to WebSocket clients
      SocketService.broadcastBusLocation(targetBusId, location);

      res.status(200).json({
        success: true,
        message: 'Location updated and broadcasted successfully',
        data: location,
      });
    } catch (err) {
      console.error('updateLocation error:', err);
      res.status(400).json({ success: false, error: err.message });
    }
  }

  /**
   * GET /api/locations
   * GET /api/locations/all
   * Get latest locations for all buses (Admin Fleet view)
   */
  static async getAllLatestLocations(req, res) {
    try {
      // First get all buses
      const { data: buses, error: busError } = await supabaseAdmin
        .from('buses')
        .select('id, bus_number, registration_number, route, status, capacity');

      if (busError) throw busError;

      // Then get latest locations
      const { data: locations, error: locError } = await supabaseAdmin
        .from('bus_locations')
        .select('*')
        .order('updated_at', { ascending: false });

      const locByBus = {};
      if (locations) {
        locations.forEach(loc => {
          if (!locByBus[loc.bus_id]) {
            locByBus[loc.bus_id] = loc;
          }
        });
      }

      const fleet = (buses || []).map(b => {
        const loc = locByBus[b.id] || null;
        return {
          bus_id: b.id,
          registration_number: b.registration_number || b.bus_number,
          bus_number: b.bus_number || b.registration_number,
          route: b.route || 'Campus Route',
          status: b.status || 'WORKING',
          capacity: b.capacity || 50,
          latitude: loc?.latitude || 10.7624,
          longitude: loc?.longitude || 78.7624,
          speed: loc?.speed || 0,
          bearing: loc?.bearing || 0,
          accuracy: loc?.accuracy || 10,
          gps_signal_strength: loc?.gps_signal_strength || 4,
          updated_at: loc?.updated_at || loc?.timestamp || new Date().toISOString(),
          has_live_location: !!loc
        };
      });

      res.status(200).json({
        success: true,
        data: fleet,
        count: fleet.length,
      });
    } catch (err) {
      console.error('getAllLatestLocations error:', err);
      res.status(500).json({ success: false, error: err.message });
    }
  }

  /**
   * GET /api/locations/:busId/distance-traveled
   * Calculate total distance traveled in last N hours
   */
  static async getDistanceTraveled(req, res) {
    try {
      const busId = req.params.busId || req.params.id;
      const { hours = 24 } = req.query;

      const history = await GPSService.getLocationHistory(busId, parseInt(hours));

      let totalDistance = 0;
      for (let i = 1; i < history.length; i++) {
        const prev = history[i - 1];
        const curr = history[i];
        if (prev.latitude && prev.longitude && curr.latitude && curr.longitude) {
          const distance = GPSService.calculateDistance(
            parseFloat(prev.latitude),
            parseFloat(prev.longitude),
            parseFloat(curr.latitude),
            parseFloat(curr.longitude)
          );
          totalDistance += distance;
        }
      }

      res.status(200).json({
        success: true,
        busId,
        distanceTraveledKm: parseFloat(totalDistance.toFixed(2)),
        locationCount: history.length,
        period: `${hours} hours`,
      });
    } catch (err) {
      console.error('getDistanceTraveled error:', err);
      res.status(500).json({ success: false, error: err.message });
    }
  }
}

module.exports = LocationController;
