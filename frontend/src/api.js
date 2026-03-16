export const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:3000";

export function getAuthToken() {
  try {
    return localStorage.getItem("smartbus_token") || "";
  } catch {
    return "";
  }
}

export function clearSession() {
  try {
    localStorage.removeItem("smartbus_token");
    localStorage.removeItem("smartbus_user");
  } catch {
    // ignore
  }
}

export function authHeaders(extra = {}) {
  const token = getAuthToken();
  return token ? { ...extra, Authorization: `Bearer ${token}` } : { ...extra };
}

async function handle(res, label) {
  if (!res.ok) throw new Error(`${label} failed: ${res.status}`);
  return res.json();
}

export async function getBusEta(busId) {
  const res = await fetch(`${API_BASE}/api/bus/${encodeURIComponent(busId)}/eta`, {
    headers: authHeaders(),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || "Failed to fetch ETA");
  }
  return res.json();
}

export function getLiveBuses() {
  return fetch(`${API_BASE}/api/buses/live`, { headers: authHeaders() }).then((r) => handle(r, "buses/live"));
}

export function getRoutes() {
  return fetch(`${API_BASE}/api/routes`, { headers: authHeaders() }).then((r) => handle(r, "routes"));
}

export function getStops(routeId) {
  return fetch(`${API_BASE}/api/routes/${routeId}/stops`, { headers: authHeaders() }).then((r) => handle(r, "stops"));
}

export function getBusLatest(busId) {
  return fetch(`${API_BASE}/api/bus/${busId}/latest`, { headers: authHeaders() }).then((r) => handle(r, "bus/latest"));
}

export async function listRoutes() {
  return fetch(`${API_BASE}/api/admin/routes`, { headers: authHeaders() }).then((r) => handle(r, "admin/routes"));
}
export async function createRoute(payload) {
  return fetch(`${API_BASE}/api/admin/routes`, {
    method: "POST",
    headers: authHeaders({ "Content-Type": "application/json" }),
    body: JSON.stringify(payload),
  }).then((r) => handle(r, "admin/routes:create"));
}
export async function updateRoute(routeId, payload) {
  return fetch(`${API_BASE}/api/admin/routes/${encodeURIComponent(routeId)}`, {
    method: "PUT",
    headers: authHeaders({ "Content-Type": "application/json" }),
    body: JSON.stringify(payload),
  }).then((r) => handle(r, "admin/routes:update"));
}
export async function deleteRoute(routeId) {
  return fetch(`${API_BASE}/api/admin/routes/${encodeURIComponent(routeId)}`, {
    method: "DELETE",
    headers: authHeaders(),
  }).then((r) => handle(r, "admin/routes:delete"));
}

export async function listStops(routeId) {
  const q = routeId ? `?routeId=${encodeURIComponent(routeId)}` : "";
  return fetch(`${API_BASE}/api/admin/stops${q}`, { headers: authHeaders() }).then((r) => handle(r, "admin/stops"));
}
export async function createStop(payload) {
  return fetch(`${API_BASE}/api/admin/stops`, {
    method: "POST",
    headers: authHeaders({ "Content-Type": "application/json" }),
    body: JSON.stringify(payload),
  }).then((r) => handle(r, "admin/stops:create"));
}
export async function updateStop(stopId, payload) {
  return fetch(`${API_BASE}/api/admin/stops/${encodeURIComponent(stopId)}`, {
    method: "PUT",
    headers: authHeaders({ "Content-Type": "application/json" }),
    body: JSON.stringify(payload),
  }).then((r) => handle(r, "admin/stops:update"));
}
export async function deleteStop(stopId) {
  return fetch(`${API_BASE}/api/admin/stops/${encodeURIComponent(stopId)}`, {
    method: "DELETE",
    headers: authHeaders(),
  }).then((r) => handle(r, "admin/stops:delete"));
}
