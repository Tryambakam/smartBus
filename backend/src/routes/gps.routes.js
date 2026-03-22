const express = require("express");
const router = express.Router();
const { updateGps } = require("../controllers/gps.controller");
const { requireAuth, requireRole } = require("../middleware/auth");

// authenticated users with valid active roles can update GPS
router.post("/gps/update", requireAuth, requireRole("operator", "admin"), updateGps);

module.exports = router;
