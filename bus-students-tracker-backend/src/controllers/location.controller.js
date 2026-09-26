const { supabaseAdmin } = require('../services/supabase.service');

// POST /api/locations - Receive GPS Update
const updateLocation = async (req, res) => {
  try {
    const { bus_id, latitude, longitude, speed } = req.body;

    if (!bus_id || latitude === undefined || longitude === undefined) {
      return res.status(400).json({ 
        success: false, 
        message: 'bus_id, latitude, and longitude are required' 
      });
    }

    // Validate coordinates
    const lat = parseFloat(latitude);
    const lng = parseFloat(longitude);
    if (isNaN(lat) || isNaN(lng) || lat < -90 || lat > 90 || lng < -180 || lng > 180) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid GPS coordinates' 
      });
    }

    const { data, error } = await supabaseAdmin
      .from('bus_locations')
      .upsert({
        bus_id: bus_id,
        latitude: lat,
        longitude: lng,
        speed: speed !== undefined && speed !== null ? parseFloat(speed) : null,
        updated_at: new Date()
      }, {
        onConflict: 'bus_id'
      })
      .select();

    if (error) {
      return res.status(500).json({ 
        success: false, 
        message: 'Failed to update location',
        error: error.message
      });
    }

    res.status(200).json({
      success: true,
      message: 'Location updated successfully',
      data: data && data[0] ? data[0] : { bus_id, latitude: lat, longitude: lng, speed }
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Location update failed',
      error: error.message
    });
  }
};

// GET /api/buses/:id/location - Get Latest Bus Location
const getBusLocation = async (req, res) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabaseAdmin
      .from('bus_locations')
      .select('*')
      .eq('bus_id', id)
      .single();

    if (error || !data) {
      return res.status(404).json({ 
        success: false, 
        message: 'Location not found' 
      });
    }

    res.status(200).json({
      success: true,
      message: 'Bus location fetched successfully',
      data: data
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch location',
      error: error.message
    });
  }
};

// GET /api/buses/:id/location/history - Get Location History
const getLocationHistory = async (req, res) => {
  try {
    const { id } = req.params;
    const { limit = 50 } = req.query;

    const { data, error } = await supabaseAdmin
      .from('bus_locations')
      .select('*')
      .eq('bus_id', id)
      .order('updated_at', { ascending: false })
      .limit(parseInt(limit));

    if (error) {
      return res.status(500).json({ 
        success: false, 
        message: 'Failed to fetch location history' 
      });
    }

    const list = data || [];
    res.status(200).json({
      success: true,
      message: 'Location history fetched successfully',
      data: list,
      count: list.length
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch history',
      error: error.message
    });
  }
};

module.exports = {
  updateLocation,
  getBusLocation,
  getLocationHistory
};
