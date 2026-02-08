import { motion } from "framer-motion";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import GovHeader from "../components/GovHeader";

export default function Login() {
  const nav = useNavigate();
  const [role, setRole] = useState("passenger");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  function demoLogin(e) {
    e.preventDefault();

    // Demo session (frontend-only)
    const session = {
      role,
      email: email.trim() || `${role}@demo.local`,
      name:
        role === "admin" ? "Admin Officer" :
        role === "driver" ? "Driver" : "Citizen User",
      createdAt: new Date().toISOString(),
    };

    localStorage.setItem("smartbus_session", JSON.stringify(session));

    // role-based redirect
    if (role === "admin") nav("/admin");
    else if (role === "driver") nav("/driver");
    else nav("/");
  }

  return (
    <div className="gov-shell">
      <GovHeader lastSyncText="Secure Access" backendOk={true} />

      <div className="gov-banner">
        🔐 Authorized access for Admin/Driver. Passenger view is public.
      </div>

      <motion.main
        className="gov-main"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: "easeOut" }}
        style={{ gridTemplateColumns: "1fr", padding: 16 }}
      >
        <section className="card" style={{ maxWidth: 520, margin: "0 auto" }}>
          <div className="card-h">
            <div className="h">Login</div>
            <div className="muted">Role-based access</div>
          </div>

          <div className="card-b">
            <form onSubmit={demoLogin}>
              <div className="label">Select Role</div>
              <select className="select" value={role} onChange={(e) => setRole(e.target.value)}>
                <option value="passenger">Passenger (Public)</option>
                <option value="driver">Driver (Authorized)</option>
                <option value="admin">Admin (Authority)</option>
              </select>

              <div className="divider" />

              <div className="label">Email</div>
              <input
                className="input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
              />

              <div style={{ height: 10 }} />

              <div className="label">Password</div>
              <input
                className="input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                type="password"
              />

              <div className="divider" />

              <button className="btn" type="submit">
                Sign in (Demo)
              </button>

              <div className="muted" style={{ marginTop: 10 }}>
                Note: This is demo login for capstone UI. Backend auth will be connected later.
              </div>
            </form>
          </div>
        </section>
      </motion.main>
    </div>
  );
}
