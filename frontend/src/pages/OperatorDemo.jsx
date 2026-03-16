import { motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import GovHeader from "../components/GovHeader";
import useTheme from "../hooks/useTheme";
import { API_BASE, authHeaders } from "../api";

export default function OperatorDemo() {
  const { theme, toggleTheme } = useTheme();

  const [busId, setBusId] = useState("BUS-101");
  const [routeId, setRouteId] = useState("");
  const [speed, setSpeed] = useState(18);
  const [status, setStatus] = useState("Idle");
  const [err, setErr] = useState("");
  const [sending, setSending] = useState(false);

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

  function start() {
    setErr("");
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
        const now = Date.now();
        // throttle to ~1 update / 2 seconds
        if (now - lastSentRef.current < 2000) return;
        lastSentRef.current = now;
        sendUpdate({ lat: pos.coords.latitude, lng: pos.coords.longitude });
      },
      (e) => {
        setErr(e?.message || "Location permission denied.");
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
        <section className="card" style={{ maxWidth: 760 }}>
          <div className="card-h">
            <div className="h">Operator Panel</div>
            <div className="muted">Simulate a moving bus</div>
          </div>
          <div className="card-b">
            <div className="muted" style={{ marginBottom: 8 }}>
              <Link to="/app">← Back to dashboard</Link>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              <div>
                <div className="label">Bus ID</div>
                <input className="input" value={busId} onChange={(e) => setBusId(e.target.value)} />
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
                <div className="label">Status</div>
                <div className="item" style={{ justifyContent: "flex-start" }}>
                  <b>{status}</b>
                  {sending ? <span className="kv" style={{ marginLeft: 8 }}>sending…</span> : null}
                </div>
              </div>
            </div>

            <div className="divider" />

            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              <button className="btn" onClick={start}>
                Start sharing location
              </button>
              <button className="select" onClick={stop}>
                Stop
              </button>
            </div>

            {err ? <div style={{ color: "#b91c1c", marginTop: 10 }}>{err}</div> : null}

            <div className="muted" style={{ marginTop: 10 }}>
              Tip: Keep the dashboard open on another tab and watch the bus appear/move in real-time.
            </div>
          </div>
        </section>
      </motion.main>
    </div>
  );
}

