const mongoose = require("mongoose");

const BusLatestSchema = new mongoose.Schema(
  {
    busId: { type: String, required: true, unique: true, index: true },
    lat: { type: Number, required: true },
    lng: { type: Number, required: true },
    speed: { type: Number, default: 0 },
    timestamp: { type: Date, default: Date.now },
  },
  { versionKey: false }
);

module.exports = mongoose.model("BusLatest", BusLatestSchema);
