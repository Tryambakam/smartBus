import React from "react";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import GovHeader from "../components/GovHeader";
import { useAuth } from "../contexts/AuthContext";
import useTheme from "../hooks/useTheme";

export default function Welcome() {
  const nav = useNavigate();
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="gov-shell page-enter min-h-screen bg-slate-100 dark:bg-[#0a0d14] flex flex-col font-mono text-slate-800 dark:text-slate-200">
      <GovHeader
        lastSyncText="smartBus"
        backendOk={true}
        onToggleTheme={toggleTheme}
        themeLabel={theme === "dark" ? "night" : "day"}
      />
      <div className="bg-[#0a3161] text-white py-1.5 px-4 text-[10px] uppercase tracking-widest font-bold flex justify-between items-center border-b-[3px] border-[#d4af37]">
        <span>City Bus Transit Service</span>
        <span>Welcome</span>
      </div>

      <motion.main
        className="flex-1 p-4 sm:p-6 flex flex-col justify-center items-center"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: "easeOut" }}
      >
        <div className="w-full max-w-5xl">
          <section className="bg-white dark:bg-[#0f141e] rounded-xl border-t-4 border-t-[#0a3161] border border-slate-200 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-black/50 overflow-hidden transition-colors">
            
            <div className="bg-slate-50 dark:bg-[#151b27] px-8 py-5 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
              <div>
                <h1 className="text-[22px] font-black uppercase tracking-widest text-[#0f172a] dark:text-white m-0 leading-tight">
                  Welcome to smartBus
                </h1>
                <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 uppercase tracking-[0.2em] font-bold">
                  Real-Time Bus Tracking Platform
                </div>
              </div>
              <img src="https://upload.wikimedia.org/wikipedia/commons/5/55/Emblem_of_India.svg" alt="State Crest" className="h-[46px] filter grayscale opacity-50 dark:invert" />
            </div>

            <div className="p-8">
              <div className="flex flex-col lg:flex-row gap-8">
                
                {/* Information Node */}
                <div className="flex-1">
                  <h2 className="text-[11px] font-black uppercase tracking-widest text-[#0a3161] dark:text-blue-400 border-b border-slate-200 dark:border-slate-700 pb-2 mb-4">
                    About This Platform
                  </h2>
                  <div className="bg-slate-50 dark:bg-[#151b27] rounded-lg border border-slate-200 dark:border-slate-700 p-6 h-full shadow-inner shadow-slate-100 dark:shadow-none">
                    <p className="text-sm font-sans font-medium text-slate-600 dark:text-slate-400 mb-6 leading-relaxed">
                      Welcome to smartBus. This platform provides real-time information about bus locations, routes, and schedules to help you plan your journey easily.
                    </p>
                    <div className="flex flex-col gap-3 pt-2 border-t border-slate-200 dark:border-slate-700">
                      <div className="flex items-center gap-3">
                        <i className="fa-solid fa-server text-slate-400"></i>
                        <span className="text-[11px] font-bold uppercase tracking-widest">Open to Public</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <i className="fa-solid fa-shield-halved text-slate-400"></i>
                        <span className="text-[11px] font-bold uppercase tracking-widest">Your Data is Safe</span>
                      </div>
                      <div className="flex items-center gap-3 mt-1">
                        <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]"></div>
                        <span className="text-[12px] font-black tracking-widest text-emerald-600 dark:text-emerald-400 uppercase">Live Tracking Working</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Authentication Controls */}
                <div className="flex-1">
                  <h3 className="text-[11px] font-black uppercase tracking-widest text-[#0a3161] dark:text-blue-400 border-b border-slate-200 dark:border-slate-700 pb-2 mb-4">
                    Login Options
                  </h3>
                  <div className="bg-slate-50 dark:bg-[#151b27] rounded-lg border border-slate-200 dark:border-slate-700 p-6 flex flex-col gap-4 h-full justify-center shadow-inner shadow-slate-100 dark:shadow-none">
                    
                    <Link 
                      to={user ? "/dashboard" : "/login"}
                      className="group bg-[#005ea2] hover:bg-[#1a4480] dark:bg-blue-600 dark:hover:bg-blue-500 !text-white shadow-lg shadow-blue-900/30 dark:shadow-blue-900/40 border border-transparent px-4 py-4 rounded-md transition-all flex items-center justify-center gap-3 w-full"
                    >
                      <i className="fa-solid fa-right-to-bracket !text-white opacity-90 group-hover:translate-x-1 transition-transform"></i>
                      <span className="font-black text-[14px] tracking-[0.15em] uppercase !text-white drop-shadow-sm">Login to Your Account</span>
                    </Link>

                    {!user && (
                      <Link 
                        to="/register"
                        className="group bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 shadow-sm px-4 py-4 rounded-md transition-all flex items-center justify-center gap-3 w-full mt-2"
                      >
                        <i className="fa-solid fa-id-card text-slate-400 dark:text-slate-500 group-hover:scale-110 transition-transform"></i>
                        <span className="font-bold text-[13px] tracking-[0.15em] uppercase">Create a New Account</span>
                      </Link>
                    )}
                  </div>
                </div>

              </div>

              <div className="mt-8 text-center border-t border-slate-300 dark:border-slate-800 pt-6">
                 <div className="text-[10px] text-slate-500 uppercase tracking-[0.2em] font-bold">
                   Official Platform for City Bus Tracking
                 </div>
              </div>
            </div>
            
          </section>
        </div>
      </motion.main>
    </div>
  );
}
