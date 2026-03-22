export const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:3000";

export function getAuthToken() {
  // Deprecated: React no longer parses the token, it lives in a native httpOnly Cookie.
  // We return a dummy standard if strictly needed for layout comparisons.
  return "cookie-managed";
}

export async function clearSession() {
  try {
    localStorage.removeItem("smartbus_user");
    await fetch(`${API_BASE}/api/auth/logout`, { method: "POST", credentials: "include" });
  } catch {
    // ignore
  }
}

export function authHeaders(extra = {}) {
  return { ...extra };
}

// Helper wrapper to enforce native Cookie exchanges over the network
export async function apiFetch(endpoint, options = {}) {
  const res = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers: { ...options.headers },
    credentials: "include" // Forces the browser to send httpOnly cookies
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(text || `${endpoint} failed: ${res.status}`);
  }
  return res.json();
}

async function handle(res, label) {
  if (!res.ok) throw new Error(`${label} failed: ${res.status}`);
  return res.json();
}

export async function getBusEta(busId) {
  return apiFetch(`/api/bus/${encodeURIComponent(busId)}/eta`, { headers: authHeaders() });
}

export function getLiveBuses() {
  return apiFetch(`/api/buses/live`, { headers: authHeaders() });
}

export function getRoutes() {
  return apiFetch(`/api/routes`, { headers: authHeaders() });
}

export function getStops(routeId) {
  return apiFetch(`/api/routes/${routeId}/stops`, { headers: authHeaders() });
}

export function getBusLatest(busId) {
  return apiFetch(`/api/bus/${busId}/latest`, { headers: authHeaders() });
}

export async function listRoutes() {
  return apiFetch(`/api/admin/routes`, { headers: authHeaders() });
}
export async function createRoute(payload) {
  return apiFetch(`/api/admin/routes`, {
    method: "POST",
    headers: authHeaders({ "Content-Type": "application/json" }),
    body: JSON.stringify(payload),
  });
}
export async function updateRoute(routeId, payload) {
  return apiFetch(`/api/admin/routes/${encodeURIComponent(routeId)}`, {
    method: "PUT",
    headers: authHeaders({ "Content-Type": "application/json" }),
    body: JSON.stringify(payload),
  });
}
export async function deleteRoute(routeId) {
  return apiFetch(`/api/admin/routes/${encodeURIComponent(routeId)}`, {
    method: "DELETE",
    headers: authHeaders(),
  });
}

export async function listStops(routeId) {
  const q = routeId ? `?routeId=${encodeURIComponent(routeId)}` : "";
  return apiFetch(`/api/admin/stops${q}`, { headers: authHeaders() });
}
export async function createStop(payload) {
  return apiFetch(`/api/admin/stops`, {
    method: "POST",
    headers: authHeaders({ "Content-Type": "application/json" }),
    body: JSON.stringify(payload),
  });
}
export async function updateStop(stopId, payload) {
  return apiFetch(`/api/admin/stops/${encodeURIComponent(stopId)}`, {
    method: "PUT",
    headers: authHeaders({ "Content-Type": "application/json" }),
    body: JSON.stringify(payload),
  });
}
export async function deleteStop(stopId) {
  return apiFetch(`/api/admin/stops/${encodeURIComponent(stopId)}`, {
    method: "DELETE"
  });
}

// User Admin Logic
export async function listUsers(page = 1, limit = 10) {
  return apiFetch(`/api/admin/users?page=${page}&limit=${limit}`);
}
export async function createUser(payload) {
  return apiFetch(`/api/admin/users`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
}
export async function updateUser(id, payload) {
  return apiFetch(`/api/admin/users/${encodeURIComponent(id)}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
}
export async function deleteUser(id) {
  return apiFetch(`/api/admin/users/${encodeURIComponent(id)}`, {
    method: "DELETE"
  });
}
