import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

function SmartBusLogo() {
  // Simple inline SVG logo (no external file needed)
  return (
    <svg width="40" height="40" viewBox="0 0 64 64" aria-hidden="true">
      <defs>
        <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="rgba(255,255,255,0.22)" />
          <stop offset="1" stopColor="rgba(255,255,255,0.08)" />
        </linearGradient>
      </defs>
      <rect x="4" y="4" width="56" height="56" rx="14" fill="url(#g)" />
      <path
        d="M18 22c0-2.2 1.8-4 4-4h20c2.2 0 4 1.8 4 4v18c0 2.2-1.8 4-4 4H22c-2.2 0-4-1.8-4-4V22Z"
        fill="rgba(255,255,255,0.85)"
      />
      <path
        d="M22 24h20v10H22V24Z"
        fill="rgba(11,78,162,0.75)"
      />
      <circle cx="24" cy="44" r="3" fill="rgba(11,78,162,0.85)" />
      <circle cx="40" cy="44" r="3" fill="rgba(11,78,162,0.85)" />
      <path
        d="M24 20h16"
        stroke="rgba(11,78,162,0.65)"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

export default function GovHeader({ lastSyncText, backendOk }) {
  const nav = useNavigate();

  // Theme
  const [theme, setTheme] = useState(() => localStorage.getItem("theme") || "light");
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }, [theme]);
  const toggleTheme = () => setTheme((t) => (t === "dark" ? "light" : "dark"));

  // Session (demo)
  const session = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("smartbus_session") || "null");
    } catch {
      return null;
    }
  }, []);

  const logout = () => {
    localStorage.removeItem("smartbus_session");
    nav("/login");
    setTimeout(() => window.location.reload(), 50);
  };

  const syncShort = String(lastSyncText || "")
    .replace("Last sync:", "")
    .trim();

  return (
    <header className="gov-header">
      <div className="gov-header-row">
        {/* Left brand */}
        <div className="gov-brand">
          <div className="gov-logo" aria-label="smartBus logo">
            <SmartBusLogo />
          </div>

          <div className="gov-title">
            <div className="dept">Department of Transportation</div>
            <div className="app">
              <b>smartBus</b> — Real-Time Public Transport Tracking
            </div>
          </div>
        </div>

        {/* Right cluster */}
        <div className="gov-right">
          {/* Status pills */}
          <div className="gov-pills">
            <div className={`pill ${backendOk ? "ok" : "bad"}`}>
              <span className="status-dot" />
              {backendOk ? "Service Operational" : "Service Down"}
            </div>

            <div className="pill" title={lastSyncText}>
              ⟳ {syncShort || "Syncing"}
            </div>

            <div className="pill">☎ 1800-XXX-XXXX</div>
          </div>

          {/* Actions */}
          <div className="gov-actions">
            <button className="icon-btn" onClick={toggleTheme} title="Toggle theme">
              {theme === "dark" ? "🌙" : "☀️"}
              <span className="icon-btn-text">{theme === "dark" ? "Night" : "Day"}</span>
            </button>

            {session ? (
              <button className="icon-btn" onClick={logout} title="Logout">
                ⎋
                <span className="icon-btn-text">
                  Logout <span className="muted" style={{ color: "rgba(255,255,255,0.8)" }}>
                    ({session.role})
                  </span>
                </span>
              </button>
            ) : (
              <Link className="icon-btn" to="/login" title="Login">
                🔐 <span className="icon-btn-text">Login</span>
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
