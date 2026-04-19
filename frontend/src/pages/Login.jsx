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
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

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

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-[#0a0d14] font-sans transition-colors duration-300">
      <GovHeader
        lastSyncText="System Login"
        backendOk={true}
        onToggleTheme={toggleTheme}
        themeLabel={theme === "dark" ? "night" : "day"}
      />
      
      <main className="flex-1 flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="w-full max-w-[380px]"
        >
          <div className="bg-white dark:bg-[#111622] rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-8 sm:p-10">
            <div className="flex flex-col items-center mb-8">
              <img 
                src="https://upload.wikimedia.org/wikipedia/commons/5/55/Emblem_of_India.svg" 
                alt="Government Crest" 
                className={`h-14 mb-4 transition-all duration-300 ${theme === 'dark' ? 'filter brightness-0 invert opacity-40' : 'opacity-60'}`}
              />
              <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
                Secure Access
              </h2>
            </div>

            <form onSubmit={onLogin} className="space-y-5">
              <div>
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wider">
                  User ID
                </label>
                <input
                  className="w-full px-4 py-3 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-[#0d111a] text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#0a3161] dark:focus:ring-blue-500 transition-shadow text-sm"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Official ID"
                  autoComplete="username"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wider">
                  Password
                </label>
                <input
                  className="w-full px-4 py-3 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-[#0d111a] text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#0a3161] dark:focus:ring-blue-500 transition-shadow text-sm font-mono tracking-widest placeholder:tracking-normal placeholder:font-sans"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  type="password"
                  autoComplete="current-password"
                />
              </div>

              {error && (
                <div className="text-rose-600 dark:text-rose-400 text-xs font-medium text-center bg-rose-50 dark:bg-rose-900/10 py-2 px-3 rounded-lg">
                  {error}
                </div>
              )}

              <button 
                className="w-full bg-[#0a3161] hover:bg-[#08264a] text-white font-semibold py-3 rounded-lg transition-colors mt-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed" 
                type="submit" 
                disabled={!canSubmit || loading}
              >
                {loading ? "Authenticating..." : "Sign In"}
              </button>
            </form>

            <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800">
              <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest text-center mb-3">
                Demo Accounts
              </div>
              <div className="flex gap-2 justify-center">
                <button onClick={() => loadDemo("admin", "pass")} type="button" className="text-xs px-3 py-1.5 bg-slate-100 dark:bg-slate-800/50 rounded-md font-mono text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">admin</button>
                <button onClick={() => loadDemo("bus101", "pass")} type="button" className="text-xs px-3 py-1.5 bg-slate-100 dark:bg-slate-800/50 rounded-md font-mono text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">bus101</button>
              </div>
            </div>
          </div>
        </motion.div>
      </main>
      
      <div className="py-6 text-center text-xs font-medium text-slate-400 dark:text-slate-600">
        Dept. of Transportation
      </div>
    </div>
  );
}
