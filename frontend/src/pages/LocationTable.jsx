import React, { useState, useEffect } from "react";
import { RefreshCw, Navigation, BusFront } from "lucide-react";

export default function LocationTable({ trackingData, allRoutes, allStops }) {
  const [currentStopIndex, setCurrentStopIndex] = useState(0);
  const [lastUpdated, setLastUpdated] = useState(new Date());

  // Derive active route from tracking payload
  const activeRoute = trackingData.type === "route" ? trackingData.data : allRoutes.find(r => r._id === trackingData.data.routeId || r.routeId === trackingData.data.routeId);
  
  // Simulated timeline sequence fallback
  const baseStops = activeRoute?.stops;
  const routeStops = Array.isArray(baseStops) && baseStops.length > 5 ? baseStops : [
    { _id: "mock1", name: "Sector 17 Terminal (Origin)", scheduled: "08:00 AM" },
    { _id: "mock2", name: "Tribune Chowk Intercept", scheduled: "08:15 AM" },
    { _id: "mock3", name: "Zirakpur Highway Point", scheduled: "08:35 AM" },
    { _id: "mock4", name: "Ambala Cantonment", scheduled: "09:20 AM" },
    { _id: "mock5", name: "Ludhiana ISBT (Destination)", scheduled: "10:05 AM" }
  ];

  // Pure JavaScript telemetry simulation (sweeps index every 4.5 seconds for demo)
  useEffect(() => {
    let internalIndex = 0;
    const interval = setInterval(() => {
       internalIndex++;
       if (internalIndex >= routeStops.length) {
         internalIndex = 0; // Loop the simulation
       }
       setCurrentStopIndex(internalIndex);
       setLastUpdated(new Date());
    }, 4500);
    return () => clearInterval(interval);
  }, [routeStops.length]);

  if (!activeRoute) {
    return <div className="text-center p-8 text-rose-500">Failed to map route framework.</div>;
  }

  // Generate dynamic ETAs based on current stop index
  const getEta = (idx, scheduledStr) => {
    if (idx < currentStopIndex) return "Arrived";
    if (idx === currentStopIndex) return "Arriving Now";
    
    // Parse scheduled string or mock one if missing
    if (!scheduledStr) scheduledStr = "12:00 PM";
    
    // If future, add generic delay for realism
    const delayMinutes = Math.floor(Math.random() * 4) + 1; 
    return `~${delayMinutes}m delay`;
  };

  return (
    <div className="w-full relative fade-in-up">
      <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between mb-8 gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-[700] tracking-tight">{activeRoute.name}</h2>
          <p className="text-sm font-[500] text-[#003366] dark:text-[#4CA6FF] tracking-wide mt-1 uppercase">Live Vehicle Sweep</p>
        </div>
        <div className="flex flex-col items-end gap-1">
          <div className="flex items-center gap-2 text-sm font-[600] text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 px-3 py-1.5 rounded-md border border-emerald-100 dark:border-emerald-800">
             <Navigation size={16} className="animate-pulse" />
             Speed: {currentStopIndex === 0 || currentStopIndex === routeStops.length - 1 ? "0" : "42"} km/h
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-400">
             <RefreshCw size={12} className={currentStopIndex % 2 === 0 ? "animate-spin" : ""} />
             Updated: {lastUpdated.toLocaleTimeString([], { hour: '2-digit', minute:'2-digit', second:'2-digit' })}
          </div>
        </div>
      </div>

      <div className="w-full bg-white dark:bg-[#1C1C1E] border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-[#2C2C2E] text-slate-500 dark:text-[#8E8E93] text-xs uppercase tracking-wider font-[600]">
                <th className="p-4 border-b border-slate-200 dark:border-slate-700 font-[600]">Stop Location</th>
                <th className="p-4 border-b border-slate-200 dark:border-slate-700 font-[600]">Scheduled</th>
                <th className="p-4 border-b border-slate-200 dark:border-slate-700 font-[600]">Estimated</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {routeStops.map((stopRef, idx) => {
                const sId = typeof stopRef === "string" ? stopRef : (stopRef.stopId?._id || stopRef.stopId || stopRef._id);
                const stopObj = allStops.find(s => s._id === sId) || stopRef;
                const stopName = stopObj.name || `Stop ${idx + 1}`;
                const scheduledTime = stopRef.scheduled || "12:00 PM";
                
                const isPast = idx < currentStopIndex;
                const isCurrent = idx === currentStopIndex;
                const isFuture = idx > currentStopIndex;

                let rowClass = "transition-colors duration-300 ";
                if (isPast) rowClass += "opacity-50 grayscale bg-slate-50/50 dark:bg-black/20";
                if (isCurrent) rowClass += "bg-blue-50/60 dark:bg-blue-900/20";
                if (isFuture) rowClass += "hover:bg-slate-50 dark:hover:bg-slate-800/50";

                return (
                  <tr key={`tr-${idx}`} className={rowClass}>
                    <td className="p-4 relative">
                      {isCurrent && (
                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-600 dark:bg-blue-500 shadow-[0_0_8px_rgba(37,99,235,0.6)]" />
                      )}
                      <div className="flex items-center gap-3">
                         {isCurrent ? (
                             <div className="w-8 h-8 rounded-full bg-blue-600 dark:bg-blue-500 flex items-center justify-center text-white shadow-md animate-pulse">
                               <BusFront size={16} />
                             </div>
                         ) : (
                             <div className={`w-3 h-3 rounded-full ml-2.5 ${isPast ? 'bg-slate-300 dark:bg-slate-600' : 'bg-slate-200 dark:bg-slate-700 border-2 border-white dark:border-black'}`} />
                         )}
                         <span className={`font-[600] ${isCurrent ? 'text-blue-700 dark:text-blue-400 text-[17px]' : 'text-slate-800 dark:text-slate-200'}`}>
                           {stopName}
                         </span>
                      </div>
                    </td>
                    <td className={`p-4 text-sm font-[500] ${isCurrent ? 'text-blue-700 dark:text-blue-300' : 'text-slate-500 dark:text-slate-400'}`}>
                       {scheduledTime}
                    </td>
                    <td className="p-4">
                       <span className={`text-sm font-[600] px-2.5 py-1 rounded-md ${
                          isPast ? 'text-slate-500 bg-transparent' : 
                          isCurrent ? 'text-white bg-blue-600 dark:bg-blue-500 shadow-sm' : 
                          'text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20'
                       }`}>
                         {getEta(idx, scheduledTime)}
                       </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
