require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const connectDB = require('./config/db');
const locationRoutes = require('./routes/locationRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to MongoDB
connectDB();

// Middlewares
app.use(cors());
app.use(morgan('dev'));
// Parse incoming JSON payloads (from ESP32 or web apps)
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health Check / API Index
app.get('/', (req, res) => {
  res.json({
    status: 'online',
    message: 'ESP32 Location Tracker Backend API',
    endpoints: {
      postLocation: 'POST /api/location',
      getLatestAll: 'GET /api/location/latest',
      getLatestDevice: 'GET /api/location/latest/:deviceId',
      getHistory: 'GET /api/location/history/:deviceId?limit=50',
    },
  });
});

// Mount Routes
app.use('/api/location', locationRoutes);

// 404 Not Found Handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: `Route not found: ${req.method} ${req.originalUrl}`,
  });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('[Unhandled Error]', err);
  res.status(500).json({
    success: false,
    error: 'Internal Server Error',
    message: err.message,
  });
});

// Start Server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`===============================================`);
  console.log(`  ESP32 Location API Server Running!`);
  console.log(`  Local URL:    http://localhost:${PORT}`);
  console.log(`  POST Endpoint: http://localhost:${PORT}/api/location`);
  console.log(`  Environment:  ${process.env.NODE_ENV || 'development'}`);
  console.log(`===============================================`);
});
