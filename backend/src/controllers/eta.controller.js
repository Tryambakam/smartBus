const BusLatest = require("../models/BusLatest");
const Stop = require("../models/Stop");
const { haversineKm } = require("../utils/haversine");

exports.getBusEta = async (req, res) => {
  try {
    const { busId } = req.params;
    
    // Find the latest bus info
    const bus = await BusLatest.findOne({ busId }).lean();
    if (!bus) return res.status(404).json({ ok: false, error: "Bus not found" });
    if (!bus.routeId) return res.status(400).json({ ok: false, error: "Bus is not assigned to a route" });

    // Fetch all stops for this bus's route
    const stops = await Stop.find({ routeId: bus.routeId }).sort({ sequence: 1 }).lean();
    if (!stops.length) return res.status(404).json({ ok: false, error: "No stops found for this route" });

    // Ensure we don't divide by zero or negative; use at least 1 km/h as a fallback to avoid Infinity ETA
    // Also speed is typically in km/h if it comes from standard GPS
    let currentSpeedEma = bus.speedEma != null ? bus.speedEma : bus.speed;
    currentSpeedEma = Math.max(currentSpeedEma, 1); // fallback to min 1 km/h

    const etaData = stops.map(stop => {
      // Remaining distance using Haversine
      const d_remaining = haversineKm(bus.lat, bus.lng, stop.lat, stop.lng);
      
      // ETA in hours
      const etaHours = d_remaining / currentSpeedEma;
      
      // Convert to minutes
      const etaMinutes = Math.round(etaHours * 60);

      return {
        stopId: stop.stopId,
        name_en: stop.name_en,
        sequence: stop.sequence,
        distanceKm: Number(d_remaining.toFixed(2)),
        etaMinutes: etaMinutes
      };
    });

    res.json({ ok: true, data: etaData });
  } catch (err) {
    console.error("❌ ETA compute error:", err);
    res.status(500).json({ ok: false, error: "Internal server error during ETA calculation" });
  }
};
