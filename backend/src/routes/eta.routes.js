const express = require("express");
const router = express.Router();

const BusLatest = require("../models/BusLatest");
const Stop = require("../models/Stop");
const { haversineKm } = require("../utils/haversine");
const { requireAuth } = require("../middleware/auth");

// GET /api/bus/:busId/eta
router.get("/bus/:busId/eta", requireAuth, async (req, res) => {
  try {
    const { busId } = req.params;

    const bus = await BusLatest.findOne({ busId });
    if (!bus) return res.status(404).json({ error: "Bus not found" });

    const routeId = bus.routeId || "";
    if (!routeId) {
      return res.status(400).json({ error: "routeId not set for this bus yet" });
    }

    // ordered stops for the route
    const stops = await Stop.find({ routeId }).sort({ sequence: 1 }).lean();
    if (!stops.length) {
      return res.status(404).json({ error: "No stops found for this route" });
    }

    // find nearest stop index by haversine distance
    let nearestIndex = 0;
    let nearestDist = Infinity;
    for (let i = 0; i < stops.length; i++) {
      const s = stops[i];
      const d = haversineKm(bus.lat, bus.lng, s.lat, s.lng);
      if (d < nearestDist) {
        nearestDist = d;
        nearestIndex = i;
      }
    }

    // Build next stops in sequence order starting from nearestIndex (including it)
    const nextCount = 5;
    const candidates = [];
    // distance from bus to nearest stop is nearestDist
    let cumulativeKm = nearestDist;
    candidates.push({
      stop: stops[nearestIndex],
      distKm: Number(cumulativeKm.toFixed(3)),
    });

    // accumulate distances along sequence
    for (let j = nearestIndex + 1; j < stops.length && candidates.length < nextCount; j++) {
      const prev = stops[j - 1];
      const cur = stops[j];
      const segKm = haversineKm(prev.lat, prev.lng, cur.lat, cur.lng);
      cumulativeKm += segKm;
      candidates.push({
        stop: cur,
        distKm: Number(cumulativeKm.toFixed(3)),
      });
    }

    // speed fallback
    const speedKmh = Math.max(Number(bus.speed || 0), 12);

    const nextStops = candidates.map(({ stop, distKm }) => ({
      stopId: stop.stopId,
      routeId: stop.routeId,
      name_en: stop.name_en,
      name_hi: stop.name_hi,
      name_pa: stop.name_pa,
      sequence: stop.sequence,
      distanceKm: Number(distKm.toFixed(2)),
      etaMinutes: (distKm / speedKmh) * 60,
    }));

    res.json({
      ok: true,
      busId,
      routeId,
      speedKmh,
      nextStops,
      calculatedAt: new Date().toISOString(),
    });
  } catch (err) {
    console.error("ETA error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
