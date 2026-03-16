const express = require("express");
const router = express.Router();

const RouteModel = require("../models/Route");
const StopModel = require("../models/Stop");
const { requireAuth } = require("../middleware/auth");

router.use(requireAuth);

// ROUTES CRUD
router.post("/admin/routes", async (req, res) => {
  try {
    const { routeId, name, city } = req.body;
    if (!routeId || !name) return res.status(400).json({ error: "routeId and name are required" });
    const created = await RouteModel.create({ routeId, name, city: city || "" });
    res.status(201).json(created);
  } catch (err) {
    console.error("POST /admin/routes error:", err);
    if (err.code === 11000) return res.status(409).json({ error: "routeId already exists" });
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/admin/routes", async (req, res) => {
  try {
    const list = await RouteModel.find().sort({ routeId: 1 }).lean();
    res.json(list);
  } catch (err) {
    console.error("GET /admin/routes error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/admin/routes/:routeId", async (req, res) => {
  try {
    const route = await RouteModel.findOne({ routeId: req.params.routeId }).lean();
    if (!route) return res.status(404).json({ error: "Not found" });
    res.json(route);
  } catch (err) {
    console.error("GET /admin/routes/:routeId error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.put("/admin/routes/:routeId", async (req, res) => {
  try {
    const upd = await RouteModel.findOneAndUpdate({ routeId: req.params.routeId }, req.body, { new: true });
    if (!upd) return res.status(404).json({ error: "Not found" });
    res.json(upd);
  } catch (err) {
    console.error("PUT /admin/routes/:routeId error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.delete("/admin/routes/:routeId", async (req, res) => {
  try {
    const del = await RouteModel.findOneAndDelete({ routeId: req.params.routeId });
    if (!del) return res.status(404).json({ error: "Not found" });
    // optionally cascade delete stops
    await StopModel.deleteMany({ routeId: req.params.routeId });
    res.json({ ok: true });
  } catch (err) {
    console.error("DELETE /admin/routes/:routeId error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// STOPS CRUD
router.post("/admin/stops", async (req, res) => {
  try {
    const { stopId, routeId, name_en, name_hi, name_pa, lat, lng, sequence } = req.body;
    if (!stopId || !routeId || !name_en || lat == null || lng == null || sequence == null) {
      return res.status(400).json({ error: "stopId, routeId, name_en, lat, lng, sequence are required" });
    }
    const created = await StopModel.create({
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
    if (err.code === 11000) return res.status(409).json({ error: "stopId already exists" });
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/admin/stops", async (req, res) => {
  try {
    const { routeId } = req.query;
    const q = routeId ? { routeId } : {};
    const list = await StopModel.find(q).sort({ routeId: 1, sequence: 1 }).lean();
    res.json(list);
  } catch (err) {
    console.error("GET /admin/stops error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/admin/stops/:stopId", async (req, res) => {
  try {
    const stop = await StopModel.findOne({ stopId: req.params.stopId }).lean();
    if (!stop) return res.status(404).json({ error: "Not found" });
    res.json(stop);
  } catch (err) {
    console.error("GET /admin/stops/:stopId error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.put("/admin/stops/:stopId", async (req, res) => {
  try {
    const upd = await StopModel.findOneAndUpdate({ stopId: req.params.stopId }, req.body, { new: true });
    if (!upd) return res.status(404).json({ error: "Not found" });
    res.json(upd);
  } catch (err) {
    console.error("PUT /admin/stops/:stopId error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.delete("/admin/stops/:stopId", async (req, res) => {
  try {
    const del = await StopModel.findOneAndDelete({ stopId: req.params.stopId });
    if (!del) return res.status(404).json({ error: "Not found" });
    res.json({ ok: true });
  } catch (err) {
    console.error("DELETE /admin/stops/:stopId error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
