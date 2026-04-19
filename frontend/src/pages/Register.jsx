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
  const [mobile, setMobile] = useState("");
  const [stateLoc, setStateLoc] = useState("");
  const [district, setDistrict] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onRegister(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const activeUser = await register(name.trim(), email.trim(), mobile.trim(), stateLoc.trim(), district.trim(), password);
      alert(`Registration Successful!\n\nYour auto-generated Username is: ${activeUser.username}\n\nPlease save this username to login in the future.`);
      if (activeUser?.role === "admin") nav("/admin");
      else if (activeUser?.role === "operator") nav("/operator");
      else nav("/");
    } catch (e) {
      setError(String(e?.message || e));
    } finally {
      setLoading(false);
    }
  }

  const canSubmit = name.trim() && password;

  return (
    <div className="bg-slate-50 dark:bg-slate-900 min-h-screen">
      <GovHeader
        lastSyncText="Create Account"
        backendOk={true}
        onToggleTheme={toggleTheme}
        themeLabel={theme === "dark" ? "night" : "day"}
      />
      <div className="gov-banner border-b border-slate-200 dark:border-slate-800 bg-white/50 backdrop-blur-md">
        Create your SmartBus account.
      </div>

      <motion.main
        className="flex items-center justify-center p-6 mt-1"
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.45, ease: "easeOut" }}
      >
        <section className="bg-white dark:bg-[#111111] shadow-none rounded-none w-full max-w-md border border-gray-300 dark:border-gray-700 border-t-4 border-t-[#0a3161] overflow-hidden">
          <div className="p-8 border-b border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-[#1a1d24] flex flex-col items-center">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-1 tracking-tight">Create Account</h2>
            <div className="text-gray-500 text-[11px] uppercase tracking-widest font-black">Sign Up</div>
          </div>

          <div className="p-8">
            <form onSubmit={onRegister} className="space-y-4">
              <div>
                <label className="block text-[13px] font-[600] text-slate-700 dark:text-slate-300 mb-1.5">Full Name</label>
                <input
                  className="w-full px-4 py-3 rounded-none border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#111111] text-gray-900 dark:text-white focus:outline-none focus:border-[#0a3161] dark:focus:border-blue-400 transition-colors"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Full Name"
                  autoComplete="name"
                />
              </div>

              <div>
                <label className="block text-[13px] font-[600] text-slate-700 dark:text-slate-300 mb-1.5">Email Address</label>
                <input
                  className="w-full px-4 py-3 rounded-none border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#111111] text-gray-900 dark:text-white focus:outline-none focus:border-[#0a3161] dark:focus:border-blue-400 transition-colors"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email ID"
                  autoComplete="email"
                />
              </div>

              <div>
                <label className="block text-[13px] font-[600] text-slate-700 dark:text-slate-300 mb-1.5">Mobile Number</label>
                <input
                  className="w-full px-4 py-3 rounded-none border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#111111] text-gray-900 dark:text-white focus:outline-none focus:border-[#0a3161] dark:focus:border-blue-400 transition-colors"
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value)}
                  placeholder="Mobile Number"
                  autoComplete="tel"
                />
              </div>

              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="block text-[13px] font-[600] text-slate-700 dark:text-slate-300 mb-1.5">State</label>
                  <input
                    className="w-full px-4 py-3 rounded-none border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#111111] text-gray-900 dark:text-white focus:outline-none focus:border-[#0a3161] dark:focus:border-blue-400 transition-colors"
                    value={stateLoc}
                    onChange={(e) => setStateLoc(e.target.value)}
                    placeholder="State"
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-[13px] font-[600] text-slate-700 dark:text-slate-300 mb-1.5">District</label>
                  <input
                    className="w-full px-4 py-3 rounded-none border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#111111] text-gray-900 dark:text-white focus:outline-none focus:border-[#0a3161] dark:focus:border-blue-400 transition-colors"
                    value={district}
                    onChange={(e) => setDistrict(e.target.value)}
                    placeholder="District"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[13px] font-[600] text-slate-700 dark:text-slate-300 mb-1.5">Password</label>
                <input
                  className="w-full px-4 py-3 rounded-none border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#111111] text-gray-900 dark:text-white focus:outline-none focus:border-[#0a3161] dark:focus:border-blue-400 transition-colors"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  type="password"
                  autoComplete="new-password"
                />
              </div>

              <div className="pt-2">
                <button 
                  className="w-full bg-[#0a3161] hover:bg-[#072448] disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3.5 rounded-none transition-colors border border-[#0a3161] uppercase tracking-wider text-sm" 
                  type="submit" 
                  disabled={!canSubmit || loading}
                >
                  {loading ? "Registering…" : "Register"}
                </button>
              </div>

              {error && <div className="text-rose-500 bg-rose-50 dark:bg-rose-900/10 border border-rose-200 dark:border-rose-900/50 p-3 rounded-lg text-[13px] font-[700] mt-4 text-center">{error}</div>}

              <div className="text-slate-500 text-[13px] text-center pt-2 font-[600]">
                Already have an account? <Link to="/login" className="text-blue-600 hover:underline">Login here</Link>
              </div>
            </form>
          </div>
        </section>
      </motion.main>
    </div>
  );
}

