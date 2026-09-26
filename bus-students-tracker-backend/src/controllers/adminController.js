const { supabase } = require('../config/database');

const getDashboardStats = async (req, res) => {
  try {
    // In Phase 1 foundation, return baseline system metrics
    res.json({
      success: true,
      message: 'Admin Dashboard Stats loaded',
      data: {
        totalBuses: 12,
        activeBuses: 10,
        totalStudents: 450,
        todayAttendancePercentage: 94.5,
        recentAlerts: [
          { id: '1', bus_number: 'TN-01-AB-1234', problem_type: 'Puncture', status: 'RESOLVED' }
        ]
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

const getAllBuses = async (req, res) => {
  try {
    res.json({
      success: true,
      buses: [
        { id: 'b1', bus_number: 'BUS-01', status: 'WORKING', driver_name: 'Murugan', incharge_name: 'Ramesh' },
        { id: 'b2', bus_number: 'BUS-02', status: 'WORKING', driver_name: 'Kannan', incharge_name: 'Priya' }
      ]
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

module.exports = {
  getDashboardStats,
  getAllBuses
};
