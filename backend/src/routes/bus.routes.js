const express = require("express");
const router = express.Router();
const BusLatest = require("../models/BusLatest");
const { requireAuth } = require("../middleware/auth");

// GET /api/buses/live
router.get("/buses/live", requireAuth, async (req, res) => {
  try {
    const { routeId, busId, limit } = req.query || {};
    const q = {};
    if (routeId) q.routeId = String(routeId);
    if (busId) q.busId = String(busId);

    const lim = Math.min(Math.max(Number(limit || 200), 1), 500);

    const buses = await BusLatest.find(q).sort({ timestamp: -1 }).limit(lim);
    res.json(buses);
  } catch (err) {
    console.error("❌ Live buses error:", err.message);
    res.status(500).json({ ok: false, error: "DB read failed" });
  }
});

// GET /api/bus/:busId/latest
router.get("/bus/:busId/latest", requireAuth, async (req, res) => {
  try {
    const busId = String(req.params.busId || "").trim();
    if (!busId) return res.status(400).json({ ok: false, error: "busId is required" });
    const bus = await BusLatest.findOne({ busId }).lean();
    if (!bus) return res.status(404).json({ ok: false, error: "Bus not found" });
    res.json({ ok: true, data: bus });
  } catch (err) {
    console.error("❌ Bus latest error:", err.message);
    res.status(500).json({ ok: false, error: "DB read failed" });
  }
});

module.exports = router;
