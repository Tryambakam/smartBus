const express = require("express");
const Route = require("../models/Route");
const Stop = require("../models/Stop");

const router = express.Router();

// GET /api/routes
router.get("/routes", async (req, res) => {
  const routes = await Route.find().sort({ routeId: 1 });
  res.json(routes);
});

// GET /api/routes/:routeId/stops
router.get("/routes/:routeId/stops", async (req, res) => {
  const { routeId } = req.params;
  const stops = await Stop.find({ routeId }).sort({ sequence: 1 });
  res.json(stops);
});

module.exports = router;
