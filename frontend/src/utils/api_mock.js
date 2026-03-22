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

    // Generic defaults
    if (url.includes('/api/buses/live')) return jsonRes([]);
    if (url.includes('/api/routes')) return jsonRes([]);

    return originalFetch(...args);
  };
}
