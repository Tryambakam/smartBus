const express = require("express");
const router = express.Router();

const Route = require("../models/Route");
const Stop = require("../models/Stop");

// POST /api/admin/routes
router.post("/admin/routes", async (req, res) => {
  try {
    const { routeId, name, city } = req.body;

    if (!routeId || !name) {
      return res.status(400).json({ error: "routeId and name are required" });
    }

    const created = await Route.create({ routeId, name, city: city || "" });
    res.status(201).json(created);
  } catch (err) {
    console.error("POST /admin/routes error:", err);
    // handle duplicate routeId
    if (err.code === 11000) return res.status(409).json({ error: "routeId already exists" });
    res.status(500).json({ error: "Internal server error" });
  }
});

// POST /api/admin/stops
router.post("/admin/stops", async (req, res) => {
  try {
    const { stopId, routeId, name_en, name_hi, name_pa, lat, lng, sequence } = req.body;

    if (!stopId || !routeId || !name_en || lat == null || lng == null || sequence == null) {
      return res.status(400).json({
        error: "stopId, routeId, name_en, lat, lng, sequence are required",
      });
    }

    const created = await Stop.create({
      stopId,
      routeId,
      name_en,
      name_hi: name_hi || "",
      name_pa: name_pa || "",
      lat,
      lng,
      sequence,
    });

    res.status(201).json(created);
  } catch (err) {
    console.error("POST /admin/stops error:", err);
    // handle duplicate stopId
    if (err.code === 11000) return res.status(409).json({ error: "stopId already exists" });
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
