import useTheme from "../hooks/useTheme";
import { useTranslation } from "react-i18next";
/* eslint-disable-next-line no-unused-vars */
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useMemo, useRef, useState } from "react";
import { MapContainer, TileLayer, Popup, CircleMarker, Polyline } from "react-leaflet";
import { Link } from "react-router-dom";
import { RefreshCw, MapPin, Camera, X, Users, Info, Bell, AlertCircle } from "lucide-react";
import L from "leaflet";
import { PUBLIC_NOTICES } from "../data/notices";

import GovHeader from "../components/GovHeader";
import AlertsBar from "../components/AlertsBar";
import BusMarker from "../components/BusMarker";
import StopMarker from "../components/StopMarker";
import MarkerClusterGroup from "react-leaflet-cluster";
import useDebounce from "../hooks/useDebounce";
import { useAuth } from "../contexts/AuthContext";
import { getBusLatest, getLiveBuses, getRoutes, getStops, API_BASE } from "../api";
import { io as ioClient } from "socket.io-client";

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

function isNum(n) {
  return typeof n === "number" && Number.isFinite(n);
}

function hasLatLng(obj) {
  return obj && isNum(obj.lat) && isNum(obj.lng);
}

export default function LiveMap() {
  const { role } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const [showNotice, setShowNotice] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [busFilter, setBusFilter] = useState("All");
  const [busQuery, setBusQuery] = useState("");
  const debouncedBusQuery = useDebounce(busQuery, 300);
  const [hoveredStopId, setHoveredStopId] = useState(null);
  const [activeLocationTracker, setActiveLocationTracker] = useState(null);
  const [showStreetViewPanel, setShowStreetViewPanel] = useState(false);
  const [selectedBusId, setSelectedBusId] = useState(null);
  const [selectedBus, setSelectedBus] = useState(null);
  const [selectedBusLoading, setSelectedBusLoading] = useState(false);
  const [selectedBusError, setSelectedBusError] = useState("");

  const [buses, setBuses] = useState([]);
  const [routes, setRoutes] = useState([]);
  const [selectedRouteId, setSelectedRouteId] = useState("");
  const [stops, setStops] = useState([]);
  const [status, setStatus] = useState("Loading…");

  const [dismissedNotices, setDismissedNotices] = useState(() => {
    try {
      const stored = localStorage.getItem("smartBus_dismissed_notices");
      return stored ? JSON.parse(stored) : [];
    } catch { return []; }
  });
  const [showNoticeModal, setShowNoticeModal] = useState(false);

  const activeNotices = useMemo(() => {
    return PUBLIC_NOTICES.filter(n => !dismissedNotices.includes(n.id));
  }, [dismissedNotices]);

  const dismissNotice = (id) => {
    const next = [...dismissedNotices, id];
    setDismissedNotices(next);
    localStorage.setItem("smartBus_dismissed_notices", JSON.stringify(next));
  };

  const [routesError, setRoutesError] = useState("");
  const [stopsError, setStopsError] = useState("");
  const [busesError, setBusesError] = useState("");

  const [routesLoading, setRoutesLoading] = useState(true);
  const [stopsLoading, setStopsLoading] = useState(false);

  const [busesFirstLoad, setBusesFirstLoad] = useState(true);
  const [busesSyncing, setBusesSyncing] = useState(false);

  // Socket state
  const [socketConnected, setSocketConnected] = useState(false);

  const mapRef = useRef(null);
  const busMarkerRefs = useRef({});

  // ✅ Clean stops (prevents CircleMarker crash)
  const safeStops = useMemo(() => stops.filter(hasLatLng), [stops]);

  // ✅ Route polyline from safe stops (sorted)
  const routeLine = useMemo(() => {
    if (!safeStops || safeStops.length < 2) return [];
    const sorted = [...safeStops].sort((a, b) => (a.sequence ?? 0) - (b.sequence ?? 0));
    return sorted.map((s) => [s.lat, s.lng]);
  }, [safeStops]);

  // ✅ Clean buses (prevents BusMarker crash)
  const safeBuses = useMemo(() => buses.filter(hasLatLng), [buses]);

  // ✅ Visible buses by routeId (only if routeId exists in payload)
  const visibleBuses = useMemo(() => {
    if (!selectedRouteId) return safeBuses;
    const anyRouteIdPresent = safeBuses.some((b) => b.routeId);
    if (!anyRouteIdPresent) return safeBuses;
    return safeBuses.filter((b) => b.routeId === selectedRouteId);
  }, [safeBuses, selectedRouteId]);

  // ✅ Search filter
  const filteredBuses = useMemo(() => {
    let result = visibleBuses;
    if (busFilter === "Active") result = result.filter(b => b.speed > 0);
    else if (busFilter === "Stopped") result = result.filter(b => b.speed === 0);

    const q = debouncedBusQuery.trim().toLowerCase();
    if (!q) return result;
    return result.filter((b) => String(b.busId || "").toLowerCase().includes(q));
  }, [visibleBuses, busFilter, debouncedBusQuery]);

  // ✅ Safer map center (first valid stop, else default)
  const mapCenter = useMemo(() => {
    if (safeStops.length > 0) return [safeStops[0].lat, safeStops[0].lng];
    return [30.7333, 76.7794]; // Chandigarh fallback
  }, [safeStops]);

  // Header status
  const backendOk =
    !routesError && !stopsError && !busesError && !String(status).toLowerCase().includes("unreachable");

  const getRouteName = (rId) => {
    if (!rId) return "Unknown Route";
    const r = routes.find(route => route.routeId === rId);
    return r ? `${r.name} (${r.routeId})` : rId;
  };

  const getPublicIdentity = (bus) => {
    if (role === "admin" || role === "operator") return bus.busId;
    return getRouteName(bus.routeId);
  };

  // ---------------------------
  // Socket.IO: connect & listen
  // ---------------------------
  useEffect(() => {
    let socket;

    try {
      socket = ioClient(API_BASE, {
        path: "/socket.io",
        transports: ["websocket"],
        reconnectionAttempts: 5,
      });
    } catch (e) {
      console.warn("Socket.IO client failed to initialize", e);
      return;
    }

    socket.on("connect", () => {
      setSocketConnected(true);
    });

    socket.on("disconnect", () => {
      setSocketConnected(false);
    });

    socket.on("busesStream", (busesPayload) => {
      setBuses(busesPayload);
      setStatus(`Live Stream: ${new Date().toLocaleTimeString()}`);
      setBusesSyncing(true);
      setTimeout(() => setBusesSyncing(false), 500);
    });

    socket.on("bus:update", (bus) => {
      setBuses((prev) => {
        const map = new Map(prev.map((b) => [b.busId, b]));
        map.set(bus.busId, bus);
        return Array.from(map.values());
      });
      setStatus(`Live: ${new Date().toLocaleTimeString()}`);
    });

    socket.on("connect_error", (err) => {
      console.warn("Socket connect error:", err);
    });

    return () => {
      try {
        socket.close();
      } catch (e) { /* ignore */ }
    };
    // Note: API_BASE is stable; leaving empty deps is fine for a single connect.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ---------------------------
  // (Mock Simulator moved to backend socket!)
  // ---------------------------

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
        if (!cancelled) setRoutesLoading(false);
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
        if (!cancelled) setStopsLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [selectedRouteId]);

  // ---------------------------
  // Poll buses every 5 seconds (fallback when socket not connected)
  // ---------------------------
  useEffect(() => {
    let cancelled = false;

    // If socket is connected, skip polling
    if (socketConnected) return;

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
        if (!cancelled) {
          setBusesFirstLoad(false);
          setBusesSyncing(false);
        }
      }
    }

    loadOnceOrPoll();
    const timer = setInterval(loadOnceOrPoll, 5000);

    return () => {
      cancelled = true;
      clearInterval(timer);
    };
  }, [busesFirstLoad, socketConnected]);

  // ---------------------------
  // Fit map to route bounds
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
  // Alerts
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

  // Focus
  function focusBus(bus) {
    if (!bus || !hasLatLng(bus)) return;
    setSelectedBusId(bus.busId);
    setSelectedBus(bus);

    if (mapRef.current) {
      mapRef.current.flyTo([bus.lat, bus.lng], 16, { duration: 1.2 });
    }

    setTimeout(() => {
      const marker = busMarkerRefs.current[bus.busId];
      if (marker && typeof marker.openPopup === "function") marker.openPopup();
    }, 650);
  }

  // Load latest details for selected bus (lightweight, RedBus-like “status card”)
  useEffect(() => {
    let cancelled = false;
    if (!selectedBusId) {
      setSelectedBus(null);
      setSelectedBusError("");
      return;
    }
    (async () => {
      try {
        setSelectedBusError("");
        setSelectedBusLoading(true);
        const res = await getBusLatest(selectedBusId);
        const latest = res?.data || res;
        if (!cancelled && latest) setSelectedBus(latest);
      } catch (e) {
        if (!cancelled) setSelectedBusError(String(e?.message || e));
      } finally {
        if (!cancelled) setSelectedBusLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [selectedBusId]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0B1E33] flex flex-col font-sans text-slate-800 dark:text-slate-100 page-enter transition-colors duration-300">
      <GovHeader
        lastSyncText={status}
        backendOk={backendOk}
        onToggleTheme={toggleTheme}
        themeLabel={theme === "dark" ? "night" : "day"}
        unreadNoticesCount={activeNotices.length}
        onOpenNotices={() => setShowNoticeModal(true)}
      />

      {/* AlertsBar successfully removed */}

      <motion.main
        className="flex-1 w-full max-w-[1600px] mx-auto p-4 flex flex-col lg:grid lg:grid-cols-12 gap-6 relative"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        <AnimatePresence>
          {activeNotices.map((notice) => (
            <motion.div
              key={notice.id}
              initial={{ opacity: 0, height: 0, scale: 0.95 }}
              animate={{ opacity: 1, height: "auto", scale: 1 }}
              exit={{ opacity: 0, height: 0, scale: 0.95, overflow: "hidden" }}
              transition={{ duration: 0.3 }}
              className="col-span-12"
            >
              <div className={`relative px-4 py-3 rounded-xl shadow-md border flex items-start gap-3 backdrop-blur-md ${
                notice.type === 'warning' ? 'bg-amber-50/90 dark:bg-amber-900/40 border-amber-200 dark:border-amber-800/50' :
                'bg-blue-50/90 dark:bg-blue-900/40 border-blue-200 dark:border-blue-800/50'
              }`}>
                <div className={`mt-0.5 ${notice.type === 'warning' ? 'text-amber-600 dark:text-amber-400' : 'text-blue-600 dark:text-blue-400'}`}>
                  {notice.type === 'warning' ? <AlertCircle size={20} /> : <Info size={20} />}
                </div>
                <div className="flex-1">
                  <h4 className={`text-sm font-bold ${notice.type === 'warning' ? 'text-amber-800 dark:text-amber-200' : 'text-blue-800 dark:text-blue-200'}`}>
                    {notice.title}
                  </h4>
                  <p className={`text-sm mt-0.5 ${notice.type === 'warning' ? 'text-amber-700 dark:text-amber-300' : 'text-blue-700 dark:text-blue-300'}`}>
                    {notice.message}
                  </p>
                </div>
                <button
                  onClick={() => dismissNotice(notice.id)}
                  className={`p-1.5 rounded-lg transition-colors ${notice.type === 'warning' ? 'hover:bg-amber-200/50 text-amber-700 dark:hover:bg-amber-800/50 dark:text-amber-400' : 'hover:bg-blue-200/50 text-blue-700 dark:hover:bg-blue-800/50 dark:text-blue-400'}`}
                  aria-label="Dismiss Notice"
                >
                  <X size={16} strokeWidth={2.5} />
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* LEFT PANEL (CONTROLS SIDEBAR) */}
        <section className="lg:col-span-3 lg:sticky lg:top-4 h-[500px] lg:h-[calc(100vh-5.5rem)] overflow-y-auto bg-white/70 dark:bg-[#1C1C1E]/80 backdrop-blur-3xl border border-black-[0.02] dark:border-white/5 shadow-apple-float rounded-[32px] flex flex-col p-6 space-y-5 max-lg:order-1 z-10 transition-colors duration-500 custom-scrollbar">
          <div>
            <h2 className="text-xl font-bold text-[#0b4ea2] dark:text-blue-300 transition-colors duration-300">Controls</h2>
            <div className="text-sm text-slate-500 dark:text-slate-400 mt-1 transition-colors duration-300">Route & display</div>
          </div>

          <div>
            <div className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2 transition-colors duration-300">Select Route</div>
            {routesLoading ? (
              <div className="h-10 bg-slate-200 dark:bg-slate-700 animate-pulse rounded-lg transition-colors duration-300" />
            ) : (
              <select
                className="w-full bg-white/80 dark:bg-slate-800 border border-slate-300 dark:border-slate-600 dark:text-white rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#0b4ea2] dark:focus:ring-blue-400 transition-shadow drop-shadow-sm cursor-pointer"
                value={selectedRouteId}
                onChange={(e) => setSelectedRouteId(e.target.value)}
              >
                {routes.length === 0 ? (
                  <option value="">No routes configured by authority</option>
                ) : (
                  routes.map((r) => (
                    <option key={r.routeId} value={r.routeId}>
                      {r.routeId} &mdash; {r.name}
                    </option>
                  ))
                )}
              </select>
            )}
            {routesError && (
              <div className="mt-2 text-rose-600 dark:text-rose-400 text-sm">{routesError}</div>
            )}
          </div>

          <div className="h-px bg-slate-200/80 dark:bg-slate-700 my-2 transition-colors duration-300" />

          <div className="flex flex-col gap-2">
            <div className="text-sm font-semibold text-slate-700 dark:text-slate-300 transition-colors duration-300 flex justify-between">
              <span>Route Stops ({safeStops.length})</span>
              {busesSyncing ? <span className="text-emerald-600 dark:text-emerald-400 animate-pulse font-normal">&middot; Syncing&hellip;</span> : null}
            </div>
            <ul className="flex flex-col gap-1 max-h-48 overflow-y-auto pr-1 custom-scrollbar">
              {safeStops.length === 0 ? (
                <li className="text-xs text-slate-500 italic">No stops data.</li>
              ) : (
                safeStops.map((s) => (
                  <li
                    key={s.stopId}
                    className="text-sm text-slate-700 dark:text-slate-300 bg-white/50 dark:bg-slate-800/50 hover:bg-blue-50 dark:hover:bg-blue-900/30 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-1.5 cursor-default transition-colors flex items-center gap-2"
                    onMouseEnter={() => setHoveredStopId(s.stopId)}
                    onMouseLeave={() => setHoveredStopId(null)}
                  >
                    <span className="w-5 h-5 rounded-full bg-[#0b4ea2] dark:bg-blue-600 text-white flex items-center justify-center text-[10px] font-bold shrink-0">
                      {s.sequence}
                    </span>
                    <span className="truncate">{s.name_en}</span>
                  </li>
                ))
              )}
            </ul>
          </div>

          <div className="h-px bg-slate-200/80 dark:bg-slate-700 my-2 transition-colors duration-300" />

          <div>
            <div className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2 transition-colors duration-300">Selected bus</div>
            {!selectedBusId ? (
              <div className="text-sm text-slate-500 dark:text-slate-400 italic transition-colors duration-300">Click a bus marker or choose one from the list.</div>
            ) : selectedBusLoading ? (
              <div className="flex flex-col gap-2 p-4 bg-white/50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700 drop-shadow-sm transition-colors duration-300">
                <div className="h-4 bg-slate-200 dark:bg-slate-700 animate-pulse rounded w-1/2" />
                <div className="h-4 bg-slate-300 dark:bg-slate-600 animate-pulse rounded w-3/4" />
              </div>
            ) : selectedBusError ? (
              <div className="text-rose-600 dark:text-rose-400 text-sm bg-rose-50 dark:bg-rose-900/30 p-2 rounded border border-rose-100 dark:border-rose-800 transition-colors duration-300">{selectedBusError}</div>
            ) : selectedBus ? (
              <div className="flex flex-col gap-1.5 p-4 bg-white/70 dark:bg-slate-800/80 rounded-xl border border-blue-100 dark:border-slate-600 shadow-sm transition-colors duration-300">
                <b className="text-[#0b4ea2] dark:text-blue-300 text-lg leading-tight transition-colors duration-300">
                  {getPublicIdentity(selectedBus)}
                </b>
                {role !== "commuter" && (
                  <div className="text-sm text-slate-600 dark:text-slate-400 transition-colors duration-300">Route: <span className="font-medium text-slate-800 dark:text-slate-200">{selectedBus.routeId || "—"}</span></div>
                )}
                <div className="text-sm text-slate-600 dark:text-slate-400 transition-colors duration-300">
                  Updated: {selectedBus.timestamp ? new Date(selectedBus.timestamp).toLocaleTimeString() : "—"}
                </div>
                <div className="mt-3 flex gap-2">
                  <button onClick={() => { setSelectedBusId(null); setSelectedBus(null); }} className="inline-block text-rose-600 dark:text-rose-400 font-medium text-sm transition-colors cursor-pointer border-b border-rose-100 hover:border-rose-400 pb-0.5">Deselect &times;</button>
                  <Link className="inline-block text-[#0b4ea2] dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium text-sm transition-colors border-b border-transparent hover:border-blue-800 dark:hover:border-blue-300 pb-0.5" to={`/bus/${encodeURIComponent(selectedBus.busId)}`}>Open details &rarr;</Link>
                </div>
              </div>
            ) : (
              <div className="text-sm text-slate-500 dark:text-slate-400 transition-colors duration-300">No details available.</div>
            )}

            {stopsLoading && (
              <div className="mt-2 text-sm text-slate-500 dark:text-slate-400 animate-pulse transition-colors duration-300">Loading stops&hellip;</div>
            )}
            {stopsError && (
              <div className="mt-2 text-sm text-rose-600 dark:text-rose-400 transition-colors duration-300">Stops error: {stopsError}</div>
            )}
          </div>
        </section>

        {/* MAIN MAP AREA */}
        <section className="lg:col-span-6 flex flex-col h-[500px] lg:h-[calc(100vh-5.5rem)] bg-white/70 dark:bg-[#1C1C1E]/80 backdrop-blur-3xl border border-black-[0.02] dark:border-white/5 shadow-apple-float rounded-[32px] overflow-hidden relative max-lg:order-2 z-0 transition-colors duration-500">
          <div className="p-5 bg-slate-50/50 dark:bg-black/20 border-b border-black/5 dark:border-white/5 flex justify-between items-center z-10 transition-colors duration-500">
            <div>
              <h2 className="text-xl font-bold text-[#0b4ea2] dark:text-blue-300 transition-colors duration-300">Live Map</h2>
              <div className="text-sm text-slate-500 dark:text-slate-400 mt-1 transition-colors duration-300">{stopsLoading ? "Loading stops…" : "Interactive tracking"}</div>
            </div>
          </div>

          <div className="flex-1 relative z-0 mix-blend-normal">
            <MapContainer
              center={mapCenter}
              zoom={13}
              whenCreated={(map) => (mapRef.current = map)}
              style={{ height: "100%", width: "100%", background: "transparent" }}
            >
              <TileLayer
                attribution="&copy; OpenStreetMap contributors"
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                className="dark:brightness-75 dark:contrast-125 dark:hue-rotate-180 dark:invert"
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
                    dashArray: "10, 10"
                  }}
                />
              )}

              {/* Stops */}
              {safeStops.map((s) => (
                <StopMarker
                  key={s.stopId}
                  position={[s.lat, s.lng]}
                  sequence={s.sequence}
                  isHovered={hoveredStopId === s.stopId}
                  eventHandlers={{
                    click: () => {
                      setSelectedBusId(null);
                      setActiveLocationTracker({ lat: s.lat, lng: s.lng, title: `Stop: ${s.name_en}` });
                      setShowStreetViewPanel(true);
                    }
                  }}
                >
                  <Popup>
                    <div>
                      <div className="font-bold text-slate-800">{s.name_en}</div>
                      <div className="text-xs text-slate-600 mt-1">
                        {s.stopId} &middot; Route {s.routeId} &middot; #{s.sequence}
                      </div>
                    </div>
                  </Popup>
                </StopMarker>
              ))}

              {/* Buses */}
              <MarkerClusterGroup chunkedLoading={true} maxClusterRadius={50}>
                {filteredBuses.map((b) => (
                  <BusMarker
                    key={b.busId}
                    position={[b.lat, b.lng]}
                    heading={b.heading}
                    busStatus={b.busStatus || "On Route"}
                    occupancy={b.occupancy}
                    eventHandlers={{
                      add: (e) => (busMarkerRefs.current[b.busId] = e.target),
                      click: () => {
                        setSelectedBusId(b.busId);
                        setActiveLocationTracker({ lat: b.lat, lng: b.lng, title: `Bus ${b.busId}` });
                      },
                    }}
                  >
                    <Popup>
                      <div>
                        <div className="font-bold text-[#0b4ea2] text-md leading-tight">
                          {getPublicIdentity(b)}
                        </div>
                        {b.routeId && role !== "commuter" && <div className="text-sm text-slate-700 mt-1">Route: {b.routeId}</div>}
                        <div className="text-xs text-slate-500 mt-1 pt-1 border-t border-slate-100">
                          {b.timestamp ? new Date(b.timestamp).toLocaleString() : "N/A"}
                        </div>
                        <div className="mt-2">
                          <Link className="text-[#0b4ea2] font-medium hover:underline text-sm" to={`/bus/${encodeURIComponent(b.busId)}`}>Open details &rarr;</Link>
                        </div>
                      </div>
                    </Popup>
                  </BusMarker>
                ))}
              </MarkerClusterGroup>
            </MapContainer>

            {/* STREET VIEW MAP CONTROL BUTTON */}
            <div className="absolute top-4 right-4 z-[400]">
              <button
                onClick={() => setShowStreetViewPanel(!showStreetViewPanel)}
                className={`p-2.5 rounded-xl shadow-md border backdrop-blur-md transition-all ${showStreetViewPanel ? "bg-[#0b4ea2] border-blue-400 text-white" : "bg-white/90 dark:bg-slate-800/90 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700"}`}
                title="Toggle Street View"
              >
                <Camera size={20} />
              </button>
            </div>

            {/* STREET VIEW FLOATING PANEL */}
            <AnimatePresence>
              {showStreetViewPanel && activeLocationTracker && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="absolute bottom-6 left-6 z-[400] w-72 bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden"
                >
                  <div className="bg-[#0b4ea2] px-3 py-2 flex justify-between items-center text-white">
                    <div className="flex items-center gap-1.5 font-semibold text-sm">
                      <Camera size={14} />
                      Street View Tracker
                    </div>
                    <button onClick={() => setShowStreetViewPanel(false)} className="hover:bg-white/20 p-1 rounded transition-colors"><X size={14} /></button>
                  </div>
                  <div className="relative aspect-[4/3] bg-slate-200 dark:bg-slate-900 w-full flex items-center justify-center">
                    <img
                      src={`https://images.unsplash.com/photo-1544620347-c4cb45fc81b9?auto=format&fit=crop&w=600&q=80`}
                      className="w-full h-full object-cover mix-blend-overlay dark:mix-blend-normal opacity-90"
                      alt="Street View proxy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent pointer-events-none" />
                    <div className="absolute bottom-0 left-0 p-3 w-full">
                      <div className="text-white font-bold text-sm drop-shadow-md truncate">{activeLocationTracker.title}</div>
                      <div className="text-white/80 text-[11px] font-medium drop-shadow-md tracking-wider">
                        {activeLocationTracker.lat.toFixed(5)}, {activeLocationTracker.lng.toFixed(5)}
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </section>

        {/* RIGHT PANEL (LIVE BUSES) */}
        <section className="lg:col-span-3 lg:sticky lg:top-4 h-[500px] lg:h-[calc(100vh-5.5rem)] overflow-y-auto bg-white/70 dark:bg-[#1C1C1E]/80 backdrop-blur-3xl border border-black-[0.02] dark:border-white/5 shadow-apple-float rounded-[32px] flex flex-col p-6 space-y-5 max-lg:order-3 z-10 transition-colors duration-500 custom-scrollbar">
          <div className="flex justify-between items-start gap-2">
            <div>
              <h2 className="text-xl font-bold text-[#0b4ea2] dark:text-blue-300 transition-colors duration-300 whitespace-nowrap">Live Buses</h2>
              <div className="text-sm text-slate-500 dark:text-slate-400 mt-1 transition-colors duration-300">Active tracking via sync</div>
            </div>
            <label className="flex items-center gap-1.5 cursor-pointer text-sm font-medium text-slate-700 dark:text-slate-300 select-none mt-1 whitespace-nowrap group">
              <span className={`transition-opacity ${autoRefresh ? "opacity-100" : "opacity-0"}`} aria-hidden="true">
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                </span>
              </span>
              <span className="hidden sm:inline">Auto-refresh</span>
              <input
                type="checkbox"
                className="sr-only"
                checked={autoRefresh}
                onChange={() => setAutoRefresh(!autoRefresh)}
              />
              <div className={`w-9 h-5 rounded-full relative transition-colors ${autoRefresh ? "bg-emerald-500" : "bg-slate-300 dark:bg-slate-600"}`}>
                <div className={`w-3.5 h-3.5 bg-white rounded-full absolute top-[3px] transition-all duration-200 shadow-sm ${autoRefresh ? "left-[19px]" : "left-[3px]"}`} />
              </div>
            </label>
          </div>

          <div>
            <div className="flex gap-2 mb-3">
              {["All", "Active", "Stopped"].map(f => (
                <button
                  key={f}
                  className={`px-3 py-1 text-xs font-semibold rounded-full border transition-colors ${busFilter === f ? "bg-[#0b4ea2] text-white border-[#0b4ea2] dark:bg-blue-500 dark:border-blue-500 shadow-inner" : "bg-white/50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-white dark:hover:bg-slate-700 shadow-sm"}`}
                  onClick={() => setBusFilter(f)}
                >{f}</button>
              ))}
            </div>
            <div className="relative">
              <input
                className="w-full bg-white/80 dark:bg-slate-800 border border-slate-300 dark:border-slate-600 dark:text-white rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#0b4ea2] dark:focus:ring-blue-400 transition-shadow drop-shadow-sm placeholder-slate-400"
                placeholder="Search bus ID..."
                value={busQuery}
                onChange={(e) => setBusQuery(e.target.value)}
              />
              <AnimatePresence>
                {busQuery && (
                  <motion.div
                    initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }}
                    className="absolute top-full left-0 right-0 mt-2 bg-white/95 dark:bg-slate-800/95 backdrop-blur-xl border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl overflow-hidden z-20 max-h-60 overflow-y-auto"
                  >
                    {filteredBuses.slice(0, 8).map(b => (
                      <div key={b.busId} className="px-4 py-2.5 hover:bg-slate-50 dark:hover:bg-slate-700 cursor-pointer border-b last:border-0 border-slate-100 dark:border-slate-700/50 flex justify-between items-center transition-colors" onClick={() => { focusBus(b); setBusQuery(""); }}>
                        <span className="font-semibold text-slate-800 dark:text-slate-200 truncate pr-2 max-w-[65%]">
                          {getPublicIdentity(b)}
                        </span>
                        <div className="flex items-center gap-1.5 whitespace-nowrap">
                          <span className={`w-2.5 h-2.5 rounded-full ${b.busStatus === "Out of Service" ? "bg-slate-500" : b.busStatus === "Stopped" || b.speed === 0 ? "bg-rose-500" : "bg-emerald-500"}`}></span>
                          <span className="text-xs font-medium text-slate-500 dark:text-slate-400">{b.busStatus || (b.speed > 0 ? "En route" : "Stopped")}</span>
                        </div>
                      </div>
                    ))}
                    {filteredBuses.length === 0 && <div className="p-4 text-sm font-medium text-center text-slate-500 dark:text-slate-400">No buses match "{busQuery}"</div>}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {busesError && (
            <div className="text-rose-600 dark:text-rose-400 text-sm bg-rose-50 dark:bg-rose-900/30 p-3 rounded-lg border border-rose-100 dark:border-rose-800 transition-colors duration-300">
              {busesError}
            </div>
          )}

          <div className="flex flex-col gap-3">
            {busesFirstLoad ? (
              Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex flex-col gap-2 p-4 bg-white/50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700 drop-shadow-sm transition-colors duration-300">
                  <div className="h-4 bg-slate-200 dark:bg-slate-700 animate-pulse rounded w-1/2 transition-colors duration-300" />
                  <div className="h-4 bg-slate-300 dark:bg-slate-600 animate-pulse rounded w-3/4 transition-colors duration-300" />
                </div>
              ))
            ) : (
              <>
                <AnimatePresence mode="popLayout">
                  {filteredBuses.slice(0, 12).map((b) => (
                    <motion.div
                      layout
                      initial={{ opacity: 0, y: -15, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 15, scale: 0.95 }}
                      transition={{ duration: 0.3, ease: "easeOut" }}
                      key={b.busId}
                      className={`p-4 rounded-[20px] border transition-all cursor-pointer bg-white/80 dark:bg-[#1C1C1E] border-slate-200 dark:border-white/5 shadow-sm hover:-translate-y-1 hover:shadow-apple active:scale-[0.98] ${b.busId === selectedBusId ? "ring-2 ring-blue-500 dark:ring-blue-400 border-transparent dark:border-transparent" : "hover:border-blue-500/50 dark:hover:border-blue-400/50"}`}
                      onClick={() => focusBus(b)}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="flex items-center gap-2">
                            <b className="text-slate-800 dark:text-slate-200 text-lg transition-colors duration-300">{b.busId}</b>
                            <div className={`inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md ${
                              b.occupancy === "High" ? "bg-rose-100 text-rose-700 dark:bg-rose-900/50 dark:text-rose-400" :
                              b.occupancy === "Medium" ? "bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-400" :
                              "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-400"
                            }`}>
                              <Users size={12} strokeWidth={2.5} />
                              {b.occupancy || "Low"}
                            </div>
                          </div>
                          <div className="flex items-center gap-1.5 mt-1 transition-colors duration-300">
                            <span className={`w-2 h-2 rounded-full ${b.busStatus === "Out of Service" ? "bg-slate-500" : b.busStatus === "Stopped" || b.speed === 0 ? "bg-rose-500" : "bg-emerald-500"}`}></span>
                            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                              {b.busStatus || (b.speed > 0 ? "On Route" : "Stopped")}
                            </span>
                          </div>
                          <div className="text-xs text-slate-500 dark:text-slate-400 mt-1 transition-colors duration-300 line-clamp-1">
                            Dest: Mohali ISBT (Simulated)
                          </div>
                        </div>
                        <Link
                          className="text-[#0b4ea2] dark:text-blue-300 bg-blue-50/50 dark:bg-blue-900/30 hover:bg-blue-100 dark:hover:bg-blue-800/50 p-2 rounded-lg transition-colors border border-blue-100 dark:border-blue-800 hover:-translate-y-0.5 hover:shadow-sm active:scale-95 duration-200"
                          to={`/bus/${encodeURIComponent(b.busId)}`}
                          onClick={(e) => e.stopPropagation()}
                          title="Open Details"
                        >
                          &rarr;
                        </Link>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>

                {filteredBuses.length === 0 && (
                  <div className="text-sm text-slate-500 dark:text-slate-400 text-center py-8 px-4 bg-white/40 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-700 border-dashed transition-colors duration-300">
                    No live buses found{busQuery ? " for this search." : " yet."}
                    <br className="mt-2" />
                    {busQuery
                      ? "Try a different ID."
                      : "Waiting for GPS data..."}
                  </div>
                )}
              </>
            )}

            {/* STREET VIEW PLACEHOLDER */}
            <div className="mt-auto pt-4 border-t border-slate-200 dark:border-slate-700 transition-colors duration-300">
              <h3 className="text-sm font-bold text-[#0b4ea2] dark:text-blue-300 mb-3 uppercase tracking-wider transition-colors duration-300">Street View</h3>
              <div className="aspect-video w-full rounded-xl overflow-hidden bg-slate-200 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 shadow-inner relative flex items-center justify-center transition-colors duration-300">
                {selectedBusId ? (
                  <img
                    src={`https://images.unsplash.com/photo-1544620347-c4cb45fc81b9?auto=format&fit=crop&w=600&q=80`}
                    alt="Street view placeholder"
                    className="w-full h-full object-cover opacity-80 mix-blend-overlay dark:mix-blend-normal"
                  />
                ) : (
                  <span className="text-sm text-slate-500 dark:text-slate-400 font-medium px-4 text-center transition-colors duration-300">Select a bus for Street View</span>
                )}
              </div>
            </div>
          </div>
        </section>

      </motion.main>

      {/* NOTICE HISTORY MODAL */}
      <AnimatePresence>
        {showNoticeModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
              onClick={() => setShowNoticeModal(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[85vh]"
            >
              <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
                <div className="flex items-center gap-2 text-slate-800 dark:text-slate-200">
                  <Bell size={20} className="text-[#0b4ea2] dark:text-blue-400" />
                  <h3 className="font-bold text-lg">Notice History</h3>
                </div>
                <button
                  onClick={() => setShowNoticeModal(false)}
                  className="p-2 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
              <div className="overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-slate-300 dark:scrollbar-thumb-slate-700">
                {PUBLIC_NOTICES.length === 0 ? (
                  <div className="text-center py-8 text-slate-500 font-medium">No notices available.</div>
                ) : PUBLIC_NOTICES.map(n => (
                  <div key={n.id} className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4 shadow-sm relative overflow-hidden group">
                    <div className={`absolute top-0 left-0 w-1 h-full ${n.type === 'warning' ? 'bg-amber-500' : 'bg-[#0b4ea2] dark:bg-blue-500'}`}></div>
                    <div className="flex justify-between items-start mb-1 pl-2">
                       <h4 className="font-bold text-slate-800 dark:text-slate-200">{n.title}</h4>
                       <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400">
                         {new Date(n.date).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                       </span>
                    </div>
                    <p className="text-sm text-slate-600 dark:text-slate-400 pl-2 mt-1.5 leading-relaxed">{n.message}</p>
                    {activeNotices.some(a => a.id === n.id) && (
                      <div className="mt-3 pl-2">
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-900/30 px-2 py-0.5 rounded-md">
                          <div className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse"></div> Unread Notice
                        </span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
