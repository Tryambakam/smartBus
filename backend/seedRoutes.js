const mongoose = require("mongoose");
require("dotenv").config();

const routeSchema = new mongoose.Schema({
  routeId: String,
  name: String,
  agency: String,
  isActive: Boolean,
});

const stopSchema = new mongoose.Schema({
  stopId: String,
  routeId: String,
  name_en: String,
  lat: Number,
  lng: Number,
  sequence: Number,
});

const BusLatest = require("./src/models/BusLatest");

// Avoid redeclaring models if they exist
const Route = mongoose.models.Route || mongoose.model("Route", routeSchema);
const Stop = mongoose.models.Stop || mongoose.model("Stop", stopSchema);

async function seed() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log("Connected to MongoDB for Routing Seed...");

  // Clear legacy Demo Topologies
  await Route.deleteMany({});
  await Stop.deleteMany({});
  await Location.deleteMany({});

  // 1. Generate Multiple Intercity Routes
  const newRoutes = [
    { routeId: "CHD-LDH", name: "Chandigarh to Ludhiana", agency: "Demo Transit", isActive: true },
    { routeId: "CHD-JAL", name: "Chandigarh to Jalandhar", agency: "Demo Transit", isActive: true },
    { routeId: "CHD-DEL", name: "Chandigarh to Delhi", agency: "Demo Transit", isActive: true },
  ];
  await Route.insertMany(newRoutes);
  
  // 2. Generate Dense Stop Maps
  const stops = [
    // CHD-LDH
    { stopId: "S-100", routeId: "CHD-LDH", name_en: "Sector 43 ISBT", lat: 30.7242, lng: 76.7570, sequence: 1 },
    { stopId: "S-101", routeId: "CHD-LDH", name_en: "Mohali Bypass", lat: 30.7042, lng: 76.7170, sequence: 2 },
    { stopId: "S-102", routeId: "CHD-LDH", name_en: "Kharar Highway", lat: 30.7420, lng: 76.6500, sequence: 3 },
    { stopId: "S-103", routeId: "CHD-LDH", name_en: "Ludhiana Bus Stand", lat: 30.9009, lng: 75.8572, sequence: 4 },

    // CHD-DEL
    { stopId: "S-200", routeId: "CHD-DEL", name_en: "Sector 17 Plaza", lat: 30.7414, lng: 76.7820, sequence: 1 },
    { stopId: "S-201", routeId: "CHD-DEL", name_en: "Zirakpur Flyover", lat: 30.6420, lng: 76.8160, sequence: 2 },
    { stopId: "S-202", routeId: "CHD-DEL", name_en: "Ambala City Route", lat: 30.3781, lng: 76.7766, sequence: 3 },
    { stopId: "S-203", routeId: "CHD-DEL", name_en: "Kashmere Gate ISBT", lat: 28.6665, lng: 77.2280, sequence: 4 }
  ];
  await Stop.insertMany(stops);

  // 3. Generate Active & Stopped Grid Vehicles
  await BusLatest.deleteMany({});
  const buses = [
    {
      busId: "BUS-101",
      routeId: "CHD-LDH",
      lat: 30.7142,
      lng: 76.7370,
      speed: 65.5,
      heading: 270,
      busStatus: "On Route",
      location: { type: "Point", coordinates: [76.7370, 30.7142] },
      timestamp: new Date()
    },
    {
      busId: "BUS-102",
      routeId: "CHD-DEL",
      lat: 30.6420,
      lng: 76.8160,
      speed: 0,
      heading: 180,
      busStatus: "Stopped",
      location: { type: "Point", coordinates: [76.8160, 30.6420] },
      timestamp: new Date()
    },
    {
      busId: "BUS-103",
      routeId: "CHD-DEL",
      lat: 29.5000,
      lng: 77.0000,
      speed: 82.1,
      heading: 185,
      busStatus: "On Route",
      location: { type: "Point", coordinates: [77.0000, 29.5000] },
      timestamp: new Date()
    }
  ];
  await BusLatest.insertMany(buses);

  console.log("Successfully seeded 3 High-Density Routes, 8 Geocoordinate Stops, and 3 Live Fleet units!");
  mongoose.disconnect();
}

seed().catch(console.error);
