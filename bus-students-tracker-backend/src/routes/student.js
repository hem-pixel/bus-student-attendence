const express = require('express');
const router = express.Router();
const studentController = require('../controllers/studentController');
const { verifyToken } = require('../middleware/auth');
const { roleCheck } = require('../middleware/roleCheck');

// Allowed for STUDENT, BUS_INCHARGE, and ADMIN
router.use(verifyToken, roleCheck(['STUDENT', 'BUS_INCHARGE', 'ADMIN']));

// Student status and assigned bus tracking details
router.get('/status', studentController.getStudentStatus);

module.exports = router;
