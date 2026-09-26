const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { verifyToken } = require('../middleware/auth');
const { roleCheck } = require('../middleware/roleCheck');

// All admin routes require ADMIN role
router.use(verifyToken, roleCheck(['ADMIN']));

// Admin Dashboard stats
router.get('/dashboard', adminController.getDashboardStats);

// Buses management
router.get('/buses', adminController.getAllBuses);

module.exports = router;
