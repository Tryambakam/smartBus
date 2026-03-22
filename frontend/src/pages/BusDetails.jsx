import { motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import GovHeader from "../components/GovHeader";
import { getBusEta } from "../api";

function fmtMins(x) {
  if (x == null || Number.isNaN(Number(x))) return "—";
  const m = Math.max(0, Number(x));
  return m < 1 ? "< 1 min" : `${Math.round(m)} min`;
}

export default function BusDetails() {
  const { busId } = useParams();

  const [eta, setEta] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        setErr("");
        setLoading(true);
        const data = await getBusEta(busId);
        if (!cancelled) setEta(data);
      } catch (e) {
        if (!cancelled) setErr(e?.message || "Failed to load ETA");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [busId]);

  const backendOk = !err;
  const lastSyncText = loading ? "Loading ETA…" : "ETA loaded";

  const nextStops = useMemo(() => {
    if (!eta || !eta.nextStops) return [];
    return Array.isArray(eta.nextStops) ? eta.nextStops : [];
  }, [eta]);

  return (
    <div className="gov-shell">
      <GovHeader lastSyncText={lastSyncText} backendOk={backendOk} />

      <div className="bg-blue-50/80 dark:bg-blue-900/20 border-b border-blue-100 dark:border-white/5 py-2.5 px-4 text-[13px] font-[500] text-blue-700 dark:text-blue-300 flex items-center justify-center gap-2 backdrop-blur-md">
        <span className="animate-pulse">✨</span> Passenger Information: Estimated arrival times are AI approximations based on real-time hardware telemetry.
      </div>

      <motion.main
        className="flex-1 w-full max-w-[1400px] mx-auto p-4 sm:p-6 lg:p-8 flex flex-col lg:grid lg:grid-cols-12 gap-6 lg:gap-8 relative z-10"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: "easeOut" }}
      >
        {/* Left: Summary */}
        <section className="lg:col-span-4 bg-white/70 dark:bg-[#1C1C1E]/80 backdrop-blur-3xl rounded-[32px] shadow-apple border border-black-[0.02] dark:border-white/5 overflow-hidden flex flex-col transition-colors duration-500 h-fit">
          <div className="p-6 border-b border-black/5 dark:border-white/5 bg-slate-50/50 dark:bg-black/20 flex flex-col gap-1">
            <div className="text-sm font-[600] text-slate-500 dark:text-slate-400 mb-2">
              <Link to="/app" className="hover:text-blue-600 transition-colors">← Back to Live Map</Link>
            </div>
            <div className="text-2xl font-[900] tracking-tight text-slate-900 dark:text-white flex items-center justify-between">
              {busId}
              <button className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-1.5 rounded-full font-[700] text-[12px] shadow-sm transition-all active:scale-95" onClick={() => window.location.reload()}>
                Refresh
              </button>
            </div>
            <div className="text-[13px] font-[500] text-slate-500 dark:text-slate-400">Tracking & ETA Overview</div>
          </div>

          <div className="p-6 flex flex-col gap-4">
            {loading ? (
              <div className="animate-pulse flex flex-col gap-3">
                <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded-md w-full" />
                <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded-md w-2/3" />
                <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded-md w-1/2" />
              </div>
            ) : err ? (
              <div className="bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800 rounded-2xl p-4">
                <div className="text-rose-600 dark:text-rose-400 font-[600] text-[14px]">
                  {String(err).includes("routeId not set")
                    ? "Hardware unassigned to standard Route."
                    : "ETA computation currently unavailable."}
                </div>
                <div className="text-rose-500/80 dark:text-rose-400/80 text-[12px] mt-2 font-mono">
                  {err}
                </div>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                <div className="flex justify-between items-center bg-slate-50/50 dark:bg-black/10 p-3.5 rounded-2xl border border-black/5 dark:border-white/5">
                  <span className="text-[13px] font-[600] text-slate-500 dark:text-slate-400">Active Route</span>
                  <span className="text-[14px] font-[800] text-slate-900 dark:text-white">{eta?.routeId || "—"}</span>
                </div>
                <div className="flex justify-between items-center bg-slate-50/50 dark:bg-black/10 p-3.5 rounded-2xl border border-black/5 dark:border-white/5">
                  <span className="text-[13px] font-[600] text-slate-500 dark:text-slate-400">Telemetry Speed</span>
                  <span className="text-[14px] font-[800] text-slate-900 dark:text-white">{eta?.speedKmh ?? "—"} <span className="text-[11px] font-[600] text-slate-400">km/h</span></span>
                </div>
                <div className="flex justify-between items-center bg-slate-50/50 dark:bg-black/10 p-3.5 rounded-2xl border border-black/5 dark:border-white/5">
                  <span className="text-[13px] font-[600] text-slate-500 dark:text-slate-400">Calculation Array</span>
                  <span className="text-[14px] font-[800] text-slate-900 dark:text-white">{eta?.calculatedAt ? new Date(eta.calculatedAt).toLocaleTimeString() : "—"}</span>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Center: Animated ETA Timeline with Apple Intelligence Glow */}
        <section className="lg:col-span-4 relative rounded-[32px] overflow-hidden p-[2px] shadow-apple-float">
          {/* Apple Intelligence Glowing Aura */}
          <div className="absolute inset-[-50%] bg-[conic-gradient(from_0deg,transparent,#3b82f6,#8b5cf6,#ec4899,transparent)] animate-[spin_6s_linear_infinite] opacity-60 dark:opacity-80 z-0"></div>
          
          <div className="relative z-10 bg-white/95 dark:bg-[#1C1C1E]/95 backdrop-blur-3xl rounded-[30px] h-full flex flex-col transition-colors duration-500">
            <div className="p-6 border-b border-black/5 dark:border-white/5 bg-slate-50/80 dark:bg-black/40 flex items-center gap-3 shrink-0 rounded-t-[30px]">
              <span className="text-2xl animate-pulse">✨</span>
              <div>
                <div className="text-lg font-[800] tracking-tight text-slate-900 dark:text-white bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent">AI Predictions</div>
                <div className="text-[12px] font-[600] text-slate-500 dark:text-slate-400 mt-0.5 uppercase tracking-wider">Dynamic Topology Check</div>
              </div>
            </div>

            <div className="p-6 flex-1 overflow-y-auto">
            {loading ? (
              <div className="flex flex-col gap-4">
                <div className="bg-slate-50/50 dark:bg-black/10 border border-black/5 dark:border-white/5 rounded-2xl p-4 flex flex-col gap-2 relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 dark:via-white/10 to-transparent w-[200%] animate-[skelShimmer_2s_linear_infinite]" />
                  <div className="h-4 bg-slate-200 dark:bg-slate-700/50 rounded w-1/2" />
                  <div className="h-3 bg-slate-200 dark:bg-slate-700/50 rounded w-1/3" />
                </div>
                <div className="bg-slate-50/50 dark:bg-black/10 border border-black/5 dark:border-white/5 rounded-2xl p-4 flex flex-col gap-2 relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 dark:via-white/10 to-transparent w-[200%] animate-[skelShimmer_2s_linear_infinite]" />
                  <div className="h-4 bg-slate-200 dark:bg-slate-700/50 rounded w-2/3" />
                  <div className="h-3 bg-slate-200 dark:bg-slate-700/50 rounded w-1/4" />
                </div>
              </div>
            ) : err ? (
              <div className="text-[14px] font-[500] text-slate-500 dark:text-slate-400">
                ETA timeline matrices not determinable.
              </div>
            ) : nextStops.length === 0 ? (
              <div className="text-[14px] font-[500] text-slate-500 dark:text-slate-400">
                No subsequent nodes located on current trajectory.
              </div>
            ) : (
              <div className="relative border-l-2 border-slate-200 dark:border-slate-800 ml-4 pl-6 space-y-8 py-2">
                {nextStops.map((s, idx) => (
                  <motion.div
                    key={s.stopId || idx}
                    className="relative"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.4, delay: idx * 0.1, ease: [0.16, 1, 0.3, 1] }}
                  >
                    <div className={`absolute -left-[35px] top-1 w-4 h-4 rounded-full border-4 border-white dark:border-[#1C1C1E] ${idx === 0 ? "bg-blue-500 shadow-[0_0_10px_2px_rgba(59,130,246,0.6)]" : "bg-slate-300 dark:bg-slate-600"}`} />
                    
                    <div className="flex justify-between items-start gap-4">
                      <div>
                        <div className="text-[15px] font-[800] text-slate-900 dark:text-white leading-tight">
                          {s.name_en || s.stopId}
                        </div>
                        <div className="text-[12px] font-[600] text-slate-500 dark:text-slate-400 mt-1">
                          Node: {s.stopId} &middot; Seq: {s.sequence ?? "—"} &middot; {s.distanceKm ? Number(s.distanceKm).toFixed(2) : "—"} km
                        </div>
                        {idx === 0 && (
                          <div className="text-[11px] font-[700] uppercase tracking-wider text-rose-500 mt-2 bg-rose-50 dark:bg-rose-500/10 px-2 py-1 rounded-md inline-block border border-rose-200 dark:border-rose-900/50">
                            Approaching
                          </div>
                        )}
                      </div>

                      <div className="shrink-0 bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20 text-blue-700 dark:text-blue-400 font-[800] text-[14px] px-3 py-1.5 rounded-xl shadow-sm text-center min-w-[70px]">
                        {fmtMins(s.etaMinutes)}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
            </div>
          </div>
        </section>

        {/* Right: Tips / Notes */}
        <section className="lg:col-span-4 bg-white/70 dark:bg-[#1C1C1E]/80 backdrop-blur-3xl rounded-[32px] shadow-apple border border-black-[0.02] dark:border-white/5 overflow-hidden flex flex-col transition-colors duration-500 h-fit">
          <div className="p-6 border-b border-black/5 dark:border-white/5 bg-slate-50/50 dark:bg-black/20">
            <div className="text-lg font-[800] text-slate-900 dark:text-white">Analytic Transparency</div>
            <div className="text-[13px] font-[500] text-slate-500 dark:text-slate-400 mt-0.5">Calculation specifics</div>
          </div>

          <div className="p-6 flex flex-col gap-6">
            <div className="flex flex-col gap-2">
              <b className="text-[14px] font-[800] text-slate-900 dark:text-slate-100">Algorithmic Base</b>
              <div className="text-[13px] font-[500] text-slate-600 dark:text-slate-400 leading-relaxed bg-slate-50/50 dark:bg-black/10 p-4 rounded-2xl border border-black/5 dark:border-white/5">
                Predictions rely on sequential geospatial coordinates cross-referenced against static route definitions. Intelligent velocity fallbacks guarantee rendering even during momentary satellite loss.
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <b className="text-[14px] font-[800] text-slate-900 dark:text-slate-100">Live Disclaimers</b>
              <div className="text-[13px] font-[500] text-slate-600 dark:text-slate-400 leading-relaxed bg-slate-50/50 dark:bg-black/10 p-4 rounded-2xl border border-black/5 dark:border-white/5">
                Calculations dynamically mutate responding to real-time traffic indices, transit stoppages, and hardware reporting intervals.
              </div>
            </div>
          </div>
        </section>
      </motion.main>
    </div>
  );
}
