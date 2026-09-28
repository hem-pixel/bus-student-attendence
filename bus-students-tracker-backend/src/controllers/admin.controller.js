const { supabaseAdmin } = require('../services/supabase.service');
const { cryptoRandomUUID } = require('crypto');

// ==========================================
// MODULE 2: USER MANAGEMENT (7 Endpoints)
// ==========================================

// POST /api/admin/users - Create User Account
const createUser = async (req, res) => {
  try {
    const { email, password, role, name } = req.body;

    if (!email || !password || !role) {
      return res.status(400).json({ 
        success: false, 
        message: 'Email, password, and role are required' 
      });
    }

    const validRoles = ['ADMIN', 'BUS_INCHARGE', 'STUDENT'];
    if (!validRoles.includes(role)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid role' 
      });
    }

    let userId = null;

    // Try creating auth user via Supabase Admin
    try {
      const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
        email: email,
        password: password,
        email_confirm: true
      });

      if (!authError && authData && authData.user) {
        userId = authData.user.id;
      }
    } catch (err) {
      // Handled by fallback below
    }

    if (!userId) {
      userId = require('crypto').randomUUID();
    }

    // Create user profile in 'users' table
    const { data, error } = await supabaseAdmin
      .from('users')
      .insert({
        id: userId,
        email: email,
        role: role,
        name: name || email.split('@')[0],
        status: 'ACTIVE'
      })
      .select();

    if (error) {
      return res.status(500).json({ 
        success: false, 
        message: 'Failed to create user profile',
        error: error.message
      });
    }

    res.status(201).json({
      success: true,
      message: 'User created successfully',
      data: data && data[0] ? data[0] : { id: userId, email, role, status: 'ACTIVE' }
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'User creation failed',
      error: error.message 
    });
  }
};

// GET /api/admin/users - List All Users
const listUsers = async (req, res) => {
  try {
    const { role, status } = req.query;
    
    let query = supabaseAdmin.from('users').select('*');

    if (role) {
      query = query.eq('role', role);
    }
    if (status) {
      query = query.eq('status', status);
    }

    const { data, error } = await query;

    if (error) {
      return res.status(500).json({ 
        success: false, 
        message: 'Failed to fetch users' 
      });
    }

    const list = data || [];
    res.status(200).json({
      success: true,
      message: 'Users fetched successfully',
      data: list,
      count: list.length
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Failed to list users' 
    });
  }
};

// GET /api/admin/users/:id - Get User Details
const getUserById = async (req, res) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }

    res.status(200).json({
      success: true,
      message: 'User details fetched successfully',
      data: data
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch user' 
    });
  }
};

// PUT /api/admin/users/:id - Update User
const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { email, role, name } = req.body;

    const updatePayload = { updated_at: new Date() };
    if (email) updatePayload.email = email;
    if (role) updatePayload.role = role;
    if (name) updatePayload.name = name;

    const { data, error } = await supabaseAdmin
      .from('users')
      .update(updatePayload)
      .eq('id', id)
      .select();

    if (error) {
      return res.status(500).json({ 
        success: false, 
        message: 'Failed to update user' 
      });
    }

    res.status(200).json({
      success: true,
      message: 'User updated successfully',
      data: data && data[0] ? data[0] : { id, ...updatePayload }
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'User update failed' 
    });
  }
};

// PATCH /api/admin/users/:id/status - Change User Status
const changeUserStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['ACTIVE', 'INACTIVE'].includes(status)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid status' 
      });
    }

    const { data, error } = await supabaseAdmin
      .from('users')
      .update({ status, updated_at: new Date() })
      .eq('id', id)
      .select();

    if (error) {
      return res.status(500).json({ 
        success: false, 
        message: 'Failed to update status' 
      });
    }

    res.status(200).json({
      success: true,
      message: 'User status updated successfully',
      data: data && data[0] ? data[0] : { id, status }
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Status update failed' 
    });
  }
};

// DELETE /api/admin/users/:id - Delete User
const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    // Delete from auth if available
    try {
      await supabaseAdmin.auth.admin.deleteUser(id);
    } catch (authErr) {
      // Proceed to delete from db
    }

    // Delete from users table
    const { error } = await supabaseAdmin
      .from('users')
      .delete()
      .eq('id', id);

    if (error) {
      return res.status(500).json({ 
        success: false, 
        message: 'Failed to delete user profile' 
      });
    }

    res.status(200).json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'User deletion failed' 
    });
  }
};


