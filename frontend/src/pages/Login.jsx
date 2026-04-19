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

  return (
    <div className="gov-shell min-h-screen flex flex-col bg-gradient-to-br from-[#041124] via-[#09224f] to-[#010914] relative">
      <GovHeader
        lastSyncText="Secure Auth Node"
        backendOk={true}
        onToggleTheme={toggleTheme}
        themeLabel={theme === "dark" ? "night" : "day"}
      />
      
      {/* Dynamic Background subtle overlay */}
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 pointer-events-none mix-blend-overlay"></div>

      <motion.main
        className="flex-1 flex items-center justify-center p-4 sm:p-8 z-10"
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        <div 
          className="w-full max-w-5xl flex flex-col md:flex-row rounded-xl overflow-hidden shadow-[0_25px_60px_-10px_rgba(0,0,0,0.8)] border border-white/10"
          style={{
            backdropFilter: "blur(24px)",
            WebkitBackdropFilter: "blur(24px)",
            backgroundColor: "rgba(10, 15, 30, 0.4)"
          }}
        >
          {/* Main Enclosure (Brushed Aluminum & Glass) */}
          <section 
            className="flex-1 p-10 md:p-14 relative flex flex-col justify-center items-center"
            style={{
              background: theme === 'dark'
                ? "linear-gradient(135deg, rgba(30,41,59,0.92) 0%, rgba(15,23,42,0.98) 100%)"
                : "linear-gradient(135deg, rgba(248,250,252,0.95) 0%, rgba(226,232,240,0.98) 100%)",
              boxShadow: "inset 0 1px 1px rgba(255,255,255,0.2), inset 0 0 20px rgba(0,0,0,0.05)"
            }}
          >
            {/* Brushed texture overlay */}
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/brushed-alum.png')] opacity-[0.03] dark:opacity-10 pointer-events-none"></div>
            
            <div className="w-full max-w-[340px] flex flex-col items-center relative z-10">
              <img 
                src="https://upload.wikimedia.org/wikipedia/commons/5/55/Emblem_of_India.svg" 
                alt="Government Crest" 
                className={`h-24 mb-6 transition-all duration-300 ${theme === 'dark' ? 'filter brightness-0 invert opacity-90 drop-shadow-md' : 'opacity-90 drop-shadow-sm'}`}
              />
              
              <h2 className="text-[26px] font-extrabold text-slate-900 dark:text-white mb-2 tracking-tight text-center">
                Secure Access Portal
              </h2>
              <p className="text-slate-600 dark:text-slate-400 text-[14px] text-center mb-8 font-medium px-2 leading-relaxed">
                Sign in to your authorized role-based account
              </p>

              <form onSubmit={onLogin} className="space-y-6 w-full">
                <div>
                  <label className="block text-[12px] font-bold text-slate-700 dark:text-slate-400 mb-2 uppercase tracking-widest pl-1">
                    User ID
                  </label>
                  <input
                    className="w-full px-4 py-3.5 rounded border border-slate-300 dark:border-white/10 bg-white/70 dark:bg-[#0b1324]/60 text-slate-900 dark:text-white shadow-inner focus:outline-none focus:ring-2 focus:ring-[#0a3161] focus:border-[#0a3161] dark:focus:ring-blue-500/50 dark:focus:border-blue-500 transition-all text-[15px] font-medium backdrop-blur-sm"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Enter official credentials"
                    autoComplete="username"
                  />
                </div>

                <div>
                  <label className="block text-[12px] font-bold text-slate-700 dark:text-slate-400 mb-2 uppercase tracking-widest pl-1">
                    Password
                  </label>
                  <input
                    className="w-full px-4 py-3.5 rounded border border-slate-300 dark:border-white/10 bg-white/70 dark:bg-[#0b1324]/60 text-slate-900 dark:text-white shadow-inner focus:outline-none focus:ring-2 focus:ring-[#0a3161] focus:border-[#0a3161] dark:focus:ring-blue-500/50 dark:focus:border-blue-500 transition-all text-[15px] font-medium backdrop-blur-sm tracking-widest placeholder:tracking-normal"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    type="password"
                    autoComplete="current-password"
                  />
                </div>

                <button 
                  className="w-full bg-[#0a3161] hover:bg-[#08264a] text-white font-bold py-4 rounded transition-all mt-4 shadow-[0_4px_14px_0_rgba(10,49,97,0.39)] hover:shadow-[0_6px_20px_rgba(10,49,97,0.23)] active:scale-[0.98] uppercase tracking-[0.15em] text-[13px] disabled:opacity-60 disabled:cursor-not-allowed border border-white/5" 
                  type="submit" 
                  disabled={!canSubmit || loading}
                >
                  {loading ? "Authenticating..." : "Secure Sign In"}
                </button>

                {error && (
                  <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800/50 p-3 rounded text-[13px] font-semibold mt-4 text-center">
                    {error}
                  </motion.div>
                )}
              </form>

              {/* Dev Test Credentials */}
              <div className="mt-8 pt-6 border-t border-slate-300 dark:border-slate-700/50 w-full">
                <div className="text-[9px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-widest text-center mb-3">
                  Development Shortcuts
                </div>
                <div className="flex gap-2 justify-center">
                  <button onClick={() => loadDemo("admin", "pass")} type="button" className="text-[11px] px-3 py-1.5 bg-slate-200 dark:bg-slate-800/50 border border-slate-300 dark:border-slate-700 rounded font-mono text-slate-600 dark:text-slate-400 hover:bg-slate-300 dark:hover:bg-slate-700 transition">admin</button>
                  <button onClick={() => loadDemo("bus101", "pass")} type="button" className="text-[11px] px-3 py-1.5 bg-slate-200 dark:bg-slate-800/50 border border-slate-300 dark:border-slate-700 rounded font-mono text-slate-600 dark:text-slate-400 hover:bg-slate-300 dark:hover:bg-slate-700 transition">operator</button>
                </div>
              </div>

            </div>
          </section>

          {/* Security Notice Panel */}
          <aside className="hidden md:flex md:w-[45%] bg-[#020b18]/90 p-12 flex-col border-l border-white/5 relative overflow-hidden backdrop-blur-xl">
            {/* Decorative background crest/shield watermark */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-[0.03] pointer-events-none">
              <svg width="400" height="400" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 21c-4.14 0-7.5-3.36-7.5-7.5S7.86 7 12 7s7.5 3.36 7.5 7.5S16.14 22 12 22zm0-13c-3.03 0-5.5 2.47-5.5 5.5S8.97 20 12 20s5.5-2.47 5.5-5.5S15.03 9 12 9z"/>
              </svg>
            </div>

            <div className="flex items-center gap-3 text-rose-500 font-bold tracking-[0.2em] text-xs mb-8 uppercase relative z-10 border-b border-rose-500/20 pb-4">
              <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
              Security Notice
            </div>
            
            <div className="space-y-6 relative z-10">
              <p className="text-[13px] leading-relaxed font-medium text-slate-300">
                You are accessing a Government Information System (IS) that is provided for officially authorized use only.
              </p>
              <p className="text-[13px] leading-relaxed font-medium text-slate-300">
                Information on this system is subject to interception, recording, reading, copying, and auditing by authorized personnel.
              </p>
              <p className="text-[13px] leading-relaxed font-medium text-slate-300">
                Unauthorized or improper use of this system may result in disciplinary action and civil and criminal penalties. By continuing to use this system you indicate your awareness of and consent to these terms and conditions.
              </p>
            </div>

            <div className="mt-auto pt-10 relative z-10 text-center">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-bold uppercase tracking-widest mx-auto mb-3">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></div>
                Secure Connection
              </div>
              <div className="text-[9px] font-bold text-slate-500 uppercase tracking-widest block">
                Official Use Only
              </div>
            </div>
          </aside>
        </div>
      </motion.main>
      
      {/* Global Footer */}
      <div className="mt-auto pb-4 text-center text-[10px] font-bold tracking-widest uppercase text-white/30 z-10 w-full relative">
        Department of Transportation &bull; smartBus Platform
      </div>
    </div>
  );
}
