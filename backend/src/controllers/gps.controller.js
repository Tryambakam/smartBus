const BusLatest = require("../models/BusLatest");

exports.updateGps = async (req, res) => {
  try {
    const { busId, lat, lng, speed, routeId } = req.body;

    if (!busId || lat == null || lng == null) {
      return res.status(400).json({
        error: "busId, lat and lng are required",
      });
    }

    await BusLatest.findOneAndUpdate(
      { busId },
      {
        busId,
        lat,
        lng,
        speed: speed ?? 0,
        routeId: routeId ?? "",
        timestamp: new Date(),
      },
      { upsert: true, new: true }
    );

    res.json({ ok: true, message: "GPS updated successfully" });
  } catch (err) {
    console.error("GPS update error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};