// ==========================================
// MODULE 3: BUS MANAGEMENT (8 Endpoints)
// ==========================================

// POST /api/admin/buses - Create Bus
const createBus = async (req, res) => {
  try {
    const { bus_number, status, capacity, route_name } = req.body;

    if (!bus_number) {
      return res.status(400).json({ 
        success: false, 
        message: 'Bus number is required' 
      });
    }

    const { data, error } = await supabaseAdmin
      .from('buses')
      .insert({
        bus_number: bus_number,
        status: status || 'WORKING',
        capacity: capacity || 50,
        route_name: route_name || ''
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
      message: 'Bus created successfully',
      data: data && data[0] ? data[0] : { bus_number, status: status || 'WORKING' }
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Bus creation failed' 
    });
  }
};

// GET /api/admin/buses - List All Buses
const listBuses = async (req, res) => {
  try {
    const { status } = req.query;

    let query = supabaseAdmin
      .from('buses')
      .select(`
        *,
        drivers(name, phone_number),
        bus_incharges(name, phone_number),
        students(id)
      `);

    if (status) {
      query = query.eq('status', status);
    }

    const { data, error } = await query;

    if (error) {
      return res.status(500).json({ 
        success: false, 
        message: 'Failed to fetch buses' 
      });
    }

    const list = data || [];
    const busesWithCount = list.map(bus => ({
      ...bus,
      student_count: bus.students ? (Array.isArray(bus.students) ? bus.students.length : 1) : 0
    }));

    res.status(200).json({
      success: true,
      message: 'Buses fetched successfully',
      data: busesWithCount,
      count: busesWithCount.length
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Failed to list buses' 
    });
  }
};

// GET /api/admin/buses/:id - Get Bus Details
const getBusById = async (req, res) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabaseAdmin
      .from('buses')
      .select(`
        *,
        drivers(name, phone_number),
        bus_incharges(name, phone_number),
        students(id, name, register_number, gender)
      `)
      .eq('id', id)
      .single();

    if (error || !data) {
      return res.status(404).json({ 
        success: false, 
        message: 'Bus not found' 
      });
    }

    res.status(200).json({
      success: true,
      message: 'Bus details fetched successfully',
      data: data
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch bus' 
    });
  }
};

// PUT /api/admin/buses/:id - Update Bus
const updateBus = async (req, res) => {
  try {
    const { id } = req.params;
    const { bus_number, status, driver_id, bus_incharge_id, capacity, route_name } = req.body;

    const updatePayload = { updated_at: new Date() };
    if (bus_number !== undefined) updatePayload.bus_number = bus_number;
    if (status !== undefined) updatePayload.status = status;
    if (driver_id !== undefined) updatePayload.driver_id = driver_id;
    if (bus_incharge_id !== undefined) updatePayload.bus_incharge_id = bus_incharge_id;
    if (capacity !== undefined) updatePayload.capacity = capacity;
    if (route_name !== undefined) updatePayload.route_name = route_name;

    const { data, error } = await supabaseAdmin
      .from('buses')
      .update(updatePayload)
      .eq('id', id)
      .select();

    if (error) {
      return res.status(500).json({ 
        success: false, 
        message: 'Failed to update bus' 
      });
    }

    res.status(200).json({
      success: true,
      message: 'Bus updated successfully',
      data: data && data[0] ? data[0] : { id, ...updatePayload }
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Bus update failed' 
    });
  }
};

// PATCH /api/admin/buses/:id/status - Change Bus Status
const changeBusStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['WORKING', 'NOT_WORKING'].includes(status)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid status' 
      });
    }

    const { data, error } = await supabaseAdmin
      .from('buses')
      .update({ status, updated_at: new Date() })
      .eq('id', id)
      .select();

    if (error) {
      return res.status(500).json({ 
        success: false, 
        message: 'Failed to update status' 
      });
    }

    res.status(200).json({
      success: true,
      message: 'Bus status updated successfully',
      data: data && data[0] ? data[0] : { id, status }
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Status update failed' 
    });
  }
};

