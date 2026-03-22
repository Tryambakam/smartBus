const BusLatest = require("../models/BusLatest");

function isNumber(x) {
  return typeof x === "number" && Number.isFinite(x);
}

exports.updateGps = async (req, res) => {
  try {
    let { busId, lat, lng, speed, routeId, busStatus, occupancy } = req.body;

    if (typeof busId === "string") busId = busId.trim();
    if (typeof routeId === "string") routeId = routeId.trim();

    if (!busId) return res.status(400).json({ ok: false, error: "busId is required" });
    if (!isNumber(lat) || !isNumber(lng)) {
      return res.status(400).json({ ok: false, error: "lat and lng must be numbers" });
    }
    if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
      return res.status(400).json({ ok: false, error: "lat/lng out of range" });
    }

    // Enforce JWT Context Validation locking Operators explicitly to their assigned hardware
    if (req.user && req.user.role === "operator") {
      if (!req.user.busId) {
        return res.status(403).json({ ok: false, error: "Forbidden: No Bus assigned to this operator account" });
      }
      if (req.user.busId !== busId) {
        return res.status(403).json({ ok: false, error: "Forbidden: Valid JWT Bus ID mismatch" });
      }
    }

    if (speed == null) speed = 0;
    if (!isNumber(speed)) speed = 0;
    if (speed < 0) speed = 0;

    if (typeof routeId !== "string") routeId = "";

    const validStatuses = ["On Route", "Stopped", "Out of Service"];
    if (!validStatuses.includes(busStatus)) busStatus = "On Route";

    const validOccupancy = ["Low", "Medium", "High"];
    if (!validOccupancy.includes(occupancy)) occupancy = "Low";

    const doc = {
      busId,
      lat,
      lng,
      speed,
      routeId,
      busStatus,
      occupancy,
      timestamp: new Date(),
      location: { type: "Point", coordinates: [Number(lng), Number(lat)] },
    };

    const updated = await BusLatest.findOneAndUpdate({ busId }, doc, { upsert: true, new: true });

    // Emit real-time event for connected clients (if socket exists)
    try {
      const io = req.app?.locals?.io;
      if (io && typeof io.emit === "function") {
        io.emit("bus:update", updated);
      }
    } catch (e) {
      console.error("Socket emit failed:", e);
    }

    return res.json({ ok: true, message: "GPS updated", data: updated });
  } catch (err) {
    console.error("GPS update error:", err);
    return res.status(500).json({ ok: false, error: "Internal server error" });
  }
};
