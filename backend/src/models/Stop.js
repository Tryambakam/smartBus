const mongoose = require("mongoose");

const StopSchema = new mongoose.Schema(
  {
    stopId: { type: String, required: true, unique: true, index: true }, // S-001
    routeId: { type: String, required: true, index: true },             // R-CHD-01

    name_en: { type: String, required: true },
    name_hi: { type: String, default: "" },
    name_pa: { type: String, default: "" },

    lat: { type: Number, required: true },
    lng: { type: Number, required: true },

    sequence: { type: Number, required: true }, // 1..n
  },
  { timestamps: true, versionKey: false }
);

module.exports = mongoose.model("Stop", StopSchema);