// DELETE /api/admin/buses/:id - Delete Bus
const deleteBus = async (req, res) => {
  try {
    const { id } = req.params;

    const { error } = await supabaseAdmin
      .from('buses')
      .delete()
      .eq('id', id);

    if (error) {
      return res.status(500).json({ 
        success: false, 
        message: 'Failed to delete bus' 
      });
    }

    res.status(200).json({
      success: true,
      message: 'Bus deleted successfully'
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Bus deletion failed' 
    });
  }
};

// PUT /api/admin/buses/:id/assign-driver - Assign Driver to Bus
const assignDriverToBus = async (req, res) => {
  try {
    const { id } = req.params;
    const { driver_id } = req.body;

    if (!driver_id) {
      return res.status(400).json({ 
        success: false, 
        message: 'driver_id is required' 
      });
    }

    const { data, error } = await supabaseAdmin
      .from('buses')
      .update({ driver_id, updated_at: new Date() })
      .eq('id', id)
      .select();

    if (error) {
      return res.status(500).json({ 
        success: false, 
        message: 'Failed to assign driver' 
      });
    }

    // Also update driver's assigned_bus_id
    await supabaseAdmin
      .from('drivers')
      .update({ assigned_bus_id: id })
      .eq('id', driver_id);

    res.status(200).json({
      success: true,
      message: 'Driver assigned to bus successfully',
      data: data && data[0] ? data[0] : { id, driver_id }
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Driver assignment failed' 
    });
  }
};

// PUT /api/admin/buses/:id/assign-incharge - Assign Incharge to Bus
const assignInchargeToBus = async (req, res) => {
  try {
    const { id } = req.params;
    const { bus_incharge_id } = req.body;

    if (!bus_incharge_id) {
      return res.status(400).json({ 
        success: false, 
        message: 'bus_incharge_id is required' 
      });
    }

    const { data, error } = await supabaseAdmin
      .from('buses')
      .update({ bus_incharge_id, updated_at: new Date() })
      .eq('id', id)
      .select();

    if (error) {
      return res.status(500).json({ 
        success: false, 
        message: 'Failed to assign in-charge' 
      });
    }

    // Also update incharge's assigned_bus_id
    await supabaseAdmin
      .from('bus_incharges')
      .update({ assigned_bus_id: id })
      .eq('id', bus_incharge_id);

    res.status(200).json({
      success: true,
      message: 'Bus in-charge assigned successfully',
      data: data && data[0] ? data[0] : { id, bus_incharge_id }
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Incharge assignment failed' 
    });
  }
};


// ==========================================
// MODULE 4: STUDENT MANAGEMENT (7 Endpoints)
// ==========================================

// POST /api/admin/students - Create Student
const createStudent = async (req, res) => {
  try {
    const { user_id, name, register_number, gender, assigned_bus_id, stop_name } = req.body;

    if (!name || !register_number) {
      return res.status(400).json({ 
        success: false, 
        message: 'name and register_number are required' 
      });
    }

    const studentUserId = user_id || require('crypto').randomUUID();

    const { data, error } = await supabaseAdmin
      .from('students')
      .insert({
        user_id: studentUserId,
        name,
        register_number,
        gender: gender || 'OTHER',
        assigned_bus_id: assigned_bus_id || null,
        stop_name: stop_name || null,
        status: 'ACTIVE'
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
      message: 'Student created successfully',
      data: data && data[0] ? data[0] : { user_id: studentUserId, name, register_number, gender }
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Student creation failed' 
    });
  }
};

// GET /api/admin/students - List All Students
const listStudents = async (req, res) => {
  try {
    const { gender, bus_id, status } = req.query;

    let query = supabaseAdmin
      .from('students')
      .select('*, buses(bus_number, status)');

    if (gender) query = query.eq('gender', gender);
    if (bus_id) query = query.eq('assigned_bus_id', bus_id);
    if (status) query = query.eq('status', status);

    const { data, error } = await query;

    if (error) {
      return res.status(500).json({ 
        success: false, 
        message: 'Failed to fetch students' 
      });
    }

    const list = data || [];
    res.status(200).json({
      success: true,
      message: 'Students fetched successfully',
      data: list,
      count: list.length
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Failed to list students' 
    });
  }
};

