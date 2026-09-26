const { supabaseAdmin } = require('../services/supabase.service');

// POST /api/alerts - Create Alert
const createAlert = async (req, res) => {
  try {
    const { bus_id, problem_type, description } = req.body;

    if (!bus_id || !problem_type) {
      return res.status(400).json({ 
        success: false, 
        message: 'bus_id and problem_type are required' 
      });
    }

    const reporterId = req.user ? req.user.id : null;

    const { data, error } = await supabaseAdmin
      .from('bus_alerts')
      .insert({
        bus_id,
        problem_type,
        description: description || '',
        reporter_id: reporterId,
        status: 'OPEN'
      })
      .select();

    if (error) {
      return res.status(400).json({ 
        success: false, 
        message: error.message 
      });
    }

    res.status(201).json({
      success: true,
      message: 'Alert created successfully',
      data: data && data[0] ? data[0] : { bus_id, problem_type, status: 'OPEN' }
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Failed to create alert',
      error: error.message
    });
  }
};

// GET /api/alerts - List Alerts
const listAlerts = async (req, res) => {
  try {
    const { status, bus_id } = req.query;

    let query = supabaseAdmin
      .from('bus_alerts')
      .select('*, buses(bus_number), users(email)');

    if (status) query = query.eq('status', status);
    if (bus_id) query = query.eq('bus_id', bus_id);

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) {
      return res.status(500).json({ 
        success: false, 
        message: 'Failed to fetch alerts',
        error: error.message
      });
    }

    const list = data || [];
    res.status(200).json({
      success: true,
      message: 'Alerts fetched successfully',
      data: list,
      count: list.length
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Failed to list alerts',
      error: error.message
    });
  }
};

// GET /api/alerts/:id - Get Alert Details
const getAlertById = async (req, res) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabaseAdmin
      .from('bus_alerts')
      .select('*, buses(bus_number), users(email)')
      .eq('id', id)
      .single();

    if (error || !data) {
      return res.status(404).json({ 
        success: false, 
        message: 'Alert not found' 
      });
    }

    res.status(200).json({
      success: true,
      message: 'Alert details fetched successfully',
      data: data
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch alert',
      error: error.message
    });
  }
};

// PATCH /api/alerts/:id/status - Update Alert Status
const updateAlertStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['OPEN', 'IN_PROGRESS', 'RESOLVED'].includes(status)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid status. Must be OPEN, IN_PROGRESS, or RESOLVED' 
      });
    }

    const { data, error } = await supabaseAdmin
      .from('bus_alerts')
      .update({ status, updated_at: new Date() })
      .eq('id', id)
      .select();

    if (error) {
      return res.status(500).json({ 
        success: false, 
        message: 'Failed to update alert status',
        error: error.message
      });
    }

    res.status(200).json({
      success: true,
      message: 'Alert status updated successfully',
      data: data && data[0] ? data[0] : { id, status }
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Status update failed',
      error: error.message
    });
  }
};

module.exports = {
  createAlert,
  listAlerts,
  getAlertById,
  updateAlertStatus
};
