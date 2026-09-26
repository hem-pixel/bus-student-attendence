const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { verifyToken } = require('../middleware/auth');

// Public route: Login
router.post('/login', authController.login);

// Protected route: Check current token / user profile
router.get('/me', verifyToken, authController.getProfile);

module.exports = router;
