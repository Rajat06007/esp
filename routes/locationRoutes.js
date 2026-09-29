const express = require('express');
const router = express.Router();
const {
  recordLocation,
  getAllLocations,
  getLatestLocation,
  getLocationHistory,
} = require('../controllers/locationController');

// ESP32 sends POST request with JSON body {"latitude": ..., "longitude": ...}
router.post('/', recordLocation);

// View all recent recorded locations (browser friendly)
router.get('/', getAllLocations);

// Fetch latest location for all devices or a specific device
router.get('/latest', getLatestLocation);
router.get('/latest/:deviceId', getLatestLocation);

// Fetch location history of a device
router.get('/history/:deviceId', getLocationHistory);

module.exports = router;
