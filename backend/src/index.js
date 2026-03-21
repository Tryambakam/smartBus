// backend/src/index.js
require("dotenv").config();

const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const http = require("http");
const { Server } = require("socket.io");

const connectDB = require("./db");
const { startMockStream } = require("./utils/mockSocketServer");

// Route modules
const busRoutes = require("./routes/bus.routes");
const gpsRoutes = require("./routes/gps.routes");
const routesRoutes = require("./routes/routes.routes");
const adminRoutes = require("./routes/admin.routes");
const etaRoutes = require("./routes/eta.routes");
const authRoutes = require("./routes/auth.routes");

const app = express();

/* =======================
   Global Middlewares
   ======================= */
app.use(cors({
  origin: process.env.CLIENT_ORIGIN || "http://localhost:5173",
  credentials: true,
}));
app.use(cookieParser());
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
app.use("/api", busRoutes);     // GET /api/buses/live, etc
app.use("/api", routesRoutes);  // GET /api/routes, GET /api/routes/:routeId/stops
app.use("/api", adminRoutes);   // POST /api/admin/routes, POST /api/admin/stops
app.use("/api", etaRoutes);     // GET /api/bus/:busId/eta
app.use("/api", authRoutes);    // POST /api/auth/login, GET /api/auth/me

/* =======================
   Start Server after DB
   ======================= */
const PORT = process.env.PORT || 3000;

connectDB()
  .then(() => {
    // create http server and attach socket.io
    const server = http.createServer(app);
    const io = new Server(server, {
      cors: {
        origin: process.env.CLIENT_ORIGIN || "*",
        methods: ["GET", "POST"],
      },
    });

    // attach io for controllers to use
    app.locals.io = io;

    // Boot mock simulator
    startMockStream(io);

    io.on("connection", (socket) => {
      console.log("🔌 Socket connected:", socket.id);

      socket.on("disconnect", (reason) => {
        console.log("🔌 Socket disconnected:", socket.id, reason);
      });
    });

    server.listen(PORT, () => {
      console.log(`✅ Server + Socket.IO running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error("❌ MongoDB connection failed:", err.message);
    process.exit(1);
  });
