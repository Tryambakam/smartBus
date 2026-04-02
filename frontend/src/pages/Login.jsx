import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import GovHeader from "../components/GovHeader";
import { useAuth } from "../contexts/AuthContext";
import useTheme from "../hooks/useTheme";
import SmartBusLogo from "../components/SmartBusLogo";

export default function Login() {
  const nav = useNavigate();
  const loc = useLocation();
  const { theme, toggleTheme } = useTheme();
  
  const { login } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Parse generic ?demo=1 query params if used historically
  useEffect(() => {
    const q = new URLSearchParams(loc.search);
    if (q.get("demo") === "1") {
      setUsername("admin");
      setPassword("pass");
    }
  }, [loc.search]);

  async function onLogin(e) {
    if (e) e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const activeUser = await login(username.trim(), password);
      // Explicit RBAC mapping jumps per operational requirements
      if (activeUser?.role === "admin") {
        nav("/admin");
      } else if (activeUser?.role === "operator") {
        nav("/operator");
      } else {
        nav("/dashboard");
      }
    } catch (e) {
      setError(String(e?.message || e));
    } finally {
      setLoading(false);
    }
  }

  const canSubmit = username.trim() && password;

  function loadDemo(u, p) {
    setUsername(u);
    setPassword(p);
  }

  const handleOfflineDemo = (sandboxRole) => {
    // Fabricate a Base64-encoded Mock JWT payload mimicking the backend generator
    const mockPayload = { userId: `mock-${Math.floor(Math.random() * 999)}`, role: sandboxRole, exp: Date.now() + 86400000 };
    const fakeJWT = `mockHeader.${btoa(JSON.stringify(mockPayload))}.mockSignature`;
    
    // Bypass strict httpOnly browser rules using explicit localStorage targeting
    localStorage.setItem("mock_jwt_token", fakeJWT);

    // Hard-reload the window forcing AuthContext to re-evaluate against /api/auth/me interceptor natively
    if (sandboxRole === "admin") window.location.href = "/admin";
    else if (sandboxRole === "operator") window.location.href = "/operator";
    else window.location.href = "/dashboard";
  };

  return (
    <div className="gov-shell bg-slate-50 dark:bg-slate-900 min-h-screen">
      <GovHeader
        lastSyncText="Secure Access"
        backendOk={true}
        onToggleTheme={toggleTheme}
        themeLabel={theme === "dark" ? "night" : "day"}
      />
      <div className="gov-banner border-b border-slate-200 dark:border-slate-800 bg-white/50 backdrop-blur-md">
        Sign in to your SmartBus role-based account.
      </div>

      <motion.main
        className="flex items-center justify-center p-6 mt-1"
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.45, ease: "easeOut" }}
      >
        <section className="bg-white dark:bg-slate-800 shadow-xl rounded-2xl w-full max-w-md border border-slate-200 dark:border-slate-700 overflow-hidden">
          <div className="p-8 border-b border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 flex flex-col items-center">
            <SmartBusLogo className="w-12 h-12 text-blue-600 drop-shadow-md mb-4" />
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-1 tracking-tight">Welcome Back</h2>
            <div className="text-slate-500 text-[11px] uppercase tracking-widest font-black">Authentication Engine</div>
          </div>

          <div className="p-8">
            <form onSubmit={onLogin} className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Username</label>
                <input
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all shadow-sm"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter assigned role handle"
                  autoComplete="username"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Password</label>
                <input
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all shadow-sm"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  type="password"
                  autoComplete="current-password"
                />
              </div>

              <button 
                className="w-full bg-[#1E3A8A] hover:bg-[#1e40af] disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3.5 rounded-md transition-all shadow-sm mt-6 uppercase tracking-wider text-sm" 
                type="submit" 
                disabled={!canSubmit || loading}
                style={{ color: '#ffffff' }}
              >
                {loading ? "Authenticating Payload…" : "Secure Sign In"}
              </button>

              {error && <div className="text-rose-500 bg-rose-50 dark:bg-rose-900/10 border border-rose-200 dark:border-rose-900/50 p-3 rounded-lg text-sm font-bold mt-4 text-center">{error}</div>}
              
              <div className="text-slate-500 text-sm text-center pt-3 font-semibold">
                New user? <Link to="/register" className="text-blue-600 hover:underline">Provision account</Link>
              </div>
            </form>
          </div>

          <div className="bg-slate-50 dark:bg-slate-900/50 p-6 border-t border-slate-100 dark:border-slate-800">
            <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest text-center mb-4">Development Test Credentials</div>
            <div className="flex flex-col gap-2.5">
              <button
                type="button"
                className="w-full flex justify-between items-center py-3 px-5 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-blue-50 border border-slate-200 hover:border-blue-300 dark:border-slate-700 dark:hover:border-blue-700 text-sm font-bold rounded-xl transition-colors shadow-sm"
                onClick={() => loadDemo("admin", "pass")}
              >
                <span>Admin Level</span>
                <span className="text-[11px] text-slate-400 font-mono tracking-tight bg-slate-100 dark:bg-slate-900 px-2 py-1 rounded">admin/pass</span>
              </button>
              <button
                type="button"
                className="w-full flex justify-between items-center py-3 px-5 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-emerald-50 border border-slate-200 hover:border-emerald-300 dark:border-slate-700 dark:hover:border-emerald-700 text-sm font-bold rounded-xl transition-colors shadow-sm"
                onClick={() => loadDemo("bus101", "pass")}
              >
                <span>Operator Matrix</span>
                <span className="text-[11px] text-slate-400 font-mono tracking-tight bg-slate-100 dark:bg-slate-900 px-2 py-1 rounded">bus101/pass</span>
              </button>
              <button
                type="button"
                className="w-full flex justify-between items-center py-3 px-5 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-indigo-50 border border-slate-200 hover:border-indigo-300 dark:border-slate-700 dark:hover:border-indigo-700 text-sm font-bold rounded-xl transition-colors shadow-sm"
                onClick={() => loadDemo("user", "pass")}
              >
                <span>Basic Commuter</span>
                <span className="text-[11px] text-slate-400 font-mono tracking-tight bg-slate-100 dark:bg-slate-900 px-2 py-1 rounded">user/pass</span>
              </button>
            </div>
            

          </div>
        </section>
      </motion.main>
    </div>
  );
}
