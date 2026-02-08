import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import GovHeader from "../components/GovHeader";

export default function DriverDashboard() {
  return (
    <div className="gov-shell">
      <GovHeader lastSyncText="Driver Mode" backendOk={true} />
      <div className="gov-banner">🚌 Driver Panel — start trip & share location.</div>

      <motion.main className="gov-main" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
        <section className="card left-panel">
          <div className="card-h">
            <div className="h">Trip Controls</div>
            <div className="muted">Driver</div>
          </div>
          <div className="card-b">
            <button className="btn" onClick={() => alert("Trip started (demo)")}>Start Trip</button>
            <div style={{ height: 10 }} />
            <button className="select" onClick={() => alert("Trip ended (demo)")}>End Trip</button>
            <div className="divider" />
            <div className="muted">Next: connect GPS update endpoint with auth.</div>
            <div className="divider" />
            <Link to="/">← Back to Live Map</Link>
          </div>
        </section>

        <section className="card map-card">
          <div className="card-h">
            <div className="h">Status</div>
            <div className="muted">Demo mode</div>
          </div>
          <div className="card-b">
            <div className="item" style={{ flexDirection: "column" }}>
              <b>GPS Sharing</b>
              <div className="kv">Currently: simulated. Later: secured driver-only updates.</div>
            </div>
          </div>
        </section>

        <section className="card right-panel">
          <div className="card-h">
            <div className="h">Safety</div>
            <div className="muted">Guidelines</div>
          </div>
          <div className="card-b">
            <div className="item" style={{ flexDirection: "column" }}>
              <b>Do not use phone while driving</b>
              <div className="kv">Location updates run in background.</div>
            </div>
          </div>
        </section>
      </motion.main>
    </div>
  );
}
