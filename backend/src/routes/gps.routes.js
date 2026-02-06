const express = require("express");
const router = express.Router();
const { updateGps } = require("../controllers/gps.controller");

router.post("/gps/update", updateGps);

module.exports = router;
