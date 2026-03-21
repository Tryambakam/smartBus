import { motion } from "framer-motion";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import GovHeader from "../components/GovHeader";
import { useAuth } from "../contexts/AuthContext";
import useTheme from "../hooks/useTheme";

export default function Register() {
  const nav = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const { register } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onRegister(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await register(name.trim(), email.trim(), password);
      nav("/app");
    } catch (e) {
      setError(String(e?.message || e));
    } finally {
      setLoading(false);
    }
  }

  const canSubmit = name.trim() && email.trim() && password;

  return (
    <div className="gov-shell">
      <GovHeader
        lastSyncText="Create Account"
        backendOk={true}
        onToggleTheme={toggleTheme}
        themeLabel={theme === "dark" ? "night" : "day"}
      />
      <div className="gov-banner">Create your SmartBus account.</div>

      <motion.main
        className="gov-main login-main"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: "easeOut" }}
      >
        <section className="card">
          <div className="card-h">
            <div className="h">Register</div>
            <div className="muted">Name, email, password</div>
          </div>

          <div className="card-b">
            <form onSubmit={onRegister}>
              <div className="label">Full name</div>
              <input
                className="input"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
                autoComplete="name"
              />

              <div style={{ height: 10 }} />

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
                autoComplete="new-password"
              />

              <div className="divider" />

              <button className="btn" type="submit" disabled={!canSubmit || loading}>
                {loading ? "Creating…" : "Create account"}
              </button>

              {error && <div style={{ color: "#b91c1c", marginTop: 10 }}>{error}</div>}

              <div className="muted" style={{ marginTop: 10 }}>
                Already have an account? <Link to="/login">Sign in</Link>
              </div>
            </form>
          </div>
        </section>
      </motion.main>
    </div>
  );
}

