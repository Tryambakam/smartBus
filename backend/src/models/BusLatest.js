const mongoose = require("mongoose");

const BusLatestSchema = new mongoose.Schema(
  {
    busId: { type: String, required: true, unique: true, index: true },

    // Optional route mapping (helps filtering + ETA)
    routeId: { type: String, default: "" },

    lat: { type: Number, required: true },
    lng: { type: Number, required: true },
    busStatus: { 
      type: String, 
      default: "On Route", 
      enum: ["On Route", "Stopped", "Out of Service"] 
    },
    occupancy: {
      type: String,
      default: "Low",
      enum: ["Low", "Medium", "High"]
    },

    // GeoJSON point for spatial queries
    location: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point",
      },
      coordinates: { type: [Number], default: [0, 0] }, // [lng, lat]
    },

    speed: { type: Number, default: 0 },
    timestamp: { type: Date, default: Date.now },
  },
  { versionKey: false }
);

// 2dsphere for spatial queries
BusLatestSchema.index({ location: "2dsphere" });

// TTL: remove records older than 10 minutes (600s)
BusLatestSchema.index({ timestamp: 1 }, { expireAfterSeconds: 600 });

module.exports = mongoose.model("BusLatest", BusLatestSchema);
