const express = require("express");
const router = express.Router();
const { updateGps } = require("../controllers/gps.controller");

// POST /api/gps/update
router.post("/gps/update", updateGps);

module.exports = router;
