const mongoose = require("mongoose");

const BusLogSchema = new mongoose.Schema(
  {
    busId: { type: String, required: true, index: true },
    routeId: { type: String, default: "", index: true },

    lat: { type: Number, required: true },
    lng: { type: Number, required: true },
    busStatus: { type: String, default: "On Route" },
    occupancy: { type: String, default: "Low" },
    speed: { type: Number, default: 0 },
    
    // Geographical queries index if needed for analytics
    location: {
      type: { type: String, enum: ["Point"], default: "Point" },
      coordinates: { type: [Number], default: [0, 0] },
    },
    
    timestamp: { type: Date, default: Date.now, index: true },
  },
  { versionKey: false }
);

BusLogSchema.index({ location: "2dsphere" });

module.exports = mongoose.model("BusLog", BusLogSchema);
