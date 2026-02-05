const mongoose = require("mongoose");

const RouteSchema = new mongoose.Schema(
  {
    routeId: { type: String, required: true, unique: true, index: true }, // e.g. R-CHD-01
    name: { type: String, required: true },                               // e.g. "Sector 17 to Mohali"
    city: { type: String, default: "" },
  },
  { timestamps: true, versionKey: false }
);

module.exports = mongoose.model("Route", RouteSchema);
