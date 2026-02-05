const express = require("express");
const BusLatest = require("../models/BusLatest");

const router = express.Router();

// GET /api/bus/:busId/latest
router.get("/bus/:busId/latest", async (req, res) => {
  const { busId } = req.params;
  const doc = await BusLatest.findOne({ busId });
  if (!doc) return res.status(404).json({ error: "Bus not found" });
  res.json(doc);
});

module.exports = router;
