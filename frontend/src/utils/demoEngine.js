// frontend/src/utils/demoEngine.js

// Hardcoded valid realistic coordinates representing paths
const ROUTES = {
  "R-101": [
    { stopId: "S-101", sequence: 1, lat: 30.7333, lng: 76.7794, name_en: "Chandigarh ISBT" },
    { stopId: "S-102", sequence: 2, lat: 30.7250, lng: 76.7650, name_en: "Sector 34" },
    { stopId: "S-103", sequence: 3, lat: 30.7180, lng: 76.7550, name_en: "Sector 43" },
    { stopId: "S-104", sequence: 4, lat: 30.7100, lng: 76.7400, name_en: "Kajheri ISBT" },
    { stopId: "S-105", sequence: 5, lat: 30.7046, lng: 76.7179, name_en: "Mohali Phase 6" }
  ],
  "R-202": [
    { stopId: "S-201", sequence: 1, lat: 30.7046, lng: 76.7179, name_en: "Mohali Phase 6" },
    { stopId: "S-202", sequence: 2, lat: 30.7150, lng: 76.7250, name_en: "Phase 3B2" },
    { stopId: "S-203", sequence: 3, lat: 30.7280, lng: 76.7350, name_en: "Sector 39" },
    { stopId: "S-204", sequence: 4, lat: 30.7420, lng: 76.7500, name_en: "Sector 17" }
  ]
};

// Start times defined in minutes from Midnight. Cycle time equates to minutes per loop.
const BUSES = [
  { busId: "PB-01-A-1001", routeId: "R-101", startTimeMin: 6 * 60, cycleTimeMin: 90 },
  { busId: "PB-01-B-2002", routeId: "R-101", startTimeMin: 6 * 60 + 30, cycleTimeMin: 90 },
  { busId: "PB-65-C-3003", routeId: "R-202", startTimeMin: 7 * 60, cycleTimeMin: 75 },
  { busId: "PB-65-D-4004", routeId: "R-202", startTimeMin: 7 * 60 + 20, cycleTimeMin: 75 },
  { busId: "HR-03-E-5005", routeId: "R-101", startTimeMin: 8 * 60, cycleTimeMin: 90 }
];

export function getDemoScenario(simTimeMin) {
  const activeBuses = [];
  
  BUSES.forEach(b => {
    if (simTimeMin < b.startTimeMin) return; // Garage phase
    
    const runtime = simTimeMin - b.startTimeMin;
    const progress = (runtime % b.cycleTimeMin) / b.cycleTimeMin; // 0.0 to 1.0 over track
    
    const path = ROUTES[b.routeId];
    const totalSegments = path.length - 1;
    const exactSegment = progress * totalSegments;
    const currentSegmentIndex = Math.floor(exactSegment);
    const fraction = exactSegment - currentSegmentIndex;
    
    const p1 = path[currentSegmentIndex];
    const p2 = path[currentSegmentIndex + 1];
    
    let lat, lng, speed, heading, status;
    
    if (!p2) {
       // Terminus layover
       lat = p1.lat;
       lng = p1.lng;
       speed = 0;
       heading = 0;
       status = "Stopped";
    } else {
       lat = p1.lat + (p2.lat - p1.lat) * fraction;
       lng = p1.lng + (p2.lng - p1.lng) * fraction;
       speed = 35 + (Math.sin(simTimeMin) * 15); // Fluctuates naturally between 20-50 km/h
       status = "On Route";
       
       const x = p2.lng - p1.lng;
       const y = p2.lat - p1.lat;
       heading = (Math.atan2(x, y) * 180 / Math.PI);
    }
    
    // Real-world emulation filters:
    let occupancy = "Medium";
    if (simTimeMin > 8*60 && simTimeMin < 9*60 + 30) occupancy = "High"; // Peak commute
    else if (simTimeMin > 18*60 && simTimeMin < 19*60) occupancy = "High"; // Evening rush
    else if (simTimeMin > 11*60 && simTimeMin < 15*60) occupancy = "Low"; // Midday lull
    else if (simTimeMin < 7*60 || simTimeMin > 21*60) occupancy = "Low"; // Graveyard
    
    // Synthetic Disruption Logic (Accident at 08:30 on R-101)
    if (simTimeMin > 8*60 + 20 && simTimeMin < 8*60 + 40 && b.routeId === "R-101") {
      speed = 0;
      status = "Traffic Delay";
    }

    activeBuses.push({
      _id: b.busId, // Using busId dynamically for rendering loops
      busId: b.busId,
      lat,
      lng,
      routeId: b.routeId,
      speed: Math.round(speed),
      heading: Math.round(heading),
      busStatus: status,
      occupancy,
      timestamp: new Date().toISOString()
    });
  });
  
  return activeBuses;
}

export function getDemoRoutes() {
  return [
    { routeId: "R-101", name: "Chandigarh ISBT  ⇌  Mohali Phase 6" },
    { routeId: "R-202", name: "Mohali Phase 6  ⇌  Sector 17" }
  ];
}

export function getDemoStops(routeId) {
  return ROUTES[routeId] || [];
}
