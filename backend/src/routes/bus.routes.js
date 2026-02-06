const express = require("express");
const router = express.Router();
const BusLatest = require("../models/BusLatest");

// GET /api/buses/live
router.get("/buses/live", async (req, res) => {
  try {
    const buses = await BusLatest.find().sort({ timestamp: -1 }).limit(200);
    res.json(buses);
  } catch (err) {
    console.error("❌ Live buses error:", err.message);
    res.status(500).json({ ok: false, error: "DB read failed" });
  }
});

module.exports = router;
