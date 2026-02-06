// backend/src/index.js
require("dotenv").config();

const express = require("express");
const cors = require("cors");

const connectDB = require("./db");

// Route modules
const busRoutes = require("./routes/bus.routes");
const gpsRoutes = require("./routes/gps.routes");
const routesRoutes = require("./routes/routes.routes");
const adminRoutes = require("./routes/admin.routes");
const etaRoutes = require("./routes/eta.routes");

const app = express();

/* =======================
   Global Middlewares
   ======================= */
app.use(cors());
app.use(express.json({ limit: "100kb" }));

/* =======================
   Health Check
   ======================= */
app.get("/api/health", (req, res) => {
  res.json({ ok: true, message: "Backend is running" });
});

/* =======================
   API Routes
   ======================= */
app.use("/api", gpsRoutes);     // POST /api/gps/update
app.use("/api", busRoutes);     // GET /api/buses/live, etc (whatever you defined there)
app.use("/api", routesRoutes);  // GET /api/routes, GET /api/routes/:routeId/stops
app.use("/api", adminRoutes);   // POST /api/admin/routes, POST /api/admin/stops
app.use("/api", etaRoutes);     // GET /api/bus/:busId/eta

/* =======================
   Start Server after DB
   ======================= */
const PORT = process.env.PORT || 3000;

connectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`✅ Server running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error("❌ MongoDB connection failed:", err.message);
    process.exit(1);
  });
