import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import GovHeader from "../components/GovHeader";
import useTheme from "../hooks/useTheme";
import { useAuth } from "../contexts/AuthContext";
import { API_BASE, authHeaders } from "../api";

export default function OperatorDemo() {
  const { theme, toggleTheme } = useTheme();
  const { user } = useAuth() || {};
  const jwtBusId = user?.busId || "";

  const [busId, setBusId] = useState(jwtBusId || "BUS-101");
  const [routeId, setRouteId] = useState("");
  const [speed, setSpeed] = useState(18);
  const [status, setStatus] = useState("Idle");
  const [busStatus, setBusStatus] = useState("On Route");
  const [err, setErr] = useState("");
  const [sending, setSending] = useState(false);

  const [toastMsg, setToastMsg] = useState("");
  const [showDelayModal, setShowDelayModal] = useState(false);
  const [delayReason, setDelayReason] = useState("Traffic");

  const [isSharing, setIsSharing] = useState(false);
  const [gpsAccuracy, setGpsAccuracy] = useState(null);
  const [geoErrTooltip, setGeoErrTooltip] = useState("");
  
  const [sessionStartTime] = useState(() => new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute:'2-digit', second:'2-digit' }));

  const watchIdRef = useRef(null);
  const lastSentRef = useRef(0);

  async function sendUpdate({ lat, lng }) {
    setErr("");
    setSending(true);
    try {
      const res = await fetch(`${API_BASE}/api/gps/update`, {
        method: "POST",
        headers: authHeaders({ "Content-Type": "application/json" }),
        body: JSON.stringify({
          busId: busId.trim(),
          routeId: routeId.trim(),
          lat,
          lng,
          speed: Number(speed) || 0,
          busStatus
        }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) throw new Error(data?.error || `GPS update failed: ${res.status}`);
      setStatus(`SYNCED @ ${new Date().toLocaleTimeString('en-US', { hour12: false })}`);
    } catch (e) {
      setErr(String(e?.message || e));
      setStatus("ERROR");
    } finally {
      setSending(false);
    }
  }

  function handleAnnounce() {
    setToastMsg("Announcement broadcasted: 'Approaching next stop. Please prepare to exit.'");
    setTimeout(() => setToastMsg(""), 3000);
  }

  function handleReportDelayConfirm() {
    setToastMsg(`Control Center Notified: Delay caused by ${delayReason}.`);
    setTimeout(() => setToastMsg(""), 4000);
    setShowDelayModal(false);
  }

  function start() {
    setErr("");
    setGeoErrTooltip("");
    if (!navigator.geolocation) {
      setErr("Geolocation is not supported in this operational layer.");
      return;
    }
    if (!busId.trim()) {
      setErr("Bus Registration ID is required.");
      return;
    }

    setStatus("INITIALIZING...");
    const id = navigator.geolocation.watchPosition(
      (pos) => {
        setIsSharing(true);
        setGpsAccuracy(Math.round(pos.coords.accuracy));

        const now = Date.now();
        if (now - lastSentRef.current < 2000) return;
        lastSentRef.current = now;
        sendUpdate({ lat: pos.coords.latitude, lng: pos.coords.longitude });
      },
      (e) => {
        setIsSharing(false);
        setGpsAccuracy(null);
        if (e.code === 1) {
          setGeoErrTooltip("Location permissions restricted. Unlock hardware sensors to proceed.");
        } else {
          setErr(e?.message || "Location telemetry failed.");
        }
        setStatus("OFFLINE");
      },
      { enableHighAccuracy: true, maximumAge: 1000, timeout: 10000 }
    );
    watchIdRef.current = id;
  }

  function stop() {
    if (watchIdRef.current != null) {
      try {
        navigator.geolocation.clearWatch(watchIdRef.current);
      } catch {
        // ignore
      }
      watchIdRef.current = null;
    }
    setIsSharing(false);
    setGpsAccuracy(null);
    setStatus("OFFLINE");
  }

  useEffect(() => () => stop(), []);

  return (
    <div className="gov-shell page-enter min-h-screen bg-slate-100 dark:bg-[#0a0d14] flex flex-col font-mono text-slate-800 dark:text-slate-200">
      <GovHeader
        lastSyncText={status}
        backendOk={!err}
        onToggleTheme={toggleTheme}
        themeLabel={theme === "dark" ? "night" : "day"}
      />

      <div className="bg-[#0a3161] text-white py-1.5 px-4 text-[10px] uppercase tracking-widest font-bold flex justify-between items-center border-b-[3px] border-[#d4af37]">
        <span>Dept. of Transportation — Command Link Active</span>
        <span>Secure Session</span>
      </div>

      <motion.main
        className="flex-1 p-4 sm:p-6"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: "easeOut" }}
      >
        <div className="max-w-5xl mx-auto">
          
          <div className="mb-4 text-[11px] font-bold">
            <Link to="/app" className="text-slate-500 hover:text-[#0a3161] dark:hover:text-blue-400 bg-white/50 dark:bg-black/20 px-3 py-1.5 border border-slate-300 dark:border-slate-700 transition">
              &#9664; RETURN TO DASHBOARD
            </Link>
          </div>

          <section className="bg-white dark:bg-[#0f141e] border-t-8 border-t-[#0a3161] border border-slate-300 dark:border-slate-800 shadow-[0_4px_24px_rgba(0,0,0,0.05)] overflow-hidden transition-colors">
            
            <div className="bg-slate-50 dark:bg-[#151b27] px-8 py-5 border-b border-slate-300 dark:border-slate-800 flex justify-between items-center">
              <div>
                <h1 className="text-[22px] font-black uppercase tracking-widest text-[#0f172a] dark:text-white m-0 leading-tight">
                  Operator Dispatch Console
                </h1>
                <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 uppercase tracking-[0.2em] font-bold">
                  Critical Infrastructure Node
                </div>
              </div>
              <img src="https://upload.wikimedia.org/wikipedia/commons/5/55/Emblem_of_India.svg" alt="State Crest" className="h-[46px] filter grayscale opacity-50 dark:invert" />
            </div>

            <div className="p-8">
              
              {/* Status Bar */}
              <div className="flex flex-wrap gap-1 mb-8">
                <div className="flex-1 bg-slate-100 dark:bg-[#1a2130] border border-slate-300 dark:border-slate-700 p-3 flex items-center justify-between">
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-widest">Session Start Time</span>
                  <span className="text-[14px] font-black tracking-widest text-[#0a3161] dark:text-blue-400">{sessionStartTime}</span>
                </div>
                <div className="flex-1 bg-slate-100 dark:bg-[#1a2130] border border-slate-300 dark:border-slate-700 p-3 flex items-center justify-between">
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-widest">Vehicle Health</span>
                  <div className="flex items-center gap-2">
                    <span className="text-[12px] font-black tracking-widest text-emerald-600 dark:text-emerald-400">OPTIMAL / SYSTEMS NOMINAL</span>
                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]"></div>
                  </div>
                </div>
              </div>

              {/* Data Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-0 border border-slate-300 dark:border-slate-700 mb-8 bg-slate-50 dark:bg-[#151b27]">
                
                <div className="p-4 border-b lg:border-b-0 lg:border-r border-slate-300 dark:border-slate-700">
                  <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-2 flex justify-between items-center">
                    BUS ID 
                    {isSharing && <span className="bg-rose-100 text-rose-700 border border-rose-200 px-1.5 py-0.5 text-[8px] animate-pulse">TX ACTIVE</span>}
                  </div>
                  <input className={`w-full bg-white dark:bg-[#0a0d14] border border-slate-300 dark:border-slate-700 text-[14px] font-bold p-2 text-slate-800 dark:text-white uppercase focus:border-[#0a3161] focus:ring-1 focus:ring-[#0a3161] outline-none transition ${jwtBusId ? 'bg-slate-100 dark:bg-[#111] text-slate-400 cursor-not-allowed' : ''}`} value={busId} onChange={(e) => setBusId(e.target.value)} readOnly={!!jwtBusId} />
                </div>

                <div className="p-4 border-b lg:border-b-0 lg:border-r border-slate-300 dark:border-slate-700">
                  <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-2">ROUTE ID (OPT)</div>
                  <input className="w-full bg-white dark:bg-[#0a0d14] border border-slate-300 dark:border-slate-700 text-[14px] font-bold p-2 text-slate-800 dark:text-white uppercase focus:border-[#0a3161] focus:ring-1 focus:ring-[#0a3161] outline-none transition" value={routeId} onChange={(e) => setRouteId(e.target.value)} />
                </div>

                <div className="p-4 border-b lg:border-b-0 lg:border-r border-slate-300 dark:border-slate-700 relative">
                  <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-2">SPEED (KM/H)</div>
                  <input type="number" min="0" className="w-full bg-white dark:bg-[#0a0d14] border border-slate-300 dark:border-slate-700 text-[16px] font-black p-2 text-[#0a3161] dark:text-blue-400 focus:border-[#0a3161] focus:ring-1 focus:ring-[#0a3161] outline-none transition text-right pr-3" value={speed} onChange={(e) => setSpeed(e.target.value)} />
                </div>

                <div className="p-4 border-b lg:border-b-0 lg:border-r border-slate-300 dark:border-slate-700">
                  <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-2">BUS STATUS</div>
                  <select className="w-full bg-white dark:bg-[#0a0d14] border border-slate-300 dark:border-slate-700 text-[13px] font-bold p-2.5 text-slate-800 dark:text-white focus:border-[#0a3161] focus:ring-1 focus:ring-[#0a3161] outline-none transition uppercase" value={busStatus} onChange={(e) => setBusStatus(e.target.value)}>
                    <option value="On Route">ON ROUTE</option>
                    <option value="Stopped">STOPPED</option>
                    <option value="Out of Service">OUT OF SERVICE</option>
                  </select>
                </div>

                <div className="p-4 flex flex-col justify-center bg-slate-100 dark:bg-[#111620]">
                  <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-1">SYNC STATUS</div>
                  <div className="flex flex-col gap-1">
                    <div className={`font-black text-[13px] tracking-widest uppercase ${status === 'OFFLINE' || status === 'Idle' ? 'text-slate-400' : (status.includes('ERROR') ? 'text-rose-600' : 'text-emerald-600 dark:text-emerald-400')}`}>
                      {status}
                      {sending && <span className="ml-2 text-[9px] text-slate-400 animate-pulse">TX...</span>}
                    </div>
                    {gpsAccuracy !== null && (
                      <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                        ACCURACY: ±{gpsAccuracy}M
                      </div>
                    )}
                  </div>
                </div>

              </div>

              {/* Controls */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                
                {/* Section 1 */}
                <div className="bg-slate-50 dark:bg-[#151b27] border border-slate-300 dark:border-slate-700 p-5">
                  <h3 className="text-[11px] font-black uppercase tracking-widest text-[#0a3161] dark:text-blue-400 border-b border-slate-300 dark:border-slate-700 pb-2 mb-4">
                    Transmission Controls
                  </h3>
                  <div className="flex flex-col gap-3">
                    <button 
                      onClick={start}
                      className="relative bg-gradient-to-b from-[#15803d] to-[#14532d] shadow-[inset_0_1px_1px_rgba(255,255,255,0.3),_0_3px_5px_rgba(0,0,0,0.2)] border border-[#052e16] text-white px-4 py-4 rounded-[4px] active:shadow-[inset_0_3px_6px_rgba(0,0,0,0.5),_0_0px_0px_rgba(0,0,0,0)] transition-all flex items-center justify-center gap-3 w-full"
                    >
                      <div className={`w-2.5 h-2.5 rounded-full border border-[rgba(255,255,255,0.2)] ${isSharing ? 'bg-emerald-400 shadow-[0_0_10px_#34d399] animate-pulse' : 'bg-emerald-900 shadow-inner'}`}></div>
                      <span className="font-bold text-[13px] tracking-[0.15em] text-shadow-sm">START TRANSMITTING</span>
                    </button>
                    
                    <button 
                      onClick={stop}
                      className="relative bg-gradient-to-b from-[#be123c] to-[#881337] shadow-[inset_0_1px_1px_rgba(255,255,255,0.3),_0_3px_5px_rgba(0,0,0,0.2)] border border-[#4c0519] text-white px-4 py-4 rounded-[4px] active:shadow-[inset_0_3px_6px_rgba(0,0,0,0.5),_0_0px_0px_rgba(0,0,0,0)] transition-all flex items-center justify-center gap-3 w-full"
                    >
                      <div className={`w-2.5 h-2.5 rounded-full border border-[rgba(255,255,255,0.2)] ${!isSharing ? 'bg-rose-400 shadow-[0_0_10px_#fb7185]' : 'bg-rose-900 shadow-inner'}`}></div>
                      <span className="font-bold text-[13px] tracking-[0.15em] text-shadow-sm">STOP TRANSMISSION</span>
                    </button>
                  </div>
                </div>

                {/* Section 2 */}
                <div className="bg-slate-50 dark:bg-[#151b27] border border-slate-300 dark:border-slate-700 p-5">
                  <h3 className="text-[11px] font-black uppercase tracking-widest text-[#0a3161] dark:text-blue-400 border-b border-slate-300 dark:border-slate-700 pb-2 mb-4">
                    Operational Overrides
                  </h3>
                  <div className="flex flex-col gap-3">
                    <button 
                      onClick={handleAnnounce}
                      className="relative bg-gradient-to-b from-[#1e293b] to-[#0f172a] shadow-[inset_0_1px_1px_rgba(255,255,255,0.15),_0_3px_5px_rgba(0,0,0,0.2)] border border-[#020617] text-white px-4 py-4 rounded-[4px] active:shadow-[inset_0_3px_6px_rgba(0,0,0,0.5),_0_0px_0px_rgba(0,0,0,0)] transition-all flex items-center justify-center gap-3 w-full"
                    >
                      <i className="fa-solid fa-bullhorn text-slate-400"></i>
                      <span className="font-bold text-[13px] tracking-[0.15em] text-shadow-sm">ANNOUNCE NEXT STOP</span>
                    </button>
                    
                    <button 
                      onClick={() => setShowDelayModal(true)}
                      className="relative bg-gradient-to-b from-[#d97706] to-[#b45309] shadow-[inset_0_1px_1px_rgba(255,255,255,0.3),_0_3px_5px_rgba(0,0,0,0.2)] border border-[#78350f] text-white px-4 py-4 rounded-[4px] active:shadow-[inset_0_3px_6px_rgba(0,0,0,0.5),_0_0px_0px_rgba(0,0,0,0)] transition-all flex items-center justify-center gap-3 w-full"
                    >
                      <i className="fa-solid fa-triangle-exclamation text-amber-200"></i>
                      <span className="font-bold text-[13px] tracking-[0.15em] text-shadow-sm">REPORT DELAY...</span>
                    </button>
                  </div>
                </div>

              </div>

              {(err || geoErrTooltip) && (
                <div className="mt-8 bg-rose-50 dark:bg-rose-950/30 border border-rose-300 dark:border-rose-900 px-5 py-4 flex items-start gap-4">
                  <i className="fa-solid fa-triangle-exclamation text-rose-600 dark:text-rose-500 mt-1"></i>
                  <div>
                    <div className="text-[11px] font-black tracking-widest text-rose-700 dark:text-rose-400 uppercase mb-1">System Error</div>
                    <div className="text-[13px] font-bold text-rose-900 dark:text-rose-300">{err || geoErrTooltip}</div>
                  </div>
                </div>
              )}

              <div className="mt-8 text-center border-t border-slate-300 dark:border-slate-800 pt-6">
                 <div className="text-[10px] text-slate-500 uppercase tracking-[0.2em] font-bold">
                   Information System Authorized For Official Transport Telemetry Only
                 </div>
              </div>

            </div>
          </section>
        </div>
      </motion.main>

      {/* Toast Notification */}
      <AnimatePresence>
        {toastMsg && (
          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[9999] bg-[#0a3161] border border-[#d4af37] text-white px-6 py-4 shadow-[0_10px_30px_rgba(0,0,0,0.3)] shadow-[#0a3161]/20 flex items-center gap-4 min-w-[320px]"
          >
            <i className="fa-solid fa-satellite-dish text-[#d4af37]"></i>
            <span className="text-[12px] font-bold uppercase tracking-widest">{toastMsg}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delay Modal Override */}
      <AnimatePresence>
        {showDelayModal && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-900/80 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }}
              className="bg-slate-100 dark:bg-[#0f141e] border-t-4 border-t-amber-600 border border-slate-300 dark:border-slate-700 shadow-2xl w-full max-w-md overflow-hidden"
            >
              <div className="bg-white dark:bg-[#151b27] border-b border-slate-300 dark:border-slate-800 p-5 flex items-center gap-3">
                <i className="fa-solid fa-triangle-exclamation text-amber-600 text-xl"></i>
                <div>
                  <h3 className="m-0 text-[#0f172a] dark:text-white text-[16px] font-black uppercase tracking-widest">Report Delay</h3>
                  <div className="text-[10px] text-slate-500 uppercase font-bold tracking-widest mt-1">Classification Required</div>
                </div>
              </div>
              
              <div className="p-6">
                <div className="grid grid-cols-2 gap-3 mb-8">
                  {["Traffic", "Mechanical", "Weather", "Emergency"].map(r => (
                    <label key={r} className={`flex items-center gap-3 p-3 border cursor-pointer transition-colors ${delayReason === r ? 'bg-amber-50 dark:bg-amber-900/20 border-amber-600' : 'bg-white dark:bg-[#0a0d14] border-slate-300 dark:border-slate-700'}`}>
                      <input type="radio" name="delayReason" value={r} checked={delayReason === r} onChange={(e) => setDelayReason(e.target.value)} className="w-3 h-3 text-amber-600 focus:ring-amber-600" />
                      <span className="text-[12px] font-bold uppercase tracking-widest text-slate-800 dark:text-slate-200">{r}</span>
                    </label>
                  ))}
                </div>

                <div className="flex gap-3 justify-end border-t border-slate-300 dark:border-slate-800 pt-6">
                  <button 
                    className="px-6 py-3 font-bold tracking-widest text-[11px] uppercase bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-600 transition-colors" 
                    onClick={() => setShowDelayModal(false)}
                  >
                    Cancel
                  </button>
                  <button 
                    className="px-6 py-3 font-bold tracking-widest text-[11px] uppercase bg-amber-600 hover:bg-amber-700 text-white border border-amber-800 shadow-[inset_0_1px_0_rgba(255,255,255,0.3)] transition-colors" 
                    onClick={handleReportDelayConfirm}
                  >
                    Confirm Delay
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
