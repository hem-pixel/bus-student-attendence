const express = require('express');
const router = express.Router();
const inchargeController = require('../controllers/inchargeController');
const { verifyToken } = require('../middleware/auth');
const { roleCheck } = require('../middleware/roleCheck');

// Allowed for BUS_INCHARGE and ADMIN
router.use(verifyToken, roleCheck(['BUS_INCHARGE', 'ADMIN']));

// Get details of assigned bus
router.get('/assigned-bus', inchargeController.getAssignedBusDetails);

// Mark student attendance
router.post('/attendance', inchargeController.markAttendance);

module.exports = router;
