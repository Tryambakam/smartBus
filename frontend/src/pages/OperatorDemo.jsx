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
        <section className="bg-white/70 dark:bg-[#1C1C1E]/80 backdrop-blur-3xl rounded-[32px] shadow-apple-float border border-black-[0.02] dark:border-white/5 overflow-hidden w-full transition-colors duration-500">
          <div className="p-6 border-b border-black/5 dark:border-white/5 bg-slate-50/50 dark:bg-black/20 flex items-center justify-between">
            <div>
              <div className="text-xl font-[800] text-slate-900 dark:text-white">Operator Console</div>
              <div className="text-[13px] font-[500] text-slate-500 dark:text-slate-400 mt-0.5">Hardware Matrix Simulation</div>
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
                <input className={`input ${jwtBusId ? 'bg-slate-100 dark:bg-slate-800 text-slate-500 cursor-not-allowed' : ''}`} value={busId} onChange={(e) => setBusId(e.target.value)} readOnly={!!jwtBusId} />
              </div>
              <div>
                <div className="label">Route ID (optional)</div>
                <input className="input" value={routeId} onChange={(e) => setRouteId(e.target.value)} />
              </div>
              <div>
                <div className="label">Speed (km/h)</div>
                <input
                  className="input"
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
                <div className="label">Bus Status</div>
                <select className="input" value={busStatus} onChange={(e) => setBusStatus(e.target.value)}>
                  <option value="On Route">On Route</option>
                  <option value="Stopped">Stopped</option>
                  <option value="Out of Service">Out of Service</option>
                </select>
              </div>
            </div>

            <div className="h-px bg-black/5 dark:bg-white/10 my-6" />

            <div className="flex gap-3 flex-wrap mt-6">
              <button className="bg-emerald-500 hover:bg-emerald-400 text-white px-6 py-3 rounded-full font-[700] text-[14px] shadow-md transition-all active:scale-95" onClick={start}>
                Start transmitting location
              </button>
              <button className="bg-rose-500 hover:bg-rose-400 text-white px-6 py-3 rounded-full font-[700] text-[14px] shadow-md transition-all active:scale-95" onClick={stop}>
                Stop
              </button>
            </div>

            <div className="h-px bg-black/5 dark:bg-white/10 my-6" />

            <div className="flex gap-3 flex-wrap">
              <button className="bg-blue-600 hover:bg-blue-500 text-white px-5 py-2.5 rounded-full font-[600] text-[13px] shadow-sm transition-all active:scale-95" onClick={handleAnnounce}>
                Announce Next Stop
              </button>
              <button className="bg-amber-500 hover:bg-amber-400 text-white px-5 py-2.5 rounded-full font-[600] text-[13px] shadow-sm transition-all active:scale-95" onClick={() => setShowDelayModal(true)}>
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
              style={{
                backgroundColor: "white", padding: 24, borderRadius: 12, width: "100%", maxWidth: 320,
                boxShadow: "0 10px 25px rgba(0,0,0,0.2)"
              }}
            >
              <h3 style={{ marginTop: 0, color: "#0f172a", fontSize: "1.25rem", fontWeight: "bold" }}>Report Delay</h3>
              <p style={{ fontSize: 14, color: "#64748b", mb: 16 }}>Select the reason for the transit delay to notify central systems immediately.</p>
              
              <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 24, marginTop: 16 }}>
                {["Traffic", "Mechanical", "Weather", "Emergency"].map(r => (
                  <label key={r} style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", color: "#334155", fontWeight: "500" }}>
                    <input type="radio" name="delayReason" value={r} checked={delayReason === r} onChange={(e) => setDelayReason(e.target.value)} style={{ width: 16, height: 16 }} />
                    {r}
                  </label>
                ))}
              </div>

              <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
                <button className="select" onClick={() => setShowDelayModal(false)}>Cancel</button>
                <button className="btn" style={{ backgroundColor: "#b91c1c" }} onClick={handleReportDelayConfirm}>Confirm Delay</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

