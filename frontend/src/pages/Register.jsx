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
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onRegister(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const activeUser = await register(name.trim(), username.trim(), password);
      if (activeUser?.role === "admin") nav("/admin");
      else if (activeUser?.role === "operator") nav("/operator");
      else nav("/");
    } catch (e) {
      setError(String(e?.message || e));
    } finally {
      setLoading(false);
    }
  }

  const canSubmit = name.trim() && username.trim() && password;

  return (
    <div className="bg-slate-50 dark:bg-slate-900 min-h-screen">
      <GovHeader
        lastSyncText="Provision Account"
        backendOk={true}
        onToggleTheme={toggleTheme}
        themeLabel={theme === "dark" ? "night" : "day"}
      />
      <div className="gov-banner border-b border-slate-200 dark:border-slate-800 bg-white/50 backdrop-blur-md">
        Create your SmartBus authenticated matrix profile.
      </div>

      <motion.main
        className="flex items-center justify-center p-6 mt-1"
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.45, ease: "easeOut" }}
      >
        <section className="bg-white dark:bg-slate-800 shadow-xl rounded-2xl w-full max-w-md border border-slate-200 dark:border-slate-700 overflow-hidden">
          <div className="p-8 border-b border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 flex flex-col items-center">
            <h2 className="text-2xl font-[800] text-slate-900 dark:text-white mb-1 tracking-tight">Provision Profile</h2>
            <div className="text-slate-500 text-[11px] uppercase tracking-widest font-[800]">Identity Registration</div>
          </div>

          <div className="p-8">
            <form onSubmit={onRegister} className="space-y-4">
              <div>
                <label className="block text-[13px] font-[600] text-slate-700 dark:text-slate-300 mb-1.5">Full Name</label>
                <input
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all shadow-sm"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="System alias"
                  autoComplete="name"
                />
              </div>

              <div>
                <label className="block text-[13px] font-[600] text-slate-700 dark:text-slate-300 mb-1.5">Username Hardware ID</label>
                <input
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all shadow-sm"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Unique identifier"
                  autoComplete="username"
                />
              </div>

              <div>
                <label className="block text-[13px] font-[600] text-slate-700 dark:text-slate-300 mb-1.5">Cryptographic Key</label>
                <input
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all shadow-sm"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  type="password"
                  autoComplete="new-password"
                />
              </div>

              <div className="pt-2">
                <button 
                  className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-[700] py-3 rounded-xl transition-all shadow-lg shadow-blue-600/30" 
                  type="submit" 
                  disabled={!canSubmit || loading}
                >
                  {loading ? "Allocating…" : "Provision Engine"}
                </button>
              </div>

              {error && <div className="text-rose-500 bg-rose-50 dark:bg-rose-900/10 border border-rose-200 dark:border-rose-900/50 p-3 rounded-lg text-[13px] font-[700] mt-4 text-center">{error}</div>}

              <div className="text-slate-500 text-[13px] text-center pt-2 font-[600]">
                Identity provisioned? <Link to="/login" className="text-blue-600 hover:underline">Authenticate instead</Link>
              </div>
            </form>
          </div>
        </section>
      </motion.main>
    </div>
  );
}

