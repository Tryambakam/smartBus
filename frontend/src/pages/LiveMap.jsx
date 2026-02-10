import useTheme from "../hooks/useTheme";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { useEffect, useMemo, useRef, useState } from "react";
import { MapContainer, TileLayer, Popup, CircleMarker, Polyline } from "react-leaflet";
import { Link } from "react-router-dom";
import L from "leaflet";

import GovHeader from "../components/GovHeader";
import AlertsBar from "../components/AlertsBar";
import BusMarker from "../components/BusMarker";
import { getLiveBuses, getRoutes, getStops } from "../api";

// Fix Leaflet marker icons (for stops)
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

function normalizeList(payload) {
  if (Array.isArray(payload)) return payload;
  if (payload && Array.isArray(payload.data)) return payload.data;
  return [];
}

export default function LiveMap() {
  const { t } = useTranslation(); // (can use later; safe)
  const { theme, toggleTheme } = useTheme();

  const [busQuery, setBusQuery] = useState("");
  const [selectedBusId, setSelectedBusId] = useState(null);

  const [buses, setBuses] = useState([]);
  const [routes, setRoutes] = useState([]);
  const [selectedRouteId, setSelectedRouteId] = useState("");
  const [stops, setStops] = useState([]);

  const [status, setStatus] = useState("Loading…");

  const [routesError, setRoutesError] = useState("");
  const [stopsError, setStopsError] = useState("");
  const [busesError, setBusesError] = useState("");

  const [routesLoading, setRoutesLoading] = useState(true);
  const [stopsLoading, setStopsLoading] = useState(false);

  const [busesFirstLoad, setBusesFirstLoad] = useState(true);
  const [busesSyncing, setBusesSyncing] = useState(false);

  const mapRef = useRef(null);
  const busMarkerRefs = useRef({});

  // ---------------------------
  // Derived: route polyline
  // ---------------------------
  const routeLine = useMemo(() => {
    if (!stops || stops.length < 2) return [];
    const sorted = [...stops].sort((a, b) => (a.sequence ?? 0) - (b.sequence ?? 0));
    return sorted
      .filter((s) => typeof s.lat === "number" && typeof s.lng === "number")
      .map((s) => [s.lat, s.lng]);
  }, [stops]);

  // Derived: visible buses by route
  const visibleBuses = useMemo(() => {
    if (!selectedRouteId) return buses;
    const anyRouteIdPresent = buses.some((b) => b.routeId);
    if (!anyRouteIdPresent) return buses;
    return buses.filter((b) => b.routeId === selectedRouteId);
  }, [buses, selectedRouteId]);

  // Derived: search filter
  const filteredBuses = useMemo(() => {
    const q = busQuery.trim().toLowerCase();
    if (!q) return visibleBuses;
    return visibleBuses.filter((b) => String(b.busId || "").toLowerCase().includes(q));
  }, [visibleBuses, busQuery]);

  // Map center
  const mapCenter = useMemo(() => {
    if (stops.length > 0) return [stops[0].lat, stops[0].lng];
    return [30.7333, 76.7794];
  }, [stops]);

  // Header status
  const backendOk =
    !routesError && !stopsError && !busesError && !String(status).toLowerCase().includes("unreachable");

  // ---------------------------
  // Load routes once
  // ---------------------------
  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        setRoutesError("");
        setRoutesLoading(true);

        const res = await getRoutes();
        const list = normalizeList(res);

        if (cancelled) return;
        setRoutes(list);

        if (list.length > 0) setSelectedRouteId(list[0].routeId);
      } catch (e) {
        if (cancelled) return;
        setRoutes([]);
        setRoutesError(e?.message || "Failed to load routes");
      } finally {
        if (cancelled) return;
        setRoutesLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  // ---------------------------
  // Load stops when route changes
  // ---------------------------
  useEffect(() => {
    let cancelled = false;

    if (!selectedRouteId) {
      setStops([]);
      setStopsError("");
      return;
    }

    (async () => {
      try {
        setStopsError("");
        setStopsLoading(true);

        const res = await getStops(selectedRouteId);
        const list = normalizeList(res);

        if (cancelled) return;
        setStops(list);
      } catch (e) {
        if (cancelled) return;
        setStops([]);
        setStopsError(e?.message || "Failed to load stops");
      } finally {
        if (cancelled) return;
        setStopsLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [selectedRouteId]);

  // ---------------------------
  // Poll buses every 5 seconds
  // ---------------------------
  useEffect(() => {
    let cancelled = false;

    async function loadOnceOrPoll() {
      try {
        setBusesError("");
        if (!busesFirstLoad) setBusesSyncing(true);

        const res = await getLiveBuses();
        const list = normalizeList(res);

        if (cancelled) return;
        setBuses(list);

        setStatus(`Last sync: ${new Date().toLocaleTimeString()}`);
      } catch (e) {
        if (cancelled) return;
        setBusesError(e?.message || "Failed to fetch live buses");
        setStatus("Backend unreachable");
      } finally {
        if (cancelled) return;
        setBusesFirstLoad(false);
        setBusesSyncing(false);
      }
    }

    loadOnceOrPoll();
    const timer = setInterval(loadOnceOrPoll, 5000);

    return () => {
      cancelled = true;
      clearInterval(timer);
    };
  }, [busesFirstLoad]);

  // ---------------------------
  // Fit map to route bounds (AFTER routeLine exists)
  // ---------------------------
  useEffect(() => {
    if (!mapRef.current) return;
    if (!routeLine || routeLine.length < 2) return;

    try {
      const bounds = L.latLngBounds(routeLine.map(([lat, lng]) => L.latLng(lat, lng)));
      mapRef.current.fitBounds(bounds, { padding: [30, 30] });
    } catch {
      // ignore
    }
  }, [routeLine]);

  // ---------------------------
  // Alerts (dynamic)
  // ---------------------------
  const alerts = useMemo(() => {
    const list = [];

    list.push({
      type: "info",
      title: "Public Notice",
      message: "Live bus location is for public information. Accuracy may vary based on GPS/network.",
    });

    if (!backendOk) {
      list.push({
        type: "danger",
        title: "Service Status",
        message: "Backend appears unreachable. Live buses may not update.",
      });
    }

    if (routesError) list.push({ type: "danger", title: "Routes", message: routesError });
    if (stopsError) list.push({ type: "warn", title: "Stops", message: stopsError });
    if (!busesFirstLoad && !busesError && visibleBuses.length === 0) {
      list.push({
        type: "warn",
        title: "No Active Buses",
        message: "No live buses currently available. GPS updates are required to show buses.",
      });
    }

    return list;
  }, [backendOk, routesError, stopsError, busesError, busesFirstLoad, visibleBuses.length]);

  // Focus animation
  function focusBus(bus) {
    if (!bus || bus.lat == null || bus.lng == null) return;
    setSelectedBusId(bus.busId);

    if (mapRef.current) {
      mapRef.current.flyTo([bus.lat, bus.lng], 16, { duration: 1.2 });
    }

    setTimeout(() => {
      const marker = busMarkerRefs.current[bus.busId];
      if (marker && typeof marker.openPopup === "function") marker.openPopup();
    }, 650);
  }

  return (
    <div className="gov-shell page-enter">
      <GovHeader
        lastSyncText={status}
        backendOk={backendOk}
        onToggleTheme={toggleTheme}
        themeLabel={theme === "dark" ? "night" : "day"}
      />

      <div className="gov-banner">ℹ️ This system displays live bus location data for public information purposes.</div>

      <AlertsBar alerts={alerts} />

      <motion.main
        className="gov-main"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        {/* LEFT PANEL */}
        <section className="card left-panel">
          <div className="card-h">
            <div className="h">Controls</div>
            <div className="muted">Route & display</div>
          </div>

          <div className="card-b">
            <div className="label">Select Route</div>

            {routesLoading ? (
              <div className="skel skel-line lg" style={{ height: 40 }} />
            ) : (
              <select
                className="select"
                value={selectedRouteId}
                onChange={(e) => setSelectedRouteId(e.target.value)}
              >
                {routes.length === 0 ? (
                  <option value="">No routes configured by authority</option>
                ) : (
                  routes.map((r) => (
                    <option key={r.routeId} value={r.routeId}>
                      {r.routeId} — {r.name}
                    </option>
                  ))
                )}
              </select>
            )}

            {routesError && (
              <div style={{ marginTop: 10, color: "#b91c1c", fontSize: 12 }}>
                Routes error: {routesError}
              </div>
            )}

            <div className="divider" />

            <div className="muted">
              Stops: <b>{stops.length}</b> · Buses: <b>{visibleBuses.length}</b>
              {busesSyncing ? <span style={{ marginLeft: 8 }}>· Syncing…</span> : null}
            </div>

            {stopsLoading && (
              <div className="muted" style={{ marginTop: 6 }}>
                Loading stops…
              </div>
            )}

            {stopsError && (
              <div style={{ marginTop: 10, color: "#b91c1c", fontSize: 12 }}>
                Stops error: {stopsError}
              </div>
            )}
          </div>
        </section>

        {/* MAP */}
        <section className="card map-card">
          <div className="card-h">
            <div className="h">Live Map</div>
            <div className="muted">{stopsLoading ? "Loading stops…" : "Interactive tracking"}</div>
          </div>

          <div className="map-wrap">
            <MapContainer
              center={mapCenter}
              zoom={13}
              whenCreated={(map) => (mapRef.current = map)}
              style={{ height: "100%", width: "100%" }}
            >
              <TileLayer
                attribution="&copy; OpenStreetMap contributors"
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />

              {/* Route Polyline */}
              {routeLine.length >= 2 && (
                <Polyline
                  positions={routeLine}
                  pathOptions={{
                    color: "#0b4ea2",
                    weight: 5,
                    opacity: 0.85,
                    lineJoin: "round",
                  }}
                />
              )}

              {/* Stops */}
              {stops.map((s) => (
                <CircleMarker key={s.stopId} center={[s.lat, s.lng]} radius={6}>
                  <Popup>
                    <div>
                      <div style={{ fontWeight: 800 }}>{s.name_en}</div>
                      <div style={{ fontSize: 12, opacity: 0.7 }}>
                        {s.stopId} · Route {s.routeId} · #{s.sequence}
                      </div>
                    </div>
                  </Popup>
                </CircleMarker>
              ))}

              {/* Buses */}
              {visibleBuses.map((b) => (
                <BusMarker
                  key={b.busId}
                  position={[b.lat, b.lng]}
                  eventHandlers={{
                    add: (e) => (busMarkerRefs.current[b.busId] = e.target),
                    click: () => setSelectedBusId(b.busId),
                  }}
                >
                  <Popup>
                    <div>
                      <div style={{ fontWeight: 800 }}>{b.busId}</div>
                      {b.routeId && <div>Route: {b.routeId}</div>}
                      <div>Speed: {b.speed ?? 0}</div>
                      <div style={{ fontSize: 12, opacity: 0.8 }}>
                        {b.timestamp ? new Date(b.timestamp).toLocaleString() : "N/A"}
                      </div>
                      <div style={{ marginTop: 8 }}>
                        <Link to={`/bus/${encodeURIComponent(b.busId)}`}>Open details →</Link>
                      </div>
                    </div>
                  </Popup>
                </BusMarker>
              ))}
            </MapContainer>
          </div>
        </section>

        {/* RIGHT PANEL */}
        <section className="card right-panel">
          <div className="card-h">
            <div className="h">Live Buses</div>
            <div className="muted">Auto-refresh every 5 seconds</div>
          </div>

          <div className="card-b">
            <input
              className="input"
              placeholder="Search bus ID (e.g. BUS-101)"
              value={busQuery}
              onChange={(e) => setBusQuery(e.target.value)}
              style={{ marginBottom: 10 }}
            />

            <div className="list">
              {busesFirstLoad ? (
                <>
                  <div className="skel-card">
                    <div className="skel skel-line md"></div>
                    <div className="skel skel-line lg"></div>
                    <div className="skel skel-line sm"></div>
                  </div>
                  <div className="skel-card">
                    <div className="skel skel-line md"></div>
                    <div className="skel skel-line lg"></div>
                    <div className="skel skel-line sm"></div>
                  </div>
                  <div className="skel-card">
                    <div className="skel skel-line md"></div>
                    <div className="skel skel-line lg"></div>
                    <div className="skel skel-line sm"></div>
                  </div>
                </>
              ) : (
                <>
                  {filteredBuses.slice(0, 12).map((b) => (
                    <div
                      key={b.busId}
                      className="item"
                      style={{
                        cursor: "pointer",
                        borderColor: b.busId === selectedBusId ? "rgba(11,78,162,0.65)" : undefined,
                      }}
                      onClick={() => focusBus(b)}
                    >
                      <div>
                        <b>{b.busId}</b>
                        <div className="kv">Speed: {b.speed ?? 0}</div>
                        <div className="kv">
                          Last: {b.timestamp ? new Date(b.timestamp).toLocaleTimeString() : "N/A"}
                        </div>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <Link to={`/bus/${encodeURIComponent(b.busId)}`} onClick={(e) => e.stopPropagation()}>
                          Open →
                        </Link>
                      </div>
                    </div>
                  ))}

                  {filteredBuses.length === 0 && (
                    <div className="muted">
                      No live buses found{busQuery ? " for this search." : " yet."}
                      <br />
                      {busQuery ? "Try a different bus ID." : "Send GPS updates to see buses on map."}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </section>
      </motion.main>
    </div>
  );
}
