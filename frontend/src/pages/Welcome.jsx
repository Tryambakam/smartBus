import React from "react";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import GovHeader from "../components/GovHeader";
import { useAuth } from "../contexts/AuthContext";
import useTheme from "../hooks/useTheme";
import { Command, MapPin, CheckCircle2 } from "lucide-react";

export default function Welcome() {
  const nav = useNavigate();
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="min-h-screen bg-white dark:bg-[#0f1115] relative flex flex-col font-sans transition-colors duration-700 select-none overflow-hidden text-gray-900 dark:text-gray-100">
      
      <GovHeader
        lastSyncText="smartBus"
        backendOk={true}
        onToggleTheme={toggleTheme}
        themeLabel={theme === "dark" ? "night" : "day"}
      />

      <main className="flex-1 flex flex-col lg:flex-row items-center justify-center pt-10 pb-16 w-full max-w-7xl mx-auto z-10 px-6 lg:px-12 gap-12 lg:gap-24">
        
        {/* Left Column: Typography & Actions */}
        <div className="flex-1 flex flex-col items-center lg:items-start text-center lg:text-left mt-8 lg:mt-0">
          
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="mb-6 flex justify-center items-center w-14 h-14 border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded"
          >
            <Command strokeWidth={2} size={28} />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1, ease: "easeOut" }}
          >
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-serif font-semibold tracking-tight text-gray-900 dark:text-white leading-[1.1] mb-5">
              Welcome to the smartBus Tracking Portal
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-400 font-medium mb-10 max-w-xl">
              Official real-time transit telemetry and scheduling. A minimal, commuter-friendly interface.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
            className="flex flex-col items-center lg:items-start gap-4 w-full justify-center lg:justify-start"
          >
            <p className="text-gray-600 dark:text-gray-400 font-medium text-lg mt-4 border border-gray-300 dark:border-gray-800 px-6 py-4 bg-gray-50 dark:bg-[#1a1d24]">
              New Here?{" "}
              <Link
                to="/register"
                className="text-[#0a3161] dark:text-blue-400 hover:text-blue-600 dark:hover:text-blue-300 transition-colors font-semibold ml-1"
              >
                Create Account
              </Link>
            </p>
          </motion.div>

          {/* Footer Checks */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-wrap items-center justify-center lg:justify-start gap-6 text-gray-500 dark:text-gray-500 text-xs sm:text-sm font-medium mt-12"
          >
            <div className="flex items-center gap-2">
              <CheckCircle2 size={16} className="text-gray-400" />
              <span>Official Gov Platform</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 size={16} className="text-gray-400" />
              <span>Data Privacy Compliant</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 size={16} className="text-gray-400" />
              <span>24/7 Service</span>
            </div>
          </motion.div>
        </div>

        {/* Right Column: Flat Minimal Schematic */}
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
          className="flex-shrink-0 w-full max-w-[400px] lg:max-w-[450px] relative hidden md:block"
        >
          {/* Main Map Box */}
          <div className="relative w-full aspect-square bg-gray-100 dark:bg-[#1a1d24] border border-gray-300 dark:border-gray-800 p-6 flex flex-col justify-between overflow-hidden">
            
            {/* Grid background */}
            <div className="absolute inset-0 opacity-[0.4] dark:opacity-[0.2] pointer-events-none">
              <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <pattern id="minimal-grid" width="30" height="30" patternUnits="userSpaceOnUse">
                    <path d="M 30 0 L 0 0 0 30" fill="none" stroke="currentColor" strokeWidth="1" className="text-gray-400 dark:text-gray-600" />
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#minimal-grid)" />
              </svg>
            </div>

            {/* Flat route line */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 400 400" fill="none">
              <path 
                d="M 50 100 L 150 100 L 150 250 L 300 250 L 300 350" 
                stroke="#0a3161" 
                strokeWidth="4" 
                strokeLinecap="square" 
                strokeLinejoin="miter" 
                className="opacity-100 dark:stroke-blue-500"
              />
              {/* Nodes */}
              <circle cx="50" cy="100" r="6" className="fill-white dark:fill-[#1a1d24] stroke-[#0a3161] dark:stroke-blue-500" strokeWidth="3" />
              <circle cx="150" cy="100" r="6" className="fill-white dark:fill-[#1a1d24] stroke-[#0a3161] dark:stroke-blue-500" strokeWidth="3" />
              <circle cx="150" cy="250" r="6" className="fill-white dark:fill-[#1a1d24] stroke-[#0a3161] dark:stroke-blue-500" strokeWidth="3" />
              <circle cx="300" cy="250" r="6" className="fill-white dark:fill-[#1a1d24] stroke-[#0a3161] dark:stroke-blue-500" strokeWidth="3" />
              
              {/* Active Bus pulse */}
              <circle cx="225" cy="250" r="4" className="fill-[#0a3161] dark:fill-blue-400" />
              <circle cx="225" cy="250" r="10" className="stroke-[#0a3161] dark:stroke-blue-400 animate-ping opacity-50" strokeWidth="2" fill="none" />
            </svg>

            {/* Header in graphic */}
            <div className="relative flex justify-between items-start w-full">
              <div className="bg-white dark:bg-[#111318] border border-gray-300 dark:border-gray-700 px-3 py-1.5 text-xs font-mono text-gray-700 dark:text-gray-300 uppercase tracking-wider flex items-center gap-2">
                <span className="w-2 h-2 bg-green-500 block rounded-full"></span>
                System Live
              </div>
            </div>

            {/* Flat Stats Box */}
            <div className="relative bg-white dark:bg-[#111318] border border-gray-300 dark:border-gray-700 p-5 mt-auto shadow-sm">
              <h3 className="text-gray-800 dark:text-gray-100 font-bold mb-4 uppercase tracking-wider text-xs flex items-center gap-2">
                <MapPin size={16} /> Telemetry Feed
              </h3>
              <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-3 font-mono">
                <li className="flex justify-between items-center border-b border-gray-100 dark:border-gray-800 pb-2">
                  <span>Total Active Fleet</span>
                  <span className="text-gray-900 dark:text-white font-bold">1,245</span>
                </li>
                <li className="flex justify-between items-center border-b border-gray-100 dark:border-gray-800 pb-2">
                  <span>Tracked Routes</span>
                  <span className="text-gray-900 dark:text-white font-bold">312</span>
                </li>
                <li className="flex justify-between items-center pb-1">
                  <span>Network Status</span>
                  <span className="text-green-600 dark:text-green-400 font-bold">Optimal</span>
                </li>
              </ul>
            </div>

          </div>
        </motion.div>

      </main>
    </div>
  );
}