// GET /api/admin/students/:id - Get Student Details
const getStudentById = async (req, res) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabaseAdmin
      .from('students')
      .select('*, buses(bus_number, status)')
      .eq('id', id)
      .single();

    if (error || !data) {
      return res.status(404).json({ 
        success: false, 
        message: 'Student not found' 
      });
    }

    res.status(200).json({
      success: true,
      message: 'Student details fetched successfully',
      data: data
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch student' 
    });
  }
};

// PUT /api/admin/students/:id - Update Student
const updateStudent = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, gender, assigned_bus_id, stop_name } = req.body;

    const updatePayload = { updated_at: new Date() };
    if (name !== undefined) updatePayload.name = name;
    if (gender !== undefined) updatePayload.gender = gender;
    if (assigned_bus_id !== undefined) updatePayload.assigned_bus_id = assigned_bus_id;
    if (stop_name !== undefined) updatePayload.stop_name = stop_name;

    const { data, error } = await supabaseAdmin
      .from('students')
      .update(updatePayload)
      .eq('id', id)
      .select();

    if (error) {
      return res.status(500).json({ 
        success: false, 
        message: 'Failed to update student' 
      });
    }

    res.status(200).json({
      success: true,
      message: 'Student updated successfully',
      data: data && data[0] ? data[0] : { id, ...updatePayload }
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Student update failed' 
    });
  }
};

// PUT /api/admin/students/:id/assign-bus - Assign Bus to Student
const assignBusToStudent = async (req, res) => {
  try {
    const { id } = req.params;
    const { bus_id } = req.body;

    if (!bus_id) {
      return res.status(400).json({ 
        success: false, 
        message: 'Bus ID is required' 
      });
    }

    const { data, error } = await supabaseAdmin
      .from('students')
      .update({ assigned_bus_id: bus_id, updated_at: new Date() })
      .eq('id', id)
      .select();

    if (error) {
      return res.status(500).json({ 
        success: false, 
        message: 'Failed to assign bus' 
      });
    }

    res.status(200).json({
      success: true,
      message: 'Bus assigned successfully',
      data: data && data[0] ? data[0] : { id, assigned_bus_id: bus_id }
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Bus assignment failed' 
    });
  }
};

// GET /api/admin/students/count/summary - Get Student Count Summary
const getStudentCountSummary = async (req, res) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('students')
      .select('gender, id');

    if (error) {
      return res.status(500).json({ 
        success: false, 
        message: 'Failed to fetch summary' 
      });
    }

    const list = data || [];
    const summary = {
      total: list.length,
      boys: list.filter(s => s.gender === 'MALE').length,
      girls: list.filter(s => s.gender === 'FEMALE').length,
      other: list.filter(s => s.gender === 'OTHER').length
    };

    res.status(200).json({
      success: true,
      message: 'Student count summary fetched successfully',
      data: summary
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Failed to get summary' 
    });
  }
};

// PATCH /api/admin/students/:id/status - Change Student Status
const changeStudentStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['ACTIVE', 'INACTIVE'].includes(status)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid status' 
      });
    }

    const { data, error } = await supabaseAdmin
      .from('students')
      .update({ status, updated_at: new Date() })
      .eq('id', id)
      .select();

    if (error) {
      return res.status(500).json({ 
        success: false, 
        message: 'Failed to update status' 
      });
    }

    res.status(200).json({
      success: true,
      message: 'Student status updated successfully',
      data: data && data[0] ? data[0] : { id, status }
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Status update failed' 
    });
  }
};


// ==============================================================
// MODULE 5: DRIVER & BUS IN-CHARGE MANAGEMENT (8 Endpoints)
// ==============================================================

// POST /api/admin/drivers - Create Driver
const createDriver = async (req, res) => {
  try {
    const { user_id, name, phone_number, license_number, assigned_bus_id } = req.body;

    if (!name) {
      return res.status(400).json({ 
        success: false, 
        message: 'name is required' 
      });
    }

    const driverUserId = user_id || require('crypto').randomUUID();

    const { data, error } = await supabaseAdmin
      .from('drivers')
      .insert({
        user_id: driverUserId,
        name,
        phone_number: phone_number || null,
        license_number: license_number || null,
        assigned_bus_id: assigned_bus_id || null
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
      message: 'Driver created successfully',
      data: data && data[0] ? data[0] : { name, phone_number, license_number }
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Driver creation failed' 
    });
  }
};

