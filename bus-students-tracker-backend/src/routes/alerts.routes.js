const express = require('express');
const router = express.Router();
const alertsController = require('../controllers/alerts.controller');
const { verifyToken } = require('../middleware/auth.middleware');

// Protect alert routes
router.use(verifyToken);

// POST /api/alerts - Create Alert
router.post('/', alertsController.createAlert);

// GET /api/alerts - List Alerts
router.get('/', alertsController.listAlerts);

// GET /api/alerts/:id - Get Alert Details
router.get('/:id', alertsController.getAlertById);

// PATCH /api/alerts/:id/status - Update Alert Status
router.patch('/:id/status', alertsController.updateAlertStatus);

module.exports = router;
