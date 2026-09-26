const { supabaseAdmin } = require('../services/supabase.service');

// POST /api/attendance - Mark Attendance
const markAttendance = async (req, res) => {
  try {
    const { student_id, bus_id, status, attendance_date } = req.body;

    if (!student_id || !bus_id || !status) {
      return res.status(400).json({ 
        success: false, 
        message: 'student_id, bus_id, and status are required' 
      });
    }

    if (!['PRESENT', 'ABSENT'].includes(status)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Status must be PRESENT or ABSENT' 
      });
    }

    const today = attendance_date || new Date().toISOString().split('T')[0];

    const { data, error } = await supabaseAdmin
      .from('attendance')
      .insert({
        student_id,
        bus_id,
        attendance_date: today,
        status,
        marked_at: new Date()
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
      message: 'Attendance marked successfully',
      data: data && data[0] ? data[0] : { student_id, bus_id, attendance_date: today, status }
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Failed to mark attendance',
      error: error.message
    });
  }
};

// GET /api/attendance - Get Attendance by Bus and Date
const getAttendanceByBusAndDate = async (req, res) => {
  try {
    const { bus_id, date } = req.query;

    if (!bus_id || !date) {
      return res.status(400).json({ 
        success: false, 
        message: 'bus_id and date are required' 
      });
    }

    const { data, error } = await supabaseAdmin
      .from('attendance')
      .select('*, students(name, register_number)')
      .eq('bus_id', bus_id)
      .eq('attendance_date', date);

    if (error) {
      return res.status(500).json({ 
        success: false, 
        message: 'Failed to fetch attendance',
        error: error.message
      });
    }

    const list = data || [];
    const summary = {
      total: list.length,
      present: list.filter(a => a.status === 'PRESENT').length,
      absent: list.filter(a => a.status === 'ABSENT').length
    };

    res.status(200).json({
      success: true,
      message: 'Attendance fetched successfully',
      data: list,
      summary: summary
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Failed to get attendance',
      error: error.message
    });
  }
};

// GET /api/attendance/student/:id - Get Student's Attendance History
const getStudentAttendance = async (req, res) => {
  try {
    const { id } = req.params;
    const { limit = 30 } = req.query;

    const { data, error } = await supabaseAdmin
      .from('attendance')
      .select('*')
      .eq('student_id', id)
      .order('attendance_date', { ascending: false })
      .limit(parseInt(limit));

    if (error) {
      return res.status(500).json({ 
        success: false, 
        message: 'Failed to fetch attendance',
        error: error.message
      });
    }

    const list = data || [];
    res.status(200).json({
      success: true,
      message: 'Student attendance history fetched successfully',
      data: list,
      count: list.length
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Failed to get student attendance',
      error: error.message
    });
  }
};

// PUT /api/attendance/:id - Update Attendance
const updateAttendance = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['PRESENT', 'ABSENT'].includes(status)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Status must be PRESENT or ABSENT' 
      });
    }

    const { data, error } = await supabaseAdmin
      .from('attendance')
      .update({ status, updated_at: new Date() })
      .eq('id', id)
      .select();

    if (error) {
      return res.status(500).json({ 
        success: false, 
        message: 'Failed to update attendance',
        error: error.message
      });
    }

    res.status(200).json({
      success: true,
      message: 'Attendance updated successfully',
      data: data && data[0] ? data[0] : { id, status }
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Attendance update failed',
      error: error.message
    });
  }
};

module.exports = {
  markAttendance,
  getAttendanceByBusAndDate,
  getStudentAttendance,
  updateAttendance
};
