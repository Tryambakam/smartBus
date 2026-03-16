const express = require("express");
const router = express.Router();
const { updateGps } = require("../controllers/gps.controller");
const { requireAuth } = require("../middleware/auth");

// authenticated users can update GPS (no role-based access)
router.post("/gps/update", requireAuth, updateGps);

module.exports = router;
