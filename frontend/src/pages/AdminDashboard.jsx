import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import GovHeader from "../components/GovHeader";

export default function AdminDashboard() {
  return (
    <div className="gov-shell">
      <GovHeader lastSyncText="Admin Console" backendOk={true} />
      <div className="gov-banner">🛡 Authority Panel — manage routes, stops and assignments.</div>

      <motion.main className="gov-main" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
        <section className="card left-panel">
          <div className="card-h">
            <div className="h">Quick Actions</div>
            <div className="muted">Admin</div>
          </div>
          <div className="card-b">
            <div className="item" style={{ flexDirection: "column" }}>
              <b>Create Route</b>
              <div className="kv">Add new route ID and name</div>
            </div>
            <div className="divider" />
            <div className="item" style={{ flexDirection: "column" }}>
              <b>Add Stops</b>
              <div className="kv">Add stop sequence & coordinates</div>
            </div>
            <div className="divider" />
            <Link to="/">← Back to Live Map</Link>
          </div>
        </section>

        <section className="card map-card">
          <div className="card-h">
            <div className="h">Admin Overview</div>
            <div className="muted">Coming next</div>
          </div>
          <div className="card-b">
            <div className="muted">
              Next: connect to backend auth + allow managing routes/stops via admin APIs.
            </div>
          </div>
        </section>

        <section className="card right-panel">
          <div className="card-h">
            <div className="h">Security Notes</div>
            <div className="muted">Cyber angle</div>
          </div>
          <div className="card-b">
            <div className="item" style={{ flexDirection: "column" }}>
              <b>RBAC</b>
              <div className="kv">Admin / Driver / Passenger access separation</div>
            </div>
            <div className="divider" />
            <div className="item" style={{ flexDirection: "column" }}>
              <b>Audit Logs</b>
              <div className="kv">All updates can be logged (future)</div>
            </div>
          </div>
        </section>
      </motion.main>
    </div>
  );
}
