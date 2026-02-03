const express = require("express");
const { z } = require("zod");
const Route = require("../models/Route");
const Stop = require("../models/Stop");

const router = express.Router();

const routeSchema = z.object({
  routeId: z.string().min(1),
  name: z.string().min(1),
  city: z.string().optional(),
});

const stopSchema = z.object({
  stopId: z.string().min(1),
  routeId: z.string().min(1),
  name_en: z.string().min(1),
  name_hi: z.string().optional(),
  name_pa: z.string().optional(),
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
  sequence: z.number().int().min(1),
});

// POST /api/admin/routes
router.post("/admin/routes", async (req, res) => {
  const parsed = routeSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

  const doc = await Route.create(parsed.data);
  res.status(201).json(doc);
});

// POST /api/admin/stops
router.post("/admin/stops", async (req, res) => {
  const parsed = stopSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

  const doc = await Stop.create(parsed.data);
  res.status(201).json(doc);
});

module.exports = router;
