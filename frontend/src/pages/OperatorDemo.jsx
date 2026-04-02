import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import GovHeader from "../components/GovHeader";
import useTheme from "../hooks/useTheme";
import { useAuth } from "../contexts/AuthContext";
import { API_BASE, authHeaders } from "../api";

export default function OperatorDemo() {
  const { theme, toggleTheme } = useTheme();
  const { user } = useAuth() || {};
  const jwtBusId = user?.busId || "";

  const [busId, setBusId] = useState(jwtBusId || "BUS-101");
  const [routeId, setRouteId] = useState("");
  const [speed, setSpeed] = useState(18);
  const [status, setStatus] = useState("Idle");
  const [busStatus, setBusStatus] = useState("On Route");
  const [err, setErr] = useState("");
  const [sending, setSending] = useState(false);

  const [toastMsg, setToastMsg] = useState("");
  const [showDelayModal, setShowDelayModal] = useState(false);
  const [delayReason, setDelayReason] = useState("Traffic");

  const [isSharing, setIsSharing] = useState(false);
  const [gpsAccuracy, setGpsAccuracy] = useState(null);
  const [geoErrTooltip, setGeoErrTooltip] = useState("");

  const watchIdRef = useRef(null);
  const lastSentRef = useRef(0);

  async function sendUpdate({ lat, lng }) {
    setErr("");
    setSending(true);
    try {
      const res = await fetch(`${API_BASE}/api/gps/update`, {
        method: "POST",
        headers: authHeaders({ "Content-Type": "application/json" }),
        body: JSON.stringify({
          busId: busId.trim(),
          routeId: routeId.trim(),
          lat,
          lng,
          speed: Number(speed) || 0,
          busStatus
        }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) throw new Error(data?.error || `GPS update failed: ${res.status}`);
      setStatus(`Sent @ ${new Date().toLocaleTimeString()}`);
    } catch (e) {
      setErr(String(e?.message || e));
      setStatus("Error");
    } finally {
      setSending(false);
    }
  }

  function handleAnnounce() {
    setToastMsg("Announcement: Approaching next stop. Please prepare to exit.");
    setTimeout(() => setToastMsg(""), 3000);
  }

  function handleReportDelayConfirm() {
    setToastMsg(`Public Notice: Bus delayed due to ${delayReason}.`);
    setTimeout(() => setToastMsg(""), 4000);
    setShowDelayModal(false);
  }

  function start() {
    setErr("");
    setGeoErrTooltip("");
    if (!navigator.geolocation) {
      setErr("Geolocation is not supported in this browser.");
      return;
    }
    if (!busId.trim()) {
      setErr("busId is required.");
      return;
    }

    setStatus("Starting…");
    const id = navigator.geolocation.watchPosition(
      (pos) => {
        setIsSharing(true);
        setGpsAccuracy(Math.round(pos.coords.accuracy));

        const now = Date.now();
        // throttle to ~1 update / 2 seconds
        if (now - lastSentRef.current < 2000) return;
        lastSentRef.current = now;
        sendUpdate({ lat: pos.coords.latitude, lng: pos.coords.longitude });
      },
      (e) => {
        setIsSharing(false);
        setGpsAccuracy(null);
        if (e.code === 1) {
          setGeoErrTooltip("Location permission denied. Please click the site settings icon in your browser's URL bar, allow location access, and reload.");
        } else {
          setErr(e?.message || "Location access failed.");
        }
        setStatus("Stopped");
      },
      { enableHighAccuracy: true, maximumAge: 1000, timeout: 10000 }
    );
    watchIdRef.current = id;
  }

  function stop() {
    if (watchIdRef.current != null) {
      try {
        navigator.geolocation.clearWatch(watchIdRef.current);
      } catch {
        // ignore
      }
      watchIdRef.current = null;
    }
    setIsSharing(false);
    setGpsAccuracy(null);
    setStatus("Stopped");
  }

  useEffect(() => () => stop(), []);

  return (
    <div className="gov-shell page-enter">
      <GovHeader
        lastSyncText={status}
        backendOk={!err}
        onToggleTheme={toggleTheme}
        themeLabel={theme === "dark" ? "night" : "day"}
      />
      <div className="gov-banner">Operator Demo Mode — publish GPS updates to live tracking.</div>

      <motion.main
        className="gov-main login-main"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: "easeOut" }}
      >
        <section className="bg-white dark:bg-[#111111] rounded-none shadow-none border border-gray-300 dark:border-gray-700 border-t-4 border-t-[#0a3161] overflow-hidden w-full transition-colors duration-500">
          <div className="p-6 border-b border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-[#1a1d24] flex items-center justify-between">
            <div>
              <div className="text-xl font-bold text-gray-900 dark:text-white">Operator Console</div>
              <div className="text-[13px] font-medium text-gray-500 dark:text-gray-400 mt-0.5 tracking-widest uppercase">Hardware Matrix Simulation</div>
            </div>
          </div>
          <div className="p-6 md:p-8">
            <div className="mb-6">
              <Link to="/app">← Back to dashboard</Link>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              <div>
                <div className="label" style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  Bus ID
                  {isSharing && (
                    <span style={{ 
                      display: "inline-flex", alignItems: "center", gap: 4, padding: "2px 8px", 
                      backgroundColor: "#ffe4e6", color: "#e11d48", fontSize: "0.7rem", fontWeight: "bold", 
                      borderRadius: 999, border: "1px solid #fecdd3", animation: "pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite" 
                    }}>
                      <span style={{ width: 6, height: 6, borderRadius: 999, backgroundColor: "#e11d48" }}></span> LIVE
                    </span>
                  )}
                </div>
                <input className={`w-full text-sm py-2 px-3 border border-gray-300 dark:border-gray-700 rounded-none bg-white dark:bg-[#1a1d24] text-gray-900 dark:text-white outline-none focus:border-[#0a3161] ${jwtBusId ? 'bg-gray-100 dark:bg-gray-800 text-gray-500 cursor-not-allowed' : ''}`} value={busId} onChange={(e) => setBusId(e.target.value)} readOnly={!!jwtBusId} />
              </div>
              <div>
                <div className="label font-mono text-xs uppercase tracking-widest text-gray-500 mb-1">Route ID (optional)</div>
                <input className="w-full text-sm py-2 px-3 border border-gray-300 dark:border-gray-700 rounded-none bg-white dark:bg-[#1a1d24] text-gray-900 dark:text-white outline-none focus:border-[#0a3161]" value={routeId} onChange={(e) => setRouteId(e.target.value)} />
              </div>
              <div>
                <div className="label font-mono text-xs uppercase tracking-widest text-gray-500 mb-1">Speed (km/h)</div>
                <input
                  className="w-full text-sm py-2 px-3 border border-gray-300 dark:border-gray-700 rounded-none bg-white dark:bg-[#1a1d24] text-gray-900 dark:text-white outline-none focus:border-[#0a3161]"
                  type="number"
                  value={speed}
                  onChange={(e) => setSpeed(e.target.value)}
                  min={0}
                />
              </div>
              <div>
                <div className="label">Sync Status</div>
                <div className="item" style={{ flexDirection: "column", alignItems: "flex-start", gap: 4 }}>
                  <div style={{ display: "flex", alignItems: "center" }}>
                    <b>{status}</b>
                    {sending ? <span className="kv" style={{ marginLeft: 8 }}>sending…</span> : null}
                  </div>
                  {gpsAccuracy !== null && (
                    <div style={{ fontSize: "0.75rem", color: "#64748b", fontWeight: 500 }}>
                      GPS accuracy: ±{gpsAccuracy}m
                    </div>
                  )}
                </div>
              </div>
              <div>
                <div className="label font-mono text-xs uppercase tracking-widest text-gray-500 mb-1">Bus Status</div>
                <select className="w-full text-sm py-2 px-3 border border-gray-300 dark:border-gray-700 rounded-none bg-white dark:bg-[#1a1d24] text-gray-900 dark:text-white outline-none focus:border-[#0a3161]" value={busStatus} onChange={(e) => setBusStatus(e.target.value)}>
                  <option value="On Route">On Route</option>
                  <option value="Stopped">Stopped</option>
                  <option value="Out of Service">Out of Service</option>
                </select>
              </div>
            </div>

            <div className="h-px bg-black/5 dark:bg-white/10 my-6" />

            <div className="flex gap-3 flex-wrap mt-6">
              <button className="bg-emerald-700 hover:bg-emerald-800 text-white border border-emerald-700 px-6 py-3 rounded-none font-bold text-[14px] transition-colors" onClick={start}>
                Start transmitting location
              </button>
              <button className="bg-rose-700 hover:bg-rose-800 text-white border border-rose-700 px-6 py-3 rounded-none font-bold text-[14px] transition-colors" onClick={stop}>
                Stop
              </button>
            </div>

            <div className="h-px bg-black/5 dark:bg-white/10 my-6" />

            <div className="flex gap-3 flex-wrap">
              <button className="bg-[#0a3161] hover:bg-[#072448] border border-[#0a3161] text-white px-5 py-2.5 rounded-none font-bold text-[13px] transition-colors" onClick={handleAnnounce}>
                Announce Next Stop
              </button>
              <button className="bg-amber-600 hover:bg-amber-700 border border-amber-600 text-white px-5 py-2.5 rounded-none font-bold text-[13px] transition-colors" onClick={() => setShowDelayModal(true)}>
                Report Delay...
              </button>
            </div>

            {(err || geoErrTooltip) ? (
              <div style={{ color: "#b91c1c", marginTop: 10, fontSize: "0.9rem", backgroundColor: "#fef2f2", padding: "10px 14px", borderRadius: 8, border: "1px solid #fecaca" }}>
                <b>Error:</b> {err || geoErrTooltip}
              </div>
            ) : null}

            <div className="muted" style={{ marginTop: 10 }}>
              Tip: Keep the dashboard open on another tab and watch the bus appear/move in real-time.
            </div>
          </div>
        </section>
      </motion.main>

      {/* Toast Notification */}
      <AnimatePresence>
        {toastMsg && (
          <motion.div
            initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
            style={{
              position: "fixed", top: 80, right: 20, zIndex: 9999,
              backgroundColor: "#10b981", color: "white", padding: "12px 20px",
              borderRadius: 8, boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
              fontWeight: "bold"
            }}
          >
            {toastMsg}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delay Modal Override */}
      <AnimatePresence>
        {showDelayModal && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{
              position: "fixed", inset: 0, zIndex: 9999, display: "flex",
              alignItems: "center", justifyContent: "center", backgroundColor: "rgba(0,0,0,0.5)"
            }}
          >
            <motion.div
              initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }}
              className="bg-white dark:bg-[#111111] p-6 rounded-none w-full max-w-sm border border-gray-300 dark:border-gray-700"
            >
              <h3 className="mt-0 text-gray-900 dark:text-white text-xl font-bold">Report Delay</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4 tracking-tight">Select the reason for the transit delay to notify central systems immediately.</p>
              
              <div className="flex flex-col gap-3 mb-6 mt-4">
                {["Traffic", "Mechanical", "Weather", "Emergency"].map(r => (
                  <label key={r} className="flex items-center gap-2 cursor-pointer text-gray-700 dark:text-gray-300 font-medium">
                    <input type="radio" name="delayReason" value={r} checked={delayReason === r} onChange={(e) => setDelayReason(e.target.value)} className="w-4 h-4" />
                    {r}
                  </label>
                ))}
              </div>

              <div className="flex gap-3 justify-end border-t border-gray-200 dark:border-gray-800 pt-4">
                <button className="px-4 py-2 font-bold text-sm bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-700 rounded-none transition-colors" onClick={() => setShowDelayModal(false)}>Cancel</button>
                <button className="px-4 py-2 font-bold text-sm bg-rose-700 hover:bg-rose-800 text-white border border-rose-700 rounded-none transition-colors" onClick={handleReportDelayConfirm}>Confirm Delay</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

