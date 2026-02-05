const express = require("express");
const router = express.Router();

const BusLatest = require("../models/BusLatest");
const Stop = require("../models/Stop");
const { haversineKm } = require("../utils/haversine");

// GET /api/bus/:busId/eta
router.get("/bus/:busId/eta", async (req, res) => {
  try {
    const { busId } = req.params;

    const bus = await BusLatest.findOne({ busId });
    if (!bus) return res.status(404).json({ error: "Bus not found" });

    const routeId = bus.routeId || "";
    if (!routeId) {
      return res.status(400).json({ error: "routeId not set for this bus yet" });
    }

    const stops = await Stop.find({ routeId }).sort({ sequence: 1 });
    if (!stops.length) {
      return res.status(404).json({ error: "No stops found for this route" });
    }

    // Compute distances
    const enriched = stops.map((s) => {
      const distKm = haversineKm(bus.lat, bus.lng, s.lat, s.lng);
      return { stop: s, distKm };
    });

    // Choose next 3 nearest stops (ETA v1)
    enriched.sort((a, b) => a.distKm - b.distKm);
    const next = enriched.slice(0, 3);

    const speedKmh = Math.max(Number(bus.speed || 0), 12); // fallback 12 km/h
    const nextStops = next.map(({ stop, distKm }) => ({
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
