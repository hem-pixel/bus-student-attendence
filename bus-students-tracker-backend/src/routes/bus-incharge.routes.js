const express = require('express');
const router = express.Router();
const busInchargeController = require('../controllers/bus-incharge.controller');
const adminController = require('../controllers/admin.controller');
const { verifyToken } = require('../middleware/auth.middleware');
const { roleCheck } = require('../middleware/roleCheck.middleware');

// Protect all bus in-charge routes
router.use(verifyToken);
router.use(roleCheck(['ADMIN', 'BUS_INCHARGE']));

// Dashboard
router.get('/dashboard', busInchargeController.getDashboard);
router.get('/dashboard/:id', adminController.getInchargeDashboard);

// In-Charge Profile & Bus Info
router.get('/profile', busInchargeController.getProfile);
router.get('/bus', busInchargeController.getAssignedBus);

// Students
router.get('/students', busInchargeController.getAssignedStudents);
router.get('/students/:id', busInchargeController.getStudentDetails);

// Attendance
router.post('/attendance', busInchargeController.markStudentAttendance);
router.get('/attendance/today', busInchargeController.getDailyAttendance);
router.get('/attendance/history', busInchargeController.getAttendanceHistory);

// Location & Alerts
router.post('/location', busInchargeController.updateBusLocation);
router.post('/alerts', busInchargeController.createEmergencyAlert);

module.exports = router;
