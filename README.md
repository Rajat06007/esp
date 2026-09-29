# ESP32 Location Tracker Backend (Node.js & MongoDB)

A lightweight, robust REST API built with Node.js, Express, and MongoDB (Mongoose) to receive GPS location data from an ESP32 board in JSON format and store it with geospatial indexing.

---

## 📁 Project Structure

```
server_online/
├── config/
│   └── db.js                 # MongoDB connection logic
├── controllers/
│   └── locationController.js # Handles receiving, validating, and querying locations
├── models/
│   └── Location.js           # Mongoose schema with GeoJSON 2dsphere indexing
├── routes/
│   └── locationRoutes.js     # API route definitions
├── examples/
│   └── esp32_client.ino      # Ready-to-flash ESP32 Arduino sketch
├── .env                      # Local environment configuration
├── .env.example              # Environment variables template
├── package.json              # Project dependencies & scripts
├── server.js                 # Main Express server entry point
├── test_request.sh           # Automated cURL test script
└── README.md                 # Documentation
```

---

## 🚀 Quick Start

### 1. Prerequisites
- [Node.js](https://nodejs.org/) (v16 or higher)
- [MongoDB](https://www.mongodb.com/) running locally or a [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) connection URI

### 2. Configure Environment
Check or edit `.env`:
```env
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/esp32_tracker
NODE_ENV=development
```
> **Note for MongoDB Atlas**: Replace `MONGODB_URI` with your connection string:
> `mongodb+srv://<username>:<password>@cluster0.mongodb.net/esp32_tracker?retryWrites=true&w=majority`

### 3. Start the Server

```bash
# Production mode
npm start

# Development mode (auto-reload on file changes)
npm run dev
```

The server will run on `http://localhost:5000` (listening on `0.0.0.0` so devices on your local network can reach it).

---

## 📡 API Endpoints

### 1. Record Location (ESP32 Post Endpoint)
- **Method**: `POST`
- **Path**: `/api/location`
- **Headers**: `Content-Type: application/json`
- **Body**:
```json
{
  "latitude": 28.613939,
  "longitude": 77.209021
}
```
> *(Optional fields like `deviceId`, `altitude`, `speed`, `battery` can still be provided if needed, but only `latitude` and `longitude` are required!)*
- **Response** (`201 Created`):
```json
{
  "success": true,
  "message": "Location recorded successfully",
  "data": {
    "id": "67471849a37e19d45f3192ab",
    "deviceId": "ESP32_TRACKER_01",
    "latitude": 28.613939,
    "longitude": 77.209021,
    "recordedAt": "2026-09-29T10:28:00.000Z"
  }
}
```

### 2. Get Latest Location
- **Single Device**: `GET /api/location/latest/:deviceId`
  - Example: `GET /api/location/latest/ESP32_TRACKER_01`
- **All Devices**: `GET /api/location/latest`

### 3. Get Location History
- **Path**: `GET /api/location/history/:deviceId?limit=50&from=2026-01-01&to=2026-12-31`
- Returns chronological points recorded by the device.

---

## 🔌 ESP32 Hardware & Flashing Instructions

1. Open the Arduino IDE.
2. Ensure you have the **esp32 by Espressif** board package installed in the Boards Manager.
3. Open `examples/esp32_client.ino`.
4. Configure your Wi-Fi credentials:
   ```cpp
   const char* ssid     = "YOUR_WIFI_SSID";
   const char* password = "YOUR_WIFI_PASSWORD";
   ```
5. Configure your computer's local IP address:
   ```cpp
   // Find your computer's IP using `ip a` (Linux) or `ipconfig` (Windows)
   const char* serverUrl = "http://192.168.1.100:5000/api/location";
   ```
   > ⚠️ **Important**: Do not use `localhost` or `127.0.0.1` inside the ESP32 code. The ESP32 must use your computer's LAN IP address or your public/domain URL if hosted online.
6. Select your ESP32 board and COM/serial port, and click **Upload**.
7. Open the Serial Monitor at **115200 baud** to observe Wi-Fi connection and HTTP POST responses.

---

## 🧪 Testing with cURL

You can test the API immediately using the included test script:
```bash
./test_request.sh
```
Or directly with curl:
```bash
curl -X POST http://localhost:5000/api/location \
  -H "Content-Type: application/json" \
  -d '{"deviceId":"ESP32_01","latitude":28.6139,"longitude":77.2090}'
```
# esp
