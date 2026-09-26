const { supabaseAdmin } = require('../services/supabase.service');

// Helper to get in-charge record for current user
const getInchargeForUser = async (userId) => {
  const { data, error } = await supabaseAdmin
    .from('bus_incharges')
    .select('*, buses(*)')
    .eq('user_id', userId)
    .single();

  if (error || !data) {
    // If not found by user_id, check if userId is incharge id directly
    const { data: byId } = await supabaseAdmin
      .from('bus_incharges')
      .select('*, buses(*)')
      .eq('id', userId)
      .single();
    return byId || null;
  }
  return data;
};

// GET /api/incharge/profile
const getProfile = async (req, res) => {
  try {
    const incharge = await getInchargeForUser(req.user.id);
    if (!incharge) {
      return res.status(404).json({
        success: false,
        message: 'Bus In-Charge profile not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Profile fetched successfully',
      data: incharge
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch profile',
      error: error.message
    });
  }
};

// GET /api/incharge/bus
const getAssignedBus = async (req, res) => {
  try {
    const incharge = await getInchargeForUser(req.user.id);
    if (!incharge || !incharge.assigned_bus_id) {
      return res.status(404).json({
        success: false,
        message: 'No bus assigned to this in-charge'
      });
    }

    const { data: bus, error } = await supabaseAdmin
      .from('buses')
      .select('*, drivers(*), bus_locations(*)')
      .eq('id', incharge.assigned_bus_id)
      .single();

    if (error || !bus) {
      return res.status(404).json({
        success: false,
        message: 'Bus not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Assigned bus fetched successfully',
      data: bus
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch assigned bus',
      error: error.message
    });
  }
};

// GET /api/incharge/students
const getAssignedStudents = async (req, res) => {
  try {
    const incharge = await getInchargeForUser(req.user.id);
    if (!incharge || !incharge.assigned_bus_id) {
      return res.status(404).json({
        success: false,
        message: 'No bus assigned to this in-charge'
      });
    }

    const { data: students, error } = await supabaseAdmin
      .from('students')
      .select('*')
      .eq('assigned_bus_id', incharge.assigned_bus_id);

    if (error) {
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch students'
      });
    }

    const list = students || [];
    res.status(200).json({
      success: true,
      message: 'Students fetched successfully',
      data: list,
      count: list.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch students',
      error: error.message
    });
  }
};

// GET /api/incharge/students/:id
const getStudentDetails = async (req, res) => {
  try {
    const { id } = req.params;

    const { data: student, error } = await supabaseAdmin
      .from('students')
      .select('*, buses(bus_number)')
      .eq('id', id)
      .single();

    if (error || !student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Student details fetched successfully',
      data: student
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch student details',
      error: error.message
    });
  }
};

// POST /api/incharge/attendance
const markStudentAttendance = async (req, res) => {
  try {
    const { student_id, status } = req.body;

    if (!student_id || !status) {
      return res.status(400).json({
        success: false,
        message: 'student_id and status are required'
      });
    }

    const incharge = await getInchargeForUser(req.user.id);
    const busId = incharge ? incharge.assigned_bus_id : req.body.bus_id;

    if (!busId) {
      return res.status(400).json({
        success: false,
        message: 'No bus assigned or provided'
      });
    }

    const today = new Date().toISOString().split('T')[0];

    const { data, error } = await supabaseAdmin
      .from('attendance')
      .insert({
        student_id,
        bus_id: busId,
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
      data: data && data[0] ? data[0] : { student_id, bus_id: busId, status }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to mark attendance',
      error: error.message
    });
  }
};

// GET /api/incharge/attendance/today
const getDailyAttendance = async (req, res) => {
  try {
    const incharge = await getInchargeForUser(req.user.id);
    const busId = incharge ? incharge.assigned_bus_id : req.query.bus_id;

    if (!busId) {
      return res.status(400).json({
        success: false,
        message: 'No bus assigned'
      });
    }

    const today = new Date().toISOString().split('T')[0];

    const { data, error } = await supabaseAdmin
      .from('attendance')
      .select('*, students(name, register_number)')
      .eq('bus_id', busId)
      .eq('attendance_date', today);

    if (error) {
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch today attendance'
      });
    }

    const list = data || [];
    res.status(200).json({
      success: true,
      message: 'Today attendance fetched successfully',
      data: list,
      summary: {
        total: list.length,
        present: list.filter(a => a.status === 'PRESENT').length,
        absent: list.filter(a => a.status === 'ABSENT').length
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch attendance',
      error: error.message
    });
  }
};

