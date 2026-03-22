const express = require("express");
const router = express.Router();

const RouteModel = require("../models/Route");
const StopModel = require("../models/Stop");
const User = require("../models/User");
const bcrypt = require("bcrypt");
const { requireAuth, requireRole } = require("../middleware/auth");

router.use("/admin", requireAuth, requireRole("admin"));

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

// USERS CRUD
router.get("/admin/users", async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const users = await User.find().select("-passwordHash").sort({ createdAt: -1 }).skip(skip).limit(limit).lean();
    const total = await User.countDocuments();
    res.json({ users, total, page, pages: Math.ceil(total / limit) });
  } catch (err) {
    console.error("GET /admin/users error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/admin/users", async (req, res) => {
  try {
    const { username, role, password } = req.body;
    if (!username || !role || !password) return res.status(400).json({ error: "username, role, and password required" });
    
    const existing = await User.findOne({ username: String(username).toLowerCase().trim() }).lean();
    if (existing) return res.status(409).json({ error: "Username already exists" });

    const passwordHash = await bcrypt.hash(String(password), 10);
    const created = await User.create({
      username: String(username).toLowerCase().trim(),
      role,
      passwordHash,
      busId: req.body.busId || ""
    });
    
    res.status(201).json({ _id: created._id, username: created.username, role: created.role, busId: created.busId });
  } catch (err) {
    console.error("POST /admin/users error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.put("/admin/users/:id", async (req, res) => {
  try {
    const { username, role, password } = req.body;
    const updates = {};
    if (username) updates.username = String(username).toLowerCase().trim();
    if (role) updates.role = role;
    if (password) updates.passwordHash = await bcrypt.hash(String(password), 10);
    if (req.body.busId !== undefined) updates.busId = String(req.body.busId).trim();

    const upd = await User.findByIdAndUpdate(req.params.id, updates, { new: true }).select("-passwordHash");
    if (!upd) return res.status(404).json({ error: "Not found" });
    res.json(upd);
  } catch (err) {
    console.error("PUT /admin/users/:id error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.delete("/admin/users/:id", async (req, res) => {
  try {
    const del = await User.findByIdAndDelete(req.params.id);
    if (!del) return res.status(404).json({ error: "Not found" });
    res.json({ ok: true });
  } catch (err) {
    console.error("DELETE /admin/users/:id error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
