const express = require("express");
const router = express.Router();

const Route = require("../models/Route");
const Stop = require("../models/Stop");

// GET /api/routes
router.get("/routes", async (req, res) => {
  try {
    const routes = await Route.find().sort({ routeId: 1 });
    res.json(routes);
  } catch (err) {
    console.error("GET /routes error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET /api/routes/:routeId/stops
router.get("/routes/:routeId/stops", async (req, res) => {
  try {
    const { routeId } = req.params;
    const stops = await Stop.find({ routeId }).sort({ sequence: 1 });
    res.json(stops);
  } catch (err) {
    console.error("GET /routes/:routeId/stops error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
