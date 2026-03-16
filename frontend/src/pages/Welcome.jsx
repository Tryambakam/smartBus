import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import GovHeader from "../components/GovHeader";
import { getAuthToken } from "../api";
import useTheme from "../hooks/useTheme";

export default function Welcome() {
  const nav = useNavigate();
  const token = getAuthToken();
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="gov-shell">
      <GovHeader
        lastSyncText="Welcome"
        backendOk={true}
        onToggleTheme={toggleTheme}
        themeLabel={theme === "dark" ? "night" : "day"}
      />
      <div className="gov-banner">SmartBus — secure transport tracking.</div>

      <motion.main
        className="gov-main login-main"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: "easeOut" }}
      >
        <section className="card" style={{ maxWidth: 680 }}>
          <div className="card-h">
            <div className="h">Welcome</div>
            <div className="muted">Minimal · Secure · Real-time</div>
          </div>

          <div className="card-b">
            <motion.div
              className="item"
              style={{ flexDirection: "column", gap: 6 }}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25 }}
              whileHover={{ y: -2 }}
            >
              <b>Access required</b>
              <div className="kv">
                To prevent misuse, the live dashboard is available only to authenticated users (ID-verification can be added next).
              </div>
              <div className="muted" style={{ marginTop: 6 }}>
                Quick start: you can create an account in under 30 seconds.
              </div>
            </motion.div>

            <div className="divider" />

            <div style={{ display: "grid", gap: 10 }}>
              <Link className="btn" to="/login">
                Sign in
              </Link>
              <Link className="btn" to="/register">
                Create account
              </Link>
              <Link className="select" to="/login?demo=1">
                Use demo credentials
              </Link>
              {token ? (
                <button className="btn" onClick={() => nav("/app")}>
                  Continue →
                </button>
              ) : null}
            </div>
          </div>
        </section>
      </motion.main>
    </div>
  );
}