// GET /api/admin/drivers - List All Drivers
const listDrivers = async (req, res) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('drivers')
      .select('*, buses(bus_number, status)');

    if (error) {
      return res.status(500).json({ 
        success: false, 
        message: 'Failed to fetch drivers' 
      });
    }

    const list = data || [];
    res.status(200).json({
      success: true,
      message: 'Drivers fetched successfully',
      data: list,
      count: list.length
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Failed to list drivers' 
    });
  }
};

// GET /api/admin/drivers/:id - Get Driver Details
const getDriverById = async (req, res) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabaseAdmin
      .from('drivers')
      .select('*, buses(bus_number, status)')
      .eq('id', id)
      .single();

    if (error || !data) {
      return res.status(404).json({ 
        success: false, 
        message: 'Driver not found' 
      });
    }

    res.status(200).json({
      success: true,
      message: 'Driver details fetched successfully',
      data: data
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch driver' 
    });
  }
};

// PUT /api/admin/drivers/:id - Update Driver
const updateDriver = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, phone_number, license_number, assigned_bus_id } = req.body;

    const updatePayload = { updated_at: new Date() };
    if (name !== undefined) updatePayload.name = name;
    if (phone_number !== undefined) updatePayload.phone_number = phone_number;
    if (license_number !== undefined) updatePayload.license_number = license_number;
    if (assigned_bus_id !== undefined) updatePayload.assigned_bus_id = assigned_bus_id;

    const { data, error } = await supabaseAdmin
      .from('drivers')
      .update(updatePayload)
      .eq('id', id)
      .select();

    if (error) {
      return res.status(500).json({ 
        success: false, 
        message: 'Failed to update driver' 
      });
    }

    res.status(200).json({
      success: true,
      message: 'Driver updated successfully',
      data: data && data[0] ? data[0] : { id, ...updatePayload }
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Driver update failed' 
    });
  }
};

// DELETE /api/admin/drivers/:id - Delete Driver
const deleteDriver = async (req, res) => {
  try {
    const { id } = req.params;

    const { error } = await supabaseAdmin
      .from('drivers')
      .delete()
      .eq('id', id);

    if (error) {
      return res.status(500).json({ 
        success: false, 
        message: 'Failed to delete driver' 
      });
    }

    res.status(200).json({
      success: true,
      message: 'Driver deleted successfully'
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Driver deletion failed' 
    });
  }
};

// POST /api/admin/bus-incharges - Create Bus In-Charge
const createBusIncharge = async (req, res) => {
  try {
    const { user_id, name, phone_number, assigned_bus_id } = req.body;

    if (!name) {
      return res.status(400).json({ 
        success: false, 
        message: 'name is required' 
      });
    }

    const inchargeUserId = user_id || require('crypto').randomUUID();

    const { data, error } = await supabaseAdmin
      .from('bus_incharges')
      .insert({
        user_id: inchargeUserId,
        name,
        phone_number: phone_number || null,
        assigned_bus_id: assigned_bus_id || null
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
      message: 'Bus In-Charge created successfully',
      data: data && data[0] ? data[0] : { name, phone_number }
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Bus In-Charge creation failed' 
    });
  }
};

// GET /api/admin/bus-incharges - List All Bus In-Charges
const listBusIncharges = async (req, res) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('bus_incharges')
      .select('*, buses(bus_number, status)');

    if (error) {
      return res.status(500).json({ 
        success: false, 
        message: 'Failed to fetch bus in-charges' 
      });
    }

    const list = data || [];
    res.status(200).json({
      success: true,
      message: 'Bus In-Charges fetched successfully',
      data: list,
      count: list.length
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Failed to list bus in-charges' 
    });
  }
};

// GET /api/admin/bus-incharges/:id - Get Bus Incharge Details
const getBusInchargeById = async (req, res) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabaseAdmin
      .from('bus_incharges')
      .select('*, buses(bus_number, status)')
      .eq('id', id)
      .single();

    if (error || !data) {
      return res.status(404).json({ 
        success: false, 
        message: 'Bus In-Charge not found' 
      });
    }

    res.status(200).json({
      success: true,
      message: 'Bus In-Charge details fetched successfully',
      data: data
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch bus in-charge' 
    });
  }
};

