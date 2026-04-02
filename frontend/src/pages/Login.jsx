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
        <section className="bg-white dark:bg-[#111111] shadow-none rounded-none w-full max-w-md border border-gray-300 dark:border-gray-700 border-t-4 border-t-[#0a3161] overflow-hidden">
          <div className="p-8 border-b border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-[#1a1d24] flex flex-col items-center">
            <SmartBusLogo className="w-12 h-12 text-[#0a3161] dark:text-blue-400 mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-1 tracking-tight">Welcome Back</h2>
            <div className="text-gray-500 text-[11px] uppercase tracking-widest font-black">Authentication Engine</div>
          </div>

          <div className="p-8">
            <form onSubmit={onLogin} className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Username</label>
                <input
                  className="w-full px-4 py-3 rounded-none border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#111111] text-gray-900 dark:text-white focus:outline-none focus:border-[#0a3161] dark:focus:border-blue-400 transition-colors"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter assigned role handle"
                  autoComplete="username"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Password</label>
                <input
                  className="w-full px-4 py-3 rounded-none border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#111111] text-gray-900 dark:text-white focus:outline-none focus:border-[#0a3161] dark:focus:border-blue-400 transition-colors"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  type="password"
                  autoComplete="current-password"
                />
              </div>

              <button 
                className="w-full bg-[#0a3161] hover:bg-[#072448] border border-[#0a3161] disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3.5 rounded-none transition-colors mt-6 uppercase tracking-wider text-sm" 
                type="submit" 
                disabled={!canSubmit || loading}
              >
                {loading ? "Authenticating Payload…" : "Secure Sign In"}
              </button>

              {error && <div className="text-rose-500 bg-rose-50 dark:bg-rose-900/10 border border-rose-200 dark:border-rose-900/50 p-3 rounded-lg text-sm font-bold mt-4 text-center">{error}</div>}
              
              <div className="text-slate-500 text-sm text-center pt-3 font-semibold">
                New user? <Link to="/register" className="text-blue-600 hover:underline">Provision account</Link>
              </div>
            </form>
          </div>

          <div className="bg-gray-50 dark:bg-[#1a1d24] p-6 border-t border-gray-300 dark:border-gray-700">
            <div className="text-[10px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest text-center mb-4">Development Test Credentials</div>
            <div className="flex flex-col gap-2.5">
              <button
                type="button"
                className="w-full flex justify-between items-center py-3 px-5 bg-white dark:bg-[#111111] text-gray-800 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 border border-gray-300 dark:border-gray-700 text-sm font-bold rounded-none transition-colors"
                onClick={() => loadDemo("admin", "pass")}
              >
                <span>Admin Level</span>
                <span className="text-[11px] text-gray-500 font-mono tracking-tight bg-gray-100 dark:bg-gray-800 px-2 py-1 border border-gray-200 dark:border-gray-700">admin/pass</span>
              </button>
              <button
                type="button"
                className="w-full flex justify-between items-center py-3 px-5 bg-white dark:bg-[#111111] text-gray-800 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 border border-gray-300 dark:border-gray-700 text-sm font-bold rounded-none transition-colors"
                onClick={() => loadDemo("bus101", "pass")}
              >
                <span>Operator Matrix</span>
                <span className="text-[11px] text-gray-500 font-mono tracking-tight bg-gray-100 dark:bg-gray-800 px-2 py-1 border border-gray-200 dark:border-gray-700">bus101/pass</span>
              </button>
              <button
                type="button"
                className="w-full flex justify-between items-center py-3 px-5 bg-white dark:bg-[#111111] text-gray-800 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 border border-gray-300 dark:border-gray-700 text-sm font-bold rounded-none transition-colors"
                onClick={() => loadDemo("user", "pass")}
              >
                <span>Basic Commuter</span>
                <span className="text-[11px] text-gray-500 font-mono tracking-tight bg-gray-100 dark:bg-gray-800 px-2 py-1 border border-gray-200 dark:border-gray-700">user/pass</span>
              </button>
            </div>
            

          </div>
        </section>
      </motion.main>
    </div>
  );
}
