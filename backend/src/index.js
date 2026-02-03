// backend/src/index.js

const routesRoutes = require("./routes/routes.routes");
const adminRoutes = require("./routes/admin.routes");
require("dotenv").config();

const express = require("express");
const cors = require("cors");

const connectDB = require("./db");
const BusLatest = require("./models/BusLatest");

const app = express();

// Middlewares
app.use(cors());
app.use(express.json({ limit: "100kb" }));
app.use("/api", routesRoutes);
app.use("/api", adminRoutes);


// ✅ Health check
app.get("/api/health", (req, res) => {
  res.json({ ok: true, message: "Backend is running" });
});

/**
 * ✅ GPS Update (Driver/Simulator sends location)
 * POST /api/gps/update
 * Body: { busId, lat, lng, speed }
 */
app.post("/api/gps/update", async (req, res) => {
  try {
    const { busId, lat, lng, speed = 0 } = req.body;

    // Basic validation
    if (!busId || typeof busId !== "string") {
      return res.status(400).json({ ok: false, error: "busId is required (string)" });
    }
    if (typeof lat !== "number" || typeof lng !== "number") {
      return res.status(400).json({ ok: false, error: "lat and lng must be numbers" });
    }
    if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
      return res.status(400).json({ ok: false, error: "lat/lng out of range" });
    }

    // ✅ Upsert (create if not exists, else update)
    await BusLatest.findOneAndUpdate(
      { busId },
      {
        busId,
        lat,
        lng,
        speed,
        timestamp: new Date(),
      },
      { upsert: true, new: true }
    );

    return res.json({ ok: true, saved: true });
  } catch (err) {
    console.error("❌ GPS update error:", err.message);
    return res.status(500).json({ ok: false, error: "DB write failed" });
  }
});

/**
 * ✅ Get all live buses
 * GET /api/buses/live
 */
app.get("/api/buses/live", async (req, res) => {
  try {
    const buses = await BusLatest.find().sort({ timestamp: -1 }).limit(200);
    res.json(buses);
  } catch (err) {
    console.error("❌ Live buses error:", err.message);
    res.status(500).json({ ok: false, error: "DB read failed" });
  }
});

// Start server only after DB connects
const PORT = process.env.PORT || 3000;

connectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`✅ Server running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error("❌ MongoDB connection failed:", err.message);
    process.exit(1);
  });
