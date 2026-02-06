const BusLatest = require("../models/BusLatest");

function isNumber(x) {
  return typeof x === "number" && Number.isFinite(x);
}

exports.updateGps = async (req, res) => {
  try {
    let { busId, lat, lng, speed, routeId } = req.body;

    // Normalize strings
    if (typeof busId === "string") busId = busId.trim();
    if (typeof routeId === "string") routeId = routeId.trim();

    // Required fields
    if (!busId) {
      return res.status(400).json({ ok: false, error: "busId is required" });
    }
    if (!isNumber(lat) || !isNumber(lng)) {
      return res.status(400).json({ ok: false, error: "lat and lng must be numbers" });
    }

    // Range validation
    if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
      return res.status(400).json({ ok: false, error: "lat/lng out of range" });
    }

    // Optional speed validation
    if (speed == null) speed = 0;
    if (speed !== 0 && !isNumber(speed)) {
      return res.status(400).json({ ok: false, error: "speed must be a number" });
    }
    if (isNumber(speed) && speed < 0) speed = 0;

    // Optional routeId
    if (typeof routeId !== "string") routeId = "";

    const updated = await BusLatest.findOneAndUpdate(
      { busId },
      {
        busId,
        lat,
        lng,
        speed,
        routeId,
        timestamp: new Date(),
      },
      { upsert: true, new: true }
    );

    return res.json({
      ok: true,
      message: "GPS updated successfully",
      data: updated,
    });
  } catch (err) {
    console.error("GPS update error:", err);
    return res.status(500).json({ ok: false, error: "Internal server error" });
  }
};
