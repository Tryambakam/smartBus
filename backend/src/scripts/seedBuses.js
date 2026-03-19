require("dotenv").config();
const mongoose = require("mongoose");
const connectDB = require("../db");
const BusLatest = require("../models/BusLatest");

async function seedBuses() {
  await connectDB();
  
  console.log("Flushing existing generic buses...");
  await BusLatest.deleteMany({});
  
  const punjabBuses = [
    {
      busId: "PB-01-A-1234",
      routeId: "R-CHD-01",
      lat: 30.7333,
      lng: 76.7794,
      location: { type: "Point", coordinates: [76.7794, 30.7333] },
      speed: 45,
      timestamp: new Date()
    },
    {
      busId: "PB-02-BQ-9876",
      routeId: "R-CHD-01",
      lat: 30.7400,
      lng: 76.7800,
      location: { type: "Point", coordinates: [76.7800, 30.7400] },
      speed: 0,
      timestamp: new Date()
    },
    {
      busId: "PB-65-AK-4321", // Mohali Origin
      routeId: "R-CHD-01",
      lat: 30.7250,
      lng: 76.7700,
      location: { type: "Point", coordinates: [76.7700, 30.7250] },
      speed: 55,
      timestamp: new Date()
    },
    {
      busId: "PB-11-CF-5555", // Patiala Origin
      routeId: "R-CHD-01",
      lat: 30.7350,
      lng: 76.7750,
      location: { type: "Point", coordinates: [76.7750, 30.7350] },
      speed: 30,
      timestamp: new Date()
    },
    {
      busId: "PB-08-EQ-7777", // Jalandhar Origin
      routeId: "R-CHD-01",
      lat: 30.7500,
      lng: 76.7850,
      location: { type: "Point", coordinates: [76.7850, 30.7500] },
      speed: 60,
      timestamp: new Date()
    }
  ];

  await BusLatest.insertMany(punjabBuses);
  console.log("✅ Seeded 5 Punjab Demo Buses successfully. (PB-01, PB-02, PB-65, PB-11, PB-08)");
  process.exit(0);
}

seedBuses().catch(err => {
  console.error("❌ Seeding failed:", err);
  process.exit(1);
});