// GET /api/incharge/attendance/history
const getAttendanceHistory = async (req, res) => {
  try {
    const incharge = await getInchargeForUser(req.user.id);
    const busId = incharge ? incharge.assigned_bus_id : req.query.bus_id;

    const { limit = 30 } = req.query;

    let query = supabaseAdmin
      .from('attendance')
      .select('*, students(name, register_number)')
      .order('attendance_date', { ascending: false })
      .limit(parseInt(limit));

    if (busId) {
      query = query.eq('bus_id', busId);
    }

    const { data, error } = await query;

    if (error) {
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch attendance history'
      });
    }

    const list = data || [];
    res.status(200).json({
      success: true,
      message: 'Attendance history fetched successfully',
      data: list,
      count: list.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch attendance history',
      error: error.message
    });
  }
};

// POST /api/incharge/location
const updateBusLocation = async (req, res) => {
  try {
    const { latitude, longitude, speed } = req.body;

    if (latitude === undefined || longitude === undefined) {
      return res.status(400).json({
        success: false,
        message: 'latitude and longitude are required'
      });
    }

    const incharge = await getInchargeForUser(req.user.id);
    const busId = incharge ? incharge.assigned_bus_id : req.body.bus_id;

    if (!busId) {
      return res.status(400).json({
        success: false,
        message: 'No bus assigned or provided'
      });
    }

    const { data, error } = await supabaseAdmin
      .from('bus_locations')
      .upsert({
        bus_id: busId,
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude),
        speed: speed ? parseFloat(speed) : null,
        updated_at: new Date()
      }, {
        onConflict: 'bus_id'
      })
      .select();

    if (error) {
      return res.status(500).json({
        success: false,
        message: 'Failed to update location'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Location updated successfully',
      data: data && data[0] ? data[0] : { bus_id: busId, latitude, longitude, speed }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Location update failed',
      error: error.message
    });
  }
};

// POST /api/incharge/alerts
const createEmergencyAlert = async (req, res) => {
  try {
    const { problem_type, description } = req.body;

    if (!problem_type) {
      return res.status(400).json({
        success: false,
        message: 'problem_type is required'
      });
    }

    const incharge = await getInchargeForUser(req.user.id);
    const busId = incharge ? incharge.assigned_bus_id : req.body.bus_id;

    if (!busId) {
      return res.status(400).json({
        success: false,
        message: 'No bus assigned or provided'
      });
    }

    const { data, error } = await supabaseAdmin
      .from('bus_alerts')
      .insert({
        bus_id: busId,
        problem_type,
        description: description || '',
        reporter_id: req.user.id,
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
      message: 'Alert reported successfully',
      data: data && data[0] ? data[0] : { bus_id: busId, problem_type, status: 'OPEN' }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to create alert',
      error: error.message
    });
  }
};

// GET /api/incharge/dashboard
const getDashboard = async (req, res) => {
  try {
    const incharge = await getInchargeForUser(req.user.id);
    if (!incharge) {
      return res.status(404).json({
        success: false,
        message: 'In-charge profile not found'
      });
    }

    const busId = incharge.assigned_bus_id;
    let students = [];
    let attendance = [];

    if (busId) {
      const { data: sData } = await supabaseAdmin
        .from('students')
        .select('*')
        .eq('assigned_bus_id', busId);
      students = sData || [];

      const today = new Date().toISOString().split('T')[0];
      const { data: aData } = await supabaseAdmin
        .from('attendance')
        .select('*')
        .eq('bus_id', busId)
        .eq('attendance_date', today);
      attendance = aData || [];
    }

    res.status(200).json({
      success: true,
      message: 'Dashboard fetched successfully',
      data: {
        incharge: {
          id: incharge.id,
          name: incharge.name,
          phone_number: incharge.phone_number
        },
        bus: incharge.buses || null,
        students_count: students.length,
        today_attendance: {
          present: attendance.filter(a => a.status === 'PRESENT').length,
          absent: attendance.filter(a => a.status === 'ABSENT').length,
          total: students.length
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch dashboard',
      error: error.message
    });
  }
};

module.exports = {
  getProfile,
  getAssignedBus,
  getAssignedStudents,
  getStudentDetails,
  markStudentAttendance,
  getDailyAttendance,
  getAttendanceHistory,
  updateBusLocation,
  createEmergencyAlert,
  getDashboard
};
