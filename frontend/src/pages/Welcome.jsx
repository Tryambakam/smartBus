import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import GovHeader from "../components/GovHeader";
import { useAuth } from "../contexts/AuthContext";
import useTheme from "../hooks/useTheme";
import SmartBusLogo from "../components/SmartBusLogo";
import { ChevronRight } from "lucide-react";
import CustomCursor from "../components/CustomCursor";

export default function Welcome() {
  const nav = useNavigate();
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const [isHovering, setIsHovering] = useState(false);

  // Intercept hover states to drive the custom cursor scale
  useEffect(() => {
    const handleMouseOver = (e) => {
      const isInteractive = e.target.closest("button, a, input, select, [tabindex='0']");
      setIsHovering(!!isInteractive);
    };
    document.addEventListener("mouseover", handleMouseOver);
    return () => document.removeEventListener("mouseover", handleMouseOver);
  }, []);

  return (
    <div className="min-h-screen bg-[#FBFBFD] dark:bg-[#000000] relative flex flex-col font-sans transition-colors duration-700 select-none custom-cursor-active overflow-hidden">

      <GovHeader
        lastSyncText="smartBus"
        backendOk={true}
        onToggleTheme={toggleTheme}
        themeLabel={theme === "dark" ? "night" : "day"}
      />

      <main className="flex-1 flex flex-col items-center justify-center p-6 w-full max-w-4xl mx-auto text-center z-10">

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col items-center"
        >
          <SmartBusLogo className="w-20 h-20 sm:w-24 sm:h-24 text-[#003366] dark:text-white mb-6" />

          <div className="uppercase tracking-[0.2em] text-[#003366] dark:text-[#4CA6FF] font-[600] text-sm sm:text-base mb-4">
            Department of Transportation
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-[72px] font-[800] tracking-tight text-[#111827] dark:text-white leading-[1.05] mb-6">
            SmartBus<br />Commuter Portal
          </h1>

          <p className="text-lg sm:text-xl font-[400] text-slate-600 dark:text-[#A1A1A6] max-w-2xl leading-relaxed mb-12">
            Official real-time transit telemetry and predictive routing matrices. Authorized access and public schedules.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 1, ease: "easeOut" }}
          className="flex flex-col sm:flex-row items-center gap-6 w-full justify-center max-w-md"
        >
          {user ? (
            <button
              className="group relative w-full sm:w-auto px-8 py-3.5 bg-[#003366] dark:bg-white text-white dark:text-[#003366] font-[600] text-[17px] rounded-full transition-transform hover:scale-[1.02] flex justify-center items-center gap-1.5 shadow-md"
              onClick={() => nav("/dashboard")}
            >
              Access Dashboard
              <ChevronRight size={18} className="text-white/70 dark:text-[#003366]/70 group-hover:translate-x-0.5 transition-transform" />
            </button>
          ) : (
            <>
              <Link
                to="/login"
                className="group relative w-full sm:w-auto px-10 py-3.5 bg-[#003366] dark:bg-white text-white dark:text-[#003366] font-[600] text-[17px] rounded-full transition-transform hover:scale-[1.02] flex justify-center items-center gap-1.5 shadow-md"
              >
                Official Login
                <ChevronRight size={18} className="text-white/70 dark:text-[#003366]/70 group-hover:translate-x-0.5 transition-transform" />
              </Link>

              <Link
                to="/register"
                className="w-full sm:w-auto px-8 py-3.5 bg-transparent text-[#003366] dark:text-[#2997FF] hover:text-[#002244] dark:hover:text-[#41A1FF] font-[500] text-[17px] rounded-full transition-colors flex justify-center items-center group"
              >
                Secure Registration
                <ChevronRight size={18} className="opacity-0 group-hover:opacity-100 -ml-4 group-hover:ml-1 transition-all" />
              </Link>
            </>
          )}
        </motion.div>

      </main>

      <CustomCursor isHovering={isHovering} />
    </div>
  );
}
