const express = require('express');
const router = express.Router();
const locationController = require('../controllers/location.controller');

// Fleet tracking endpoints (admin/general)
router.get('/', locationController.getAllLatestLocations);
router.get('/all', locationController.getAllLatestLocations);

// Specific bus endpoints
router.get('/:busId/latest', locationController.getLatestLocation);
router.get('/:busId/history', locationController.getLocationHistory);
router.get('/:busId/distance-traveled', locationController.getDistanceTraveled);

// Location update endpoints (Driver/In-charge/Simulators)
router.post('/update', locationController.updateLocation);
router.post('/', locationController.updateLocation);

// Backward compatibility routes
router.get('/:id/location', locationController.getLatestLocation);
router.get('/:id/location/history', locationController.getLocationHistory);
router.get('/:id', locationController.getLatestLocation);

module.exports = router;

