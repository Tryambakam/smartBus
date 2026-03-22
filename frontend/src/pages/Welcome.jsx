import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import GovHeader from "../components/GovHeader";
import { useAuth } from "../contexts/AuthContext";
import useTheme from "../hooks/useTheme";
import SmartBusLogo from "../components/SmartBusLogo";
import { ArrowRight, ShieldCheck, Zap, Activity } from "lucide-react";

export default function Welcome() {
  const nav = useNavigate();
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#000000] relative overflow-hidden flex flex-col font-sans transition-colors duration-500">
      
      {/* Abstract Background Orbs */}
      <div className="absolute top-[-15%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-blue-500/10 dark:bg-blue-600/10 blur-[100px] pointer-events-none animate-[pulse_8s_ease-in-out_infinite]" />
      <div className="absolute bottom-[-10%] right-[-5%] w-[60vw] h-[60vw] rounded-full bg-indigo-500/10 dark:bg-indigo-600/10 blur-[120px] pointer-events-none animate-[pulse_12s_ease-in-out_infinite_alternate]" />
      <div className="absolute top-[40%] left-[60%] w-[30vw] h-[30vw] rounded-full bg-rose-500/5 dark:bg-rose-600/10 blur-[90px] pointer-events-none animate-[pulse_10s_ease-in-out_infinite]" />

      <GovHeader
        lastSyncText="Welcome Platform"
        backendOk={true}
        onToggleTheme={toggleTheme}
        themeLabel={theme === "dark" ? "night" : "day"}
      />

      <main className="flex-1 flex flex-col items-center justify-center p-6 relative z-10 w-full max-w-[1200px] mx-auto">
        <div className="flex flex-col lg:flex-row items-center justify-between w-full gap-12 lg:gap-20">
          
          {/* Left Hero Section */}
          <div className="flex-1 flex flex-col items-center lg:items-start text-center lg:text-left">
            <motion.div
              initial={{ scale: 0.8, opacity: 0, rotate: -15 }}
              animate={{ scale: 1, opacity: 1, rotate: 0 }}
              transition={{ type: "spring", bounce: 0.5, duration: 1 }}
              className="relative mb-6"
            >
              <div className="absolute inset-0 bg-blue-500 blur-3xl opacity-20 dark:opacity-40 rounded-full animate-pulse" />
              <div className="bg-white/50 dark:bg-white/5 backdrop-blur-md p-5 rounded-3xl border border-black/5 dark:border-white/10 shadow-apple-float">
                <SmartBusLogo className="w-20 h-20 sm:w-28 sm:h-28 text-blue-600 dark:text-blue-500 relative z-10 drop-shadow-xl" />
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20 text-blue-700 dark:text-blue-400 font-[700] text-[13px] uppercase tracking-widest mb-6"
            >
              <Zap size={16} className="fill-blue-500" />
              Next-Gen Matrix Core
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="text-5xl sm:text-6xl lg:text-7xl font-[900] tracking-tight text-slate-900 dark:text-white leading-[1.1] mb-6"
            >
              Intelligent Transit. <br className="hidden sm:block" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-500 drop-shadow-sm">Secured.</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.5 }}
              className="text-lg sm:text-xl font-[500] text-slate-600 dark:text-slate-400 mb-10 max-w-xl leading-relaxed"
            >
              Experience the pinnacle of urban mobility mapping. Enterprise-grade tracking systems fused with Apple Intelligence interface geometries.
            </motion.p>
            
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.5 }}
              className="flex items-center gap-6"
            >
              <div className="flex -space-x-3">
                {[1,2,3].map(i => (
                  <div key={i} className={`w-10 h-10 rounded-full border-2 border-white dark:border-slate-900 flex items-center justify-center bg-slate-200 dark:bg-slate-800 shadow-sm z-[${10-i}]`}>
                    <Activity size={16} className="text-slate-500" />
                  </div>
                ))}
              </div>
              <div className="text-sm font-[600] text-slate-500 dark:text-slate-400">
                <span className="text-slate-800 dark:text-slate-200 font-[800]">100K+</span> Real-time matrices<br/>processed daily.
              </div>
            </motion.div>
          </div>

          {/* Right Authentication Hub */}
          <motion.div
            initial={{ opacity: 0, x: 20, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            transition={{ delay: 0.4, duration: 0.6, type: "spring", bounce: 0.4 }}
            className="w-full max-w-md"
          >
            <div className="bg-white/70 dark:bg-[#1C1C1E]/80 backdrop-blur-3xl rounded-[32px] shadow-apple-float border border-black-[0.02] dark:border-white/5 overflow-hidden flex flex-col transition-colors duration-500">
              <div className="p-8 border-b border-black/5 dark:border-white/5 bg-slate-50/50 dark:bg-black/20 flex flex-col items-center">
                <ShieldCheck size={40} className="text-blue-500 dark:text-blue-400 mb-4 drop-shadow-sm" strokeWidth={1.5} />
                <h3 className="text-2xl font-[800] tracking-tight text-slate-900 dark:text-white mb-2">Secure Access Gateway</h3>
                <p className="text-center text-[14px] font-[500] text-slate-500 dark:text-slate-400 leading-relaxed">
                  Identity verification is required to mount the live telemetry interfaces.
                </p>
              </div>

              <div className="p-8 flex flex-col gap-4">
                {user ? (
                  <button 
                    className="group relative w-full bg-blue-600 hover:bg-blue-500 text-white font-[800] py-4 rounded-2xl transition-all shadow-lg shadow-blue-600/30 flex justify-center items-center gap-2 overflow-hidden" 
                    onClick={() => nav("/dashboard")}
                  >
                    <div className="absolute inset-0 bg-white/20 translate-y-[-100%] group-hover:translate-y-[100%] transition-transform duration-500 ease-in-out" />
                    Enter Authorised Matrix
                    <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                  </button>
                ) : (
                  <>
                    <Link 
                      to="/login"
                      className="group relative w-full bg-blue-600 hover:bg-blue-500 text-white font-[800] py-4 rounded-2xl transition-all shadow-lg shadow-blue-600/30 flex justify-center items-center gap-2 overflow-hidden"
                    >
                      <div className="absolute inset-0 bg-white/20 translate-y-[-100%] group-hover:translate-y-[100%] transition-transform duration-500 ease-in-out" />
                      Authenticate Identity
                      <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                    </Link>
                    
                    <Link 
                      to="/register"
                      className="w-full bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-700 dark:text-white font-[700] py-4 rounded-2xl transition-all flex justify-center items-center gap-2"
                    >
                      Provision New Account
                    </Link>
                  </>
                )}
              </div>
              
              <div className="p-6 bg-slate-50 dark:bg-white/[0.02] border-t border-black/5 dark:border-white/5 text-center">
                <div className="text-[11px] font-[700] text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1.5 hover:text-blue-500 transition-colors cursor-pointer inline-block" onClick={() => nav("/login")}>
                  Demo Operations →
                </div>
                <div className="text-[12px] font-[500] text-slate-500">
                  Pre-configured simulator accounts available.
                </div>
              </div>
            </div>
          </motion.div>

        </div>
      </main>
    </div>
  );
}

