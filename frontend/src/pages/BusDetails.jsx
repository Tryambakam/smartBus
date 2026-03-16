import { motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import GovHeader from "../components/GovHeader";
import { getBusEta } from "../api";

function fmtMins(x) {
  if (x == null || Number.isNaN(Number(x))) return "—";
  const m = Math.max(0, Number(x));
  return m < 1 ? "< 1 min" : `${Math.round(m)} min`;
}

export default function BusDetails() {
  const { busId } = useParams();

  const [eta, setEta] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        setErr("");
        setLoading(true);
        const data = await getBusEta(busId);
        if (!cancelled) setEta(data);
      } catch (e) {
        if (!cancelled) setErr(e?.message || "Failed to load ETA");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [busId]);

  const backendOk = !err;
  const lastSyncText = loading ? "Loading ETA…" : "ETA loaded";

  const nextStops = useMemo(() => {
    if (!eta || !eta.nextStops) return [];
    return Array.isArray(eta.nextStops) ? eta.nextStops : [];
  }, [eta]);

  return (
    <div className="gov-shell">
      <GovHeader lastSyncText={lastSyncText} backendOk={backendOk} />

      <div className="gov-banner">
        ℹ️ Passenger information: Estimated arrival times are approximations based on last known speed/location.
      </div>

      <motion.main
        className="gov-main"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: "easeOut" }}
      >
        {/* Left: Summary */}
        <section className="card left-panel">
          <div className="card-h">
            <div className="h">Bus Details</div>
            <div className="muted">Tracking & ETA</div>
          </div>

          <div className="card-b">
            <div className="muted" style={{ marginBottom: 8 }}>
              <Link to="/app">← Back to Live Map</Link>
            </div>

            <div style={{ fontSize: 18, fontWeight: 900 }}>{busId}</div>

            <div className="divider" />

            {loading ? (
              <>
                <div className="skel skel-line lg" />
                <div className="skel skel-line md" />
                <div className="skel skel-line sm" />
              </>
            ) : err ? (
              <div style={{ color: "#b91c1c", fontSize: 13 }}>
                {String(err).includes("routeId not set")
                  ? "This bus is not assigned to a route yet. Ask admin to link routeId in GPS updates."
                  : "ETA is currently unavailable. Please try again."}
                <div className="muted" style={{ marginTop: 6 }}>
                  Technical: {err}
                </div>
              </div>
            ) : (
              <>
                <div className="kv">Route: <b>{eta?.routeId || "—"}</b></div>
                <div className="kv">Speed used: <b>{eta?.speedKmh ?? "—"}</b> km/h</div>
                <div className="kv">Calculated at: <b>{eta?.calculatedAt ? new Date(eta.calculatedAt).toLocaleTimeString() : "—"}</b></div>
              </>
            )}

            <div className="divider" />

            <button className="btn" onClick={() => window.location.reload()}>
              Refresh ETA
            </button>
          </div>
        </section>

        {/* Center: Animated ETA Timeline */}
        <section className="card map-card" style={{ padding: 0 }}>
          <div className="card-h">
            <div className="h">Estimated Arrivals</div>
            <div className="muted">Next stops (animated)</div>
          </div>

          <div className="card-b">
            {loading ? (
              <>
                <div className="skel-card">
                  <div className="skel skel-line lg" />
                  <div className="skel skel-line md" />
                </div>
                <div className="skel-card" style={{ marginTop: 10 }}>
                  <div className="skel skel-line lg" />
                  <div className="skel skel-line md" />
                </div>
              </>
            ) : err ? (
              <div className="muted">
                ETA timeline not available.
              </div>
            ) : nextStops.length === 0 ? (
              <div className="muted">
                No upcoming stops found for this bus route.
              </div>
            ) : (
              <div className="eta-timeline">
                {nextStops.map((s, idx) => (
                  <motion.div
                    key={s.stopId || idx}
                    className="eta-item"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.35, delay: idx * 0.08 }}
                  >
                    <div className="eta-left">
                      <div className={`eta-dot ${idx === 0 ? "active" : ""}`} />
                      {idx < nextStops.length - 1 && <div className="eta-line" />}
                    </div>

                    <div className="eta-content">
                      <div className="eta-top">
                        <div>
                          <div className="eta-stop">
                            {s.name_en || s.stopId}
                          </div>
                          <div className="muted" style={{ marginTop: 2 }}>
                            Stop ID: {s.stopId} · Seq: {s.sequence ?? "—"} · {s.distanceKm ?? "—"} km
                          </div>
                        </div>

                        <div className="eta-badge">
                          {fmtMins(s.etaMinutes)}
                        </div>
                      </div>

                      {idx === 0 && (
                        <div className="eta-sub">
                          Nearest stop (most likely next).
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Right: Tips / Notes */}
        <section className="card right-panel">
          <div className="card-h">
            <div className="h">Passenger Tips</div>
            <div className="muted">Useful info</div>
          </div>

          <div className="card-b">
            <div className="item" style={{ flexDirection: "column" }}>
              <b>How ETA is calculated</b>
              <div className="kv">
                Using last GPS + approximate distance to nearby stops. Speed fallback applies if speed is missing.
              </div>
            </div>

            <div className="divider" />

            <div className="item" style={{ flexDirection: "column" }}>
              <b>Disclaimer</b>
              <div className="kv">
                ETA may vary due to traffic, stoppages, and GPS delay.
              </div>
            </div>
          </div>
        </section>
      </motion.main>
    </div>
  );
}
