const express = require('express');
const router = express.Router();
const attendanceController = require('../controllers/attendance.controller');
const { verifyToken } = require('../middleware/auth.middleware');

// Protect attendance endpoints
router.use(verifyToken);

// POST /api/attendance - Mark Attendance
router.post('/', attendanceController.markAttendance);

// GET /api/attendance - Get Attendance by Bus and Date
router.get('/', attendanceController.getAttendanceByBusAndDate);

// GET /api/attendance/student/:id - Get Student's Attendance History
router.get('/student/:id', attendanceController.getStudentAttendance);

// PUT /api/attendance/:id - Update Attendance
router.put('/:id', attendanceController.updateAttendance);

module.exports = router;
