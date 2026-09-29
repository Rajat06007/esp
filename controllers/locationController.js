const Location = require('../models/Location');

/**
 * @desc    Record new location sent by ESP32 (accepts just latitude and longitude)
 * @route   POST /api/location
 * @access  Public
 */
const recordLocation = async (req, res) => {
  try {
    const {
      deviceId,
      latitude,
      longitude,
      altitude,
      speed,
      satellites,
      accuracy,
      battery,
      recordedAt,
      timestamp,
    } = req.body;

    // Parse & validate latitude and longitude (accept numbers or numeric strings)
    const lat = Number(latitude);
    const lon = Number(longitude);

    if (latitude === undefined || latitude === null || isNaN(lat) || lat < -90 || lat > 90) {
      return res.status(400).json({
        success: false,
        error: 'Invalid or missing "latitude". Must be a number between -90 and 90.',
      });
    }

    if (longitude === undefined || longitude === null || isNaN(lon) || lon < -180 || lon > 180) {
      return res.status(400).json({
        success: false,
        error: 'Invalid or missing "longitude". Must be a number between -180 and 180.',
      });
    }

    // Default deviceId to 'ESP32' if not provided
    const targetDeviceId = (deviceId && typeof deviceId === 'string' && deviceId.trim())
      ? deviceId.trim()
      : 'ESP32';

    // Build location document
    const newLocation = new Location({
      deviceId: targetDeviceId,
      latitude: lat,
      longitude: lon,
      altitude: altitude !== undefined && !isNaN(Number(altitude)) ? Number(altitude) : null,
      speed: speed !== undefined && !isNaN(Number(speed)) ? Number(speed) : null,
      satellites: satellites !== undefined && !isNaN(Number(satellites)) ? Number(satellites) : null,
      accuracy: accuracy !== undefined && !isNaN(Number(accuracy)) ? Number(accuracy) : null,
      battery: battery !== undefined && !isNaN(Number(battery)) ? Number(battery) : null,
      recordedAt: recordedAt || timestamp ? new Date(recordedAt || timestamp) : new Date(),
    });

    const savedRecord = await newLocation.save();

    console.log(
      `[ESP32] Location received -> Lat: ${savedRecord.latitude}, Lon: ${savedRecord.longitude} (Device: ${savedRecord.deviceId})`
    );

    return res.status(201).json({
      success: true,
      message: 'Location recorded successfully',
      data: {
        id: savedRecord._id,
        deviceId: savedRecord.deviceId,
        latitude: savedRecord.latitude,
        longitude: savedRecord.longitude,
        recordedAt: savedRecord.recordedAt,
      },
    });
  } catch (error) {
    console.error('[Error] Failed to record location:', error.message);
    return res.status(500).json({
      success: false,
      error: 'Server error while saving location',
      details: error.message,
    });
  }
};

/**
 * @desc    Get all recent locations
 * @route   GET /api/location
 * @access  Public
 */
const getAllLocations = async (req, res) => {
  try {
    const limit = Math.min(parseInt(req.query.limit, 10) || 50, 500);
    const locations = await Location.find()
      .sort({ recordedAt: -1 })
      .limit(limit);

    return res.status(200).json({
      success: true,
      count: locations.length,
      data: locations,
    });
  } catch (error) {
    console.error('[Error] Failed to get locations:', error.message);
    return res.status(500).json({
      success: false,
      error: 'Server error while fetching locations',
    });
  }
};

/**
 * @desc    Get latest location for a device or all devices
 * @route   GET /api/location/latest/:deviceId?
 * @access  Public
 */
const getLatestLocation = async (req, res) => {
  try {
    const { deviceId } = req.params;

    if (deviceId) {
      const latest = await Location.findOne({ deviceId }).sort({ recordedAt: -1 });
      if (!latest) {
        return res.status(404).json({
          success: false,
          error: `No location found for device "${deviceId}"`,
        });
      }
      return res.status(200).json({
        success: true,
        data: latest,
      });
    }

    // If no deviceId specified, return the latest location for each distinct device
    const latestPerDevice = await Location.aggregate([
      { $sort: { recordedAt: -1 } },
      {
        $group: {
          _id: '$deviceId',
          latestDoc: { $first: '$$ROOT' },
        },
      },
      { $replaceRoot: { newRoot: '$latestDoc' } },
    ]);

    return res.status(200).json({
      success: true,
      count: latestPerDevice.length,
      data: latestPerDevice,
    });
  } catch (error) {
    console.error('[Error] Failed to get latest location:', error.message);
    return res.status(500).json({
      success: false,
      error: 'Server error while fetching latest location',
    });
  }
};

/**
 * @desc    Get location history for a specific device
 * @route   GET /api/location/history/:deviceId
 * @access  Public
 */
const getLocationHistory = async (req, res) => {
  try {
    const { deviceId } = req.params;
    const limit = Math.min(parseInt(req.query.limit, 10) || 50, 1000);
    const { from, to } = req.query;

    const filter = { deviceId };

    if (from || to) {
      filter.recordedAt = {};
      if (from) filter.recordedAt.$gte = new Date(from);
      if (to) filter.recordedAt.$lte = new Date(to);
    }

    const history = await Location.find(filter)
      .sort({ recordedAt: -1 })
      .limit(limit);

    return res.status(200).json({
      success: true,
      deviceId,
      count: history.length,
      data: history,
    });
  } catch (error) {
    console.error('[Error] Failed to get location history:', error.message);
    return res.status(500).json({
      success: false,
      error: 'Server error while fetching history',
    });
  }
};

module.exports = {
  recordLocation,
  getAllLocations,
  getLatestLocation,
  getLocationHistory,
};
