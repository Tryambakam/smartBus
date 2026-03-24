export function enableMockBackend() {
  const originalFetch = window.fetch;

  window.fetch = async (...args) => {
    const url = typeof args[0] === 'string' ? args[0] : args[0]?.url;
    const mockToken = localStorage.getItem('mock_jwt_token');

    // If no mock token exists, resume normal backend communication
    if (!mockToken) {
      return originalFetch(...args);
    }

    // Decode fake JWT
    let role = 'commuter';
    let userId = 'mock-000';
    try {
      const payload = JSON.parse(atob(mockToken.split('.')[1]));
      role = payload.role;
      userId = payload.userId;
    } catch (e) {
      console.warn("Invalid Mock JWT processed");
    }

    const jsonRes = (data, status = 200) => new Response(JSON.stringify(data), {
      status,
      headers: { 'Content-Type': 'application/json' }
    });

    if (url.includes('/api/auth/me')) {
      return jsonRes({ ok: true, user: { id: userId, username: `demo_${role}`, role: role, busId: role === "operator" ? "BUS-101" : "" } });
    }
    
    if (url.includes('/api/auth/logout')) {
      localStorage.removeItem('mock_jwt_token');
      return jsonRes({ ok: true });
    }

    if (url.includes('/api/admin')) {
      if (role !== 'admin') return jsonRes({ error: "Forbidden" }, 403);
      if (url.includes('/routes')) return jsonRes([{ routeId: "MOCK-1", name: "Simulated Mainline Route" }]);
      if (url.includes('/stops')) return jsonRes([{ stopId: "S-101", name_en: "Mock Sandbox Station", sequence: 1, lat: 30.9, lng: 75.8 }]);
      if (url.includes('/users')) return jsonRes({ 
        users: [
          { _id: "u1", username: "admin", role: "admin" },
          { _id: "u2", username: "bus101", role: "operator" },
          { _id: "u3", username: "user", role: "commuter" }
        ], 
        total: 3, page: 1, pages: 1 
      });
      return jsonRes({ ok: true });
    }

    if (url.includes('/api/gps/update')) {
      if (role !== 'operator' && role !== 'admin') return jsonRes({ error: "Forbidden" }, 403);
      return jsonRes({ ok: true, status: "Simulated GPS Received Locally" });
    }

    // Simulation arrays for Public Dashboard Live Map overriding empty responses
    if (url.includes('/api/buses/live')) {
      return jsonRes([{
        busId: "BUS-101",
        routeId: "CHD-LDH",
        lat: 30.7450,
        lng: 76.7850,
        speed: 45.5,
        heading: 120,
        busStatus: "On Route",
        occupancy: "Low",
        timestamp: new Date().toISOString()
      }]);
    }
    
    if (url.includes('/api/routes')) {
      if (url.includes('/stops')) {
        return jsonRes([
          { stopId: "S-1", routeId: "R-100", name_en: "Sector 17 Plaza", lat: 30.7414, lng: 76.7820, sequence: 1 },
          { stopId: "S-2", routeId: "R-100", name_en: "Rose Garden", lat: 30.7475, lng: 76.7865, sequence: 2 },
          { stopId: "S-3", routeId: "R-100", name_en: "Rock Garden", lat: 30.7525, lng: 76.8080, sequence: 3 },
          { stopId: "S-4", routeId: "R-100", name_en: "Sukhna Lake", lat: 30.7421, lng: 76.8188, sequence: 4 }
        ]);
      }
      return jsonRes([{ routeId: "CHD-LDH", name: "Chandigarh to Ludhiana (CHD-LDH)", agency: "Demo Transit", isActive: true }]);
    }

    // Isolate component telemetry preventing 401 Auth Falls
    if (url.includes('/latest')) {
      return jsonRes({
        ok: true, data: {
          busId: "BUS-101", routeId: "CHD-LDH", lat: 30.7142, lng: 76.7370,
          speed: 65.5, heading: 270, busStatus: "On Route", timestamp: new Date().toISOString()
        }
      });
    }

    if (url.includes('/eta')) {
      return jsonRes({
        ok: true, busId: "BUS-101", routeId: "CHD-LDH", speedKmh: 65.5,
        calculatedAt: new Date().toISOString(),
        nextStops: [
          { stopId: "S-101", routeId: "CHD-LDH", name_en: "Mohali Bypass", sequence: 2, distanceKm: 2.1, etaMinutes: 2.5 },
          { stopId: "S-102", routeId: "CHD-LDH", name_en: "Kharar Highway", sequence: 3, distanceKm: 12.3, etaMinutes: 11.2 }
        ]
      });
    }

    return originalFetch(...args);
  };
}
