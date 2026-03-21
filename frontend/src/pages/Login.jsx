import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import GovHeader from "../components/GovHeader";
import { useAuth } from "../contexts/AuthContext";
import useTheme from "../hooks/useTheme";

export default function Login() {
  const nav = useNavigate();
  const loc = useLocation();
  const { theme, toggleTheme } = useTheme();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const DEMO_EMAIL = "admin@smartbus.local";
  const DEMO_PASSWORD = "Admin@12345";

  useEffect(() => {
    const q = new URLSearchParams(loc.search);
    if (q.get("demo") === "1") {
      setEmail(DEMO_EMAIL);
      setPassword(DEMO_PASSWORD);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function onLogin(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await login(email.trim(), password);
      nav("/app");
    } catch (e) {
      setError(String(e?.message || e));
    } finally {
      setLoading(false);
    }
  }

  const canSubmit = email.trim() && password;

  return (
    <div className="gov-shell">
      <GovHeader
        lastSyncText="Secure Access"
        backendOk={true}
        onToggleTheme={toggleTheme}
        themeLabel={theme === "dark" ? "night" : "day"}
      />

      <div className="gov-banner">Sign in to your SmartBus account.</div>

      <motion.main
        className="gov-main login-main"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: "easeOut" }}
      >
        <section className="card">
          <div className="card-h">
            <div className="h">Login</div>
            <div className="muted">Use your email and password</div>
          </div>

          <div className="card-b">
            <form onSubmit={onLogin}>
              <div className="label">Email</div>
              <input
                className="input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                autoComplete="email"
              />

              <div style={{ height: 10 }} />

              <div className="label">Password</div>
              <input
                className="input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                type="password"
                autoComplete="current-password"
              />

              <div className="divider" />

              <button className="btn" type="submit" disabled={!canSubmit || loading}>
                {loading ? "Signing in…" : "Sign in"}
              </button>

              {error && <div style={{ color: "#b91c1c", marginTop: 10 }}>{error}</div>}

              <div className="muted" style={{ marginTop: 10 }}>
                New here? <Link to="/register">Create an account</Link>
              </div>

              <div className="divider" />

              <button
                className="select"
                type="button"
                onClick={() => {
                  setEmail(DEMO_EMAIL);
                  setPassword(DEMO_PASSWORD);
                }}
              >
                Use demo credentials
              </button>

              <div className="muted" style={{ marginTop: 8 }}>
                Demo: <b>{DEMO_EMAIL}</b> / <b>{DEMO_PASSWORD}</b>
              </div>
            </form>
          </div>
        </section>
      </motion.main>
    </div>
  );
}
