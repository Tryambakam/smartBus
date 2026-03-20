const BusLatest = require("../models/BusLatest");

let activeBuses = [];

async function initMockData() {
  try {
    const buses = await BusLatest.find({}).lean();
    if (buses.length > 0) {
      activeBuses = buses.map(b => {
        const occs = ["Low", "Medium", "High"];
        return {
          ...b,
          speed: b.speed || 0,
          heading: Math.floor(Math.random() * 360),
          nextStop: "Mocking location...",
          occupancy: occs[Math.floor(Math.random() * occs.length)]
        };
      });
      console.log(`[Socket Mock] Initialized ${activeBuses.length} buses for simulation.`);
    }
  } catch (err) {
    console.error("[Socket Mock] Init error:", err);
  }
}

function startMockStream(io) {
  // Read DB seeds on boot
  initMockData();

  // Tick every 5 seconds
  setInterval(() => {
    if (!activeBuses || activeBuses.length === 0) return;

    activeBuses = activeBuses.map((b) => {
      // Unassigned buses remain stationary
      if (!b.routeId) return b;

      const isMoving = Math.random() > 0.15;
      let newSpeed = 0;
      let newLat = b.lat;
      let newLng = b.lng;
      let newHeading = b.heading;
      let nextStop = b.nextStop;
      
      let occ = b.occupancy || "Low";
      if (Math.random() > 0.9) { // 10% chance to organically shift occupancy
         const occs = ["Low", "Medium", "High"];
         occ = occs[Math.floor(Math.random() * occs.length)];
      }

      if (isMoving) {
        newSpeed = Math.floor(Math.random() * 40) + 10;
        
        // Random drift vector
        const dLat = (Math.random() - 0.5) * 0.0012;
        const dLng = (Math.random() - 0.5) * 0.0012;
        
        newLat += dLat;
        newLng += dLng;

        // Calculate heading (atan2(dx, dy) mapping to North=0, East=90)
        let angle = (Math.atan2(dLng, dLat) * 180) / Math.PI;
        if (angle < 0) angle += 360;
        newHeading = Math.round(angle);

        // Subtly rotate through mocked stops based on angle quadrant
        if (newHeading >= 0 && newHeading < 90) nextStop = "Sector 17 ISBT";
        else if (newHeading >= 90 && newHeading < 180) nextStop = "PU Campus";
        else if (newHeading >= 180 && newHeading < 270) nextStop = "PGI Hospital";
        else nextStop = "Mohali Phase 6";
      }

      return {
        ...b,
        lat: newLat,
        lng: newLng,
        speed: newSpeed,
        heading: newHeading,
        nextStop: nextStop,
        occupancy: occ,
        timestamp: new Date()
      };
    });

    // Blast payload to all socket subscribers
    io.emit("busesStream", activeBuses);
  }, 5000);
}

module.exports = { startMockStream };