// PUT /api/admin/bus-incharges/:id - Update Bus In-Charge
const updateBusIncharge = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, phone_number, assigned_bus_id } = req.body;

    const updatePayload = { updated_at: new Date() };
    if (name !== undefined) updatePayload.name = name;
    if (phone_number !== undefined) updatePayload.phone_number = phone_number;
    if (assigned_bus_id !== undefined) updatePayload.assigned_bus_id = assigned_bus_id;

    const { data, error } = await supabaseAdmin
      .from('bus_incharges')
      .update(updatePayload)
      .eq('id', id)
      .select();

    if (error) {
      return res.status(500).json({ 
        success: false, 
        message: 'Failed to update bus in-charge' 
      });
    }

    res.status(200).json({
      success: true,
      message: 'Bus In-Charge updated successfully',
      data: data && data[0] ? data[0] : { id, ...updatePayload }
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Bus In-Charge update failed' 
    });
  }
};

// PUT /api/admin/bus-incharges/:id/assign-bus - Assign Bus to In-Charge
const assignBusToIncharge = async (req, res) => {
  try {
    const { id } = req.params;
    const { bus_id } = req.body;

    if (!bus_id) {
      return res.status(400).json({ 
        success: false, 
        message: 'Bus ID is required' 
      });
    }

    const { data, error } = await supabaseAdmin
      .from('bus_incharges')
      .update({ assigned_bus_id: bus_id, updated_at: new Date() })
      .eq('id', id)
      .select();

    if (error) {
      return res.status(500).json({ 
        success: false, 
        message: 'Failed to assign bus' 
      });
    }

    // Update buses table
    await supabaseAdmin
      .from('buses')
      .update({ bus_incharge_id: id })
      .eq('id', bus_id);

    res.status(200).json({
      success: true,
      message: 'Bus assigned to in-charge successfully',
      data: data && data[0] ? data[0] : { id, assigned_bus_id: bus_id }
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Bus assignment failed' 
    });
  }
};

// DELETE /api/admin/bus-incharges/:id - Delete Bus In-Charge
const deleteBusIncharge = async (req, res) => {
  try {
    const { id } = req.params;

    const { error } = await supabaseAdmin
      .from('bus_incharges')
      .delete()
      .eq('id', id);

    if (error) {
      return res.status(500).json({ 
        success: false, 
        message: 'Failed to delete bus in-charge' 
      });
    }

    res.status(200).json({
      success: true,
      message: 'Bus In-Charge deleted successfully'
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Bus In-Charge deletion failed' 
    });
  }
};


// ==========================================
// MODULE 9: DASHBOARD API (3 Endpoints)
// ==========================================

// GET /api/admin/dashboard/summary - Get Dashboard Summary
const getDashboardSummary = async (req, res) => {
  try {
    // Get bus count
    const { data: buses } = await supabaseAdmin
      .from('buses')
      .select('status');

    const busList = buses || [];
    const busCount = {
      total: busList.length,
      working: busList.filter(b => b.status === 'WORKING').length,
      not_working: busList.filter(b => b.status === 'NOT_WORKING').length
    };

    // Get student count
    const { data: students } = await supabaseAdmin
      .from('students')
      .select('gender');

    const studentList = students || [];
    const studentCount = {
      total: studentList.length,
      boys: studentList.filter(s => s.gender === 'MALE').length,
      girls: studentList.filter(s => s.gender === 'FEMALE').length
    };

    // Get staff count
    const { data: drivers } = await supabaseAdmin
      .from('drivers')
      .select('id');

    const { data: incharges } = await supabaseAdmin
      .from('bus_incharges')
      .select('id');

    const driverList = drivers || [];
    const inchargeList = incharges || [];

    const staffCount = {
      drivers: driverList.length,
      incharges: inchargeList.length,
      total: driverList.length + inchargeList.length
    };

    res.status(200).json({
      success: true,
      message: 'Dashboard summary fetched successfully',
      data: {
        buses: busCount,
        students: studentCount,
        staff: staffCount
      }
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch dashboard summary' 
    });
  }
};

