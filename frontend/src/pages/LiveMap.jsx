import { useEffect, useMemo, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, CircleMarker } from "react-leaflet";
import { Link } from "react-router-dom";
import L from "leaflet";

import GovHeader from "../components/GovHeader";
import { getLiveBuses, getRoutes, getStops } from "../api";

// Fix Leaflet marker icons (Vite/React)
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

export default function LiveMap() {
  const [busQuery, setBusQuery] = useState("");
  const [selectedBusId, setSelectedBusId] = useState(null);

  const [buses, setBuses] = useState([]);
  const [routes, setRoutes] = useState([]);
  const [selectedRouteId, setSelectedRouteId] = useState("");
  const [stops, setStops] = useState([]);
  const [status, setStatus] = useState("Loading…");
  const [error, setError] = useState("");

  // Load routes once
  useEffect(() => {
    (async () => {
      try {
        setError("");
        const data = await getRoutes();
        const list = Array.isArray(data) ? data : [];
        setRoutes(list);

        if (list.length > 0) setSelectedRouteId(list[0].routeId);
      } catch (e) {
        setError(`Routes not available: ${e.message}`);
      }
    })();
  }, []);

  // Load stops when route changes
  useEffect(() => {
    if (!selectedRouteId) {
      setStops([]);
      return;
    }
    (async () => {
      try {
        setError("");
        const data = await getStops(selectedRouteId);
        setStops(Array.isArray(data) ? data : []);
      } catch (e) {
        setStops([]);
        setError(`Stops not available: ${e.message}`);
      }
    })();
  }, [selectedRouteId]);

  // Poll buses every 5 seconds
  useEffect(() => {
    let timer;

    async function load() {
      try {
        setError("");
        const data = await getLiveBuses();
        setBuses(Array.isArray(data) ? data : []);
        setStatus(`Last sync: ${new Date().toLocaleTimeString()}`);
      } catch (e) {
        setError(`Live buses fetch failed: ${e.message}`);
        setStatus("Backend unreachable");
      }
    }

    load();
    timer = setInterval(load, 5000);
    return () => clearInterval(timer);
  }, []);

  // Filter buses by selected route if bus objects include routeId
  const visibleBuses = useMemo(() => {
    if (!selectedRouteId) return buses;
    const anyRouteIdPresent = buses.some((b) => b.routeId);
    if (!anyRouteIdPresent) return buses; // fallback (until you add routeId to buses)
    return buses.filter((b) => b.routeId === selectedRouteId);
  }, [buses, selectedRouteId]);

  // Center map using first stop if available
  const mapCenter = useMemo(() => {
    if (stops.length > 0) return [stops[0].lat, stops[0].lng];
    return [30.7333, 76.7794];
  }, [stops]);

  // Header status lights
  const backendOk = !String(error).toLowerCase().includes("failed to fetch");
  const lastSyncText = status || `Last sync: ${new Date().toLocaleTimeString()}`;

  return (
    <div className="gov-shell">
      <GovHeader lastSyncText={lastSyncText} backendOk={backendOk} />
      <div
        style={{
          background: "#eef2ff",
          borderBottom: "1px solid #c7d2fe",
          padding: "8px 16px",
          fontSize: 12,
          color: "#1e3a8a",
        }}
>
        ℹ️ This system displays live bus location data for public information purposes.
        </div>


      <main className="gov-main">
        {/* Left panel */}
        <section className="card left-panel">
          <div className="card-h">
            <div className="h">Controls</div>
            <div className="muted">Route & display</div>
          </div>
          <div className="card-b">
            <div className="label">Select Route</div>
            <select
              className="select"
              value={selectedRouteId}
              onChange={(e) => setSelectedRouteId(e.target.value)}
            >
              {routes.length === 0 ? (
                <option value="">
                  No routes configured by authority
                </option>

              ) : (
                routes.map((r) => (
                  <option key={r.routeId} value={r.routeId}>
                    {r.routeId} — {r.name}
                  </option>
                ))
              )}
            </select>

            <div className="divider" />

            <div className="row">
              <button className="btn" onClick={() => window.location.reload()}>
                Refresh
              </button>
              <button
                className="select"
                style={{ cursor: "pointer" }}
                onClick={() => alert("Admin module will be added later")}
              >
                Admin
              </button>
            </div>

            <div className="divider" />

            <div className="muted">
              Stops: <b>{stops.length}</b> · Buses: <b>{visibleBuses.length}</b>
            </div>

            {error && (
              <div style={{ marginTop: 10, color: "#b91c1c", fontSize: 12 }}>
                {error}
              </div>
            )}

            <div className="divider" />

            <div className="label">Legend</div>
            <div className="muted">● Stops (blue circle) · 📍 Bus (marker)</div>
          </div>
          
        </section>

        {/* Map */}
        <section className="card map-card">
          <div className="card-h">
            <div className="h">Live Map</div>
            <div className="muted">Interactive tracking</div>
          </div>

          <div className="map-wrap">
            <MapContainer center={mapCenter} zoom={13} style={{ height: "100%", width: "100%" }}>
              <TileLayer
                attribution="&copy; OpenStreetMap contributors"
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />

              {/* Stops */}
              {stops.map((s) => (
                <CircleMarker key={s.stopId} center={[s.lat, s.lng]} radius={6}>
                  <Popup>
                    <div>
                      <div style={{ fontWeight: 800 }}>
                        {s.stopId} (#{s.sequence})
                      </div>
                      <div>{s.name_en}</div>
                      <div style={{ fontSize: 12, opacity: 0.7 }}>{s.routeId}</div>
                    </div>
                  </Popup>
                </CircleMarker>
              ))}

              {/* Buses */}
              {visibleBuses.map((b) => (
                  <Marker
                    key={b.busId}
                    position={[b.lat, b.lng]}
                    opacity={selectedBusId && b.busId !== selectedBusId ? 0.5 : 1}>
                  <Popup>
                    <div>
                      <div style={{ fontWeight: 800 }}>{b.busId}</div>
                      {b.routeId && <div>Route: {b.routeId}</div>}
                      <div>Speed: {b.speed ?? 0}</div>
                      <div>
                        Last:{" "}
                        {b.timestamp ? new Date(b.timestamp).toLocaleString() : "N/A"}
                      </div>
                      <div style={{ marginTop: 8 }}>
                        <Link to={`/bus/${encodeURIComponent(b.busId)}`}>
                          Open details →
                        </Link>
                      </div>
                    </div>
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
          </div>
        </section>

        {/* Right panel */}
        <section className="card right-panel">
          <div className="card-h">
            <div className="h">Live Buses</div>
            <div className="muted">Click bus to view</div>
          </div>
          <div className="card-b">
            <div className="list">
              {visibleBuses.slice(0, 12).map((b) => (
                <div
                  key={b.busId}
                  className="item"
                  style={{
                    borderColor: b.busId === selectedBusId ? "#0b4ea2" : undefined
                  }}
                  onClick={() => setSelectedBusId(b.busId)}>
                  <div>
                    <b>{b.busId}</b>
                    <div className="kv">Speed: {b.speed ?? 0}</div>
                    <div className="kv">
                      Last: {b.timestamp ? new Date(b.timestamp).toLocaleTimeString() : "N/A"}
                    </div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center" }}>
                    <Link to={`/bus/${encodeURIComponent(b.busId)}`}>Open →</Link>
                  </div>
                </div>
              ))}

              {visibleBuses.length === 0 && (
                <div className="muted">
                 Auto-refresh every 5 seconds
                </div>

              )}

            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
