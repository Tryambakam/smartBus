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
  const [identity, setIdentity] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const q = new URLSearchParams(loc.search);
    if (q.get("demo") === "1") {
      setIdentity("admin");
      setPassword("pass");
    }
  }, [loc.search]);

  async function onLogin(e) {
    if (e) e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const activeUser = await login(identity.trim(), password);
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

  const canSubmit = identity.trim() && password;

  function loadDemo(i, p) {
    setIdentity(i);
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
          <div className="bg-white dark:bg-[#0f141e] rounded-xl border-t-4 border-t-[#0a3161] border border-slate-200 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-black/50 p-8 sm:p-10 transition-colors">
            <div className="flex flex-col items-center mb-8">
              <img 
                src="https://upload.wikimedia.org/wikipedia/commons/5/55/Emblem_of_India.svg" 
                alt="Government Crest" 
                className={`h-14 mb-4 transition-all duration-300 ${theme === 'dark' ? 'filter brightness-0 invert opacity-40' : 'opacity-60'}`}
              />
              <h2 className="text-[20px] font-black uppercase tracking-widest text-[#0f172a] dark:text-white leading-tight">
                Welcome Back
              </h2>
            </div>

            <form onSubmit={onLogin} className="space-y-5">
              <div>
                <label className="block text-[10px] font-black tracking-[0.15em] uppercase text-slate-500 dark:text-slate-400 mb-2">
                  Email ID or Mobile Number
                </label>
                <input
                  className="w-full px-4 py-3 rounded-md border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-[#0a0d14] text-slate-900 dark:text-white focus:outline-none focus:border-[#0a3161] focus:ring-1 focus:ring-[#0a3161] dark:focus:border-cyan-500 dark:focus:ring-cyan-500 transition-all text-sm font-bold placeholder:font-normal placeholder:opacity-70 uppercase tracking-widest shadow-inner shadow-slate-100 dark:shadow-none"
                  value={identity}
                  onChange={(e) => setIdentity(e.target.value)}
                  placeholder="Email or Mobile"
                  autoComplete="username"
                />
              </div>

              <div>
                <label className="block text-[10px] font-black tracking-[0.15em] uppercase text-slate-500 dark:text-slate-400 mb-2 mt-4">
                  Password
                </label>
                <input
                  className="w-full px-4 py-3 rounded-md border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-[#0a0d14] text-slate-900 dark:text-white focus:outline-none focus:border-[#0a3161] focus:ring-1 focus:ring-[#0a3161] dark:focus:border-cyan-500 dark:focus:ring-cyan-500 transition-all text-sm font-mono tracking-[0.2em] placeholder:tracking-normal placeholder:font-sans shadow-inner shadow-slate-100 dark:shadow-none"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  type="password"
                  autoComplete="current-password"
                />
              </div>

              {error && (
                <div className="text-rose-600 dark:text-rose-400 text-[11px] font-bold tracking-widest text-center bg-rose-50 dark:bg-rose-900/10 py-3 border border-rose-200 dark:border-rose-900 uppercase">
                  {error}
                </div>
              )}

              <button 
                className="w-full bg-[#0a3161] hover:bg-[#11468F] dark:bg-cyan-600 dark:hover:bg-cyan-500 text-white font-bold py-4 rounded-md transition-colors mt-4 text-[13px] uppercase tracking-[0.15em] shadow-lg shadow-blue-900/20 dark:shadow-cyan-900/30 border border-transparent disabled:opacity-50 disabled:cursor-not-allowed group flex justify-center items-center gap-2" 
                type="submit" 
                disabled={!canSubmit || loading}
              >
                {loading ? "Authenticating..." : (
                  <>
                    <span>Sign In</span>
                    <i className="fa-solid fa-arrow-right text-blue-300 dark:text-white group-hover:translate-x-1 transition-transform mb-[1px]"></i>
                  </>
                )}
              </button>
            </form>

            <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800">
              <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest text-center mb-3">
                Demo Accounts
              </div>
              <div className="flex gap-3 justify-center">
                <button onClick={() => loadDemo("admin", "pass")} type="button" className="text-[10px] uppercase font-bold tracking-widest px-5 py-2 rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-all border border-slate-200 dark:border-slate-700">admin</button>
                <button onClick={() => loadDemo("bus101", "pass")} type="button" className="text-[10px] uppercase font-bold tracking-widest px-5 py-2 rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-all border border-slate-200 dark:border-slate-700">bus101</button>
              </div>
            </div>
          </div>
        </motion.div>
      </main>
      
      <div className="py-6 text-center text-[10px] font-bold uppercase tracking-widest text-slate-500">
        City Bus Transit Service
      </div>
    </div>
  );
}