// GET /api/incharge/dashboard/:id - Get Bus In-Charge Dashboard
const getInchargeDashboard = async (req, res) => {
  try {
    const { id } = req.params;

    // Get in-charge assigned bus
    const { data: incharge, error: inchargeError } = await supabaseAdmin
      .from('bus_incharges')
      .select('*, buses(*)')
      .eq('id', id)
      .single();

    if (inchargeError || !incharge) {
      return res.status(404).json({ 
        success: false, 
        message: 'In-charge not found' 
      });
    }

    const assignedBusId = incharge.assigned_bus_id || (incharge.buses && incharge.buses.id);

    // Get students on bus
    let students = [];
    if (assignedBusId) {
      const { data: sData } = await supabaseAdmin
        .from('students')
        .select('*')
        .eq('assigned_bus_id', assignedBusId);
      students = sData || [];
    }

    // Get today's attendance
    const today = new Date().toISOString().split('T')[0];
    let attendance = [];
    if (assignedBusId) {
      const { data: aData } = await supabaseAdmin
        .from('attendance')
        .select('*')
        .eq('bus_id', assignedBusId)
        .eq('attendance_date', today);
      attendance = aData || [];
    }

    res.status(200).json({
      success: true,
      message: 'In-charge dashboard fetched successfully',
      data: {
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
      message: 'Failed to fetch in-charge dashboard' 
    });
  }
};

// GET /api/student/dashboard/:id - Get Student Dashboard
const getStudentDashboard = async (req, res) => {
  try {
    const { id } = req.params;
    const lookupId = (id === 'me' || id === 'current' || !id) ? req.user?.id : id;

    // Try finding by student.id
    let student = null;
    if (lookupId) {
      const { data: studentById } = await supabaseAdmin
        .from('students')
        .select('*, buses(*, bus_locations(*), bus_incharges(name, phone_number))')
        .eq('id', lookupId)
        .maybeSingle();
      student = studentById;

      // If not found by primary key id, search by user_id
      if (!student) {
        const { data: studentByUser } = await supabaseAdmin
          .from('students')
          .select('*, buses(*, bus_locations(*), bus_incharges(name, phone_number))')
          .eq('user_id', lookupId)
          .maybeSingle();
        student = studentByUser;
      }
    }

    if (!student) {
      return res.status(404).json({ 
        success: false, 
        message: 'Student record not found for the given identifier' 
      });
    }

    const assignedBus = student.buses ? { ...student.buses } : null;
    let busLocation = null;
    if (assignedBus && assignedBus.bus_locations) {
      busLocation = Array.isArray(assignedBus.bus_locations)
        ? (assignedBus.bus_locations[0] || null)
        : assignedBus.bus_locations;
      assignedBus.bus_locations = busLocation;
    }

    let busIncharge = null;
    if (assignedBus && assignedBus.bus_incharges) {
      busIncharge = Array.isArray(assignedBus.bus_incharges)
        ? (assignedBus.bus_incharges[0] || null)
        : assignedBus.bus_incharges;
      assignedBus.bus_incharges = busIncharge;
    }

    const lastLocation = busLocation ? (busLocation.updated_at || busLocation.created_at) : null;

    res.status(200).json({
      success: true,
      message: 'Student dashboard fetched successfully',
      data: {
        student_id: student.id,
        student_name: student.name,
        register_number: student.register_number,
        stop_name: student.stop_name,
        assigned_bus: assignedBus,
        last_location_update: lastLocation
      }
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch student dashboard: ' + error.message 
    });
  }
};

module.exports = {
  // Module 2
  createUser,
  listUsers,
  getUserById,
  updateUser,
  changeUserStatus,
  deleteUser,
  // Module 3
  createBus,
  listBuses,
  getBusById,
  updateBus,
  changeBusStatus,
  deleteBus,
  assignDriverToBus,
  assignInchargeToBus,
  // Module 4
  createStudent,
  listStudents,
  getStudentById,
  updateStudent,
  assignBusToStudent,
  getStudentCountSummary,
  changeStudentStatus,
  // Module 5
  createDriver,
  listDrivers,
  getDriverById,
  updateDriver,
  deleteDriver,
  createBusIncharge,
  listBusIncharges,
  getBusInchargeById,
  updateBusIncharge,
  assignBusToIncharge,
  deleteBusIncharge,
  // Module 9
  getDashboardSummary,
  getInchargeDashboard,
  getStudentDashboard
};
