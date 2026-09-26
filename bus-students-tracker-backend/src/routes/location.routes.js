const express = require('express');
const router = express.Router();
const locationController = require('../controllers/location.controller');
const { verifyToken } = require('../middleware/auth.middleware');

// Optional: some location updates or reads may be public or token protected
// We can apply verifyToken if header provided, or allow GPS tracking
router.post('/', verifyToken, locationController.updateLocation);
router.post('/update', verifyToken, locationController.updateLocation);

// GET /api/locations/:id or /api/buses/:id/location
router.get('/:id/location', locationController.getBusLocation);
router.get('/:id/location/history', locationController.getLocationHistory);
router.get('/:id', locationController.getBusLocation);

module.exports = router;
