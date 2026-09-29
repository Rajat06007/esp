const mongoose = require('mongoose');

const locationSchema = new mongoose.Schema(
  {
    deviceId: {
      type: String,
      default: 'ESP32',
      trim: true,
      index: true,
    },
    latitude: {
      type: Number,
      required: [true, 'latitude is required'],
      min: [-90, 'Latitude must be between -90 and 90'],
      max: [90, 'Latitude must be between -90 and 90'],
    },
    longitude: {
      type: Number,
      required: [true, 'longitude is required'],
      min: [-180, 'Longitude must be between -180 and 180'],
      max: [180, 'Longitude must be between -180 and 180'],
    },
    altitude: {
      type: Number,
      default: null,
    },
    speed: {
      type: Number,
      default: null,
    },
    satellites: {
      type: Number,
      default: null,
    },
    accuracy: {
      type: Number,
      default: null,
    },
    battery: {
      type: Number,
      default: null,
    },
    // GeoJSON Point format for MongoDB geospatial queries ($near, $geoWithin, etc.)
    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point',
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        default: undefined,
      },
    },
    recordedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Auto-populate GeoJSON coordinates before saving
locationSchema.pre('save', function () {
  if (this.longitude != null && this.latitude != null) {
    this.location = {
      type: 'Point',
      coordinates: [this.longitude, this.latitude],
    };
  }
});

// Create 2dsphere index for fast geospatial queries
locationSchema.index({ location: '2dsphere' });
// Compound index for querying device history ordered by time
locationSchema.index({ deviceId: 1, recordedAt: -1 });

module.exports = mongoose.model('Location', locationSchema);
