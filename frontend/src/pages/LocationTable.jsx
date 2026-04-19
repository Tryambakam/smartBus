import React, { useState, useEffect, useRef } from "react";
import { Navigation, Bell, BellRing, Share2 } from "lucide-react";

export default function LocationTable({ trackingData, allRoutes, allStops }) {
  const [currentStopIndex, setCurrentStopIndex] = useState(0);
  const [lastUpdated, setLastUpdated] = useState(new Date());

  const [alarms, setAlarms] = useState(() => {
     try { return JSON.parse(localStorage.getItem('smartbus_alarms')) || []; }
     catch(e) { return []; }
  });
  
  const alarmsRef = useRef(alarms);
  alarmsRef.current = alarms;

  const triggerNotification = (title, body) => {
    if (!("Notification" in window)) return;
    if (Notification.permission === "granted") {
      navigator.serviceWorker.ready.then(sw => {
         sw.showNotification(title, { body, icon: '/pwa-192x192.png' });
      }).catch(() => {
         new Notification(title, { body }); 
      });
    }
  };

  const activeRoute = trackingData.type === "route" ? trackingData.data : allRoutes.find(r => r._id === trackingData.data.routeId || r.routeId === trackingData.data.routeId);
  
  const baseStops = activeRoute?.stops;
  const routeStops = Array.isArray(baseStops) && baseStops.length > 5 ? baseStops : [
    { _id: "mock1", name: "Sector 17 Terminal (Origin)", scheduled: "08:00 AM" },
    { _id: "mock2", name: "Tribune Chowk Intercept", scheduled: "08:15 AM" },
    { _id: "mock3", name: "Zirakpur Highway Point", scheduled: "08:35 AM" },
    { _id: "mock4", name: "Ambala Cantonment", scheduled: "09:20 AM" },
    { _id: "mock5", name: "Ludhiana ISBT (Destination)", scheduled: "10:05 AM" }
  ];

  useEffect(() => {
    let internalIndex = currentStopIndex;
    const interval = setInterval(() => {
       internalIndex++;
       if (internalIndex >= routeStops.length) {
         internalIndex = 0; 
       }
       setCurrentStopIndex(internalIndex);
       setLastUpdated(new Date());

       const currentRouteId = activeRoute?._id || activeRoute?.routeId;
       let modified = false;
       const nextAlarms = alarmsRef.current.map(a => {
           if (a.routeId === currentRouteId && !a.triggered) {
               const stopsAway = a.stopIndex - internalIndex;
               if (stopsAway === 2) {
                   triggerNotification("System Alert", `Waypoint Node [${a.stopName}] is 2 units away.`);
                   modified = true;
                   return { ...a, triggered: true };
               } else if (stopsAway <= 0) {
                   modified = true;
                   return { ...a, triggered: true }; 
               }
           }
           return a;
       });

       if (modified) {
           const activeRemaining = nextAlarms.filter(a => !a.triggered);
           setAlarms(activeRemaining);
           localStorage.setItem("smartbus_alarms", JSON.stringify(activeRemaining));
       }

    }, 4500);
    return () => clearInterval(interval);
  }, [routeStops.length, activeRoute]);

  const toggleAlarm = async (stopId, stopName, targetIndex) => {
      if ("Notification" in window) {
         if (Notification.permission !== "granted" && Notification.permission !== "denied") {
            const perm = await Notification.requestPermission();
            if (perm !== "granted") {
               alert("Notifications blocked. Cannot intercept OS layer.");
               return;
            }
         } else if (Notification.permission === "denied") {
            alert("Unblock Notifications in core settings for hardware alerts.");
            return;
         }
      }

      const currentRouteId = activeRoute._id || activeRoute.routeId;
      const existingKey = alarms.findIndex(a => a.stopId === stopId && a.routeId === currentRouteId);
      let payload;
      
      if (existingKey > -1) {
         payload = alarms.filter((_, i) => i !== existingKey);
      } else {
         payload = [...alarms, { routeId: currentRouteId, stopId, stopName, stopIndex: targetIndex, triggered: false }];
      }
      setAlarms(payload);
      localStorage.setItem("smartbus_alarms", JSON.stringify(payload));
  };

  if (!activeRoute) {
    return <div className="text-center p-8 bg-rose-50 text-rose-700 tracking-widest font-bold uppercase text-[11px] border border-rose-300">Failed to map core routing framework.</div>;
  }

  const getEta = (idx, scheduledStr) => {
    if (idx < currentStopIndex) return "ARRIVED";
    if (idx === currentStopIndex) return "RX ACTIVE";
    
    if (!scheduledStr) scheduledStr = "12:00 PM";
    
    const delayMinutes = Math.floor(Math.random() * 4) + 1; 
    return `+${delayMinutes} MIN`;
  };

  const activeRouteId = activeRoute?._id || activeRoute?.routeId;
  const globalAlarm = alarms.find(a => a.routeId === activeRouteId);
  const activeStopsAway = globalAlarm ? (globalAlarm.stopIndex - currentStopIndex) : null;

  const totalStops = Math.max(1, routeStops.length - 1);
  const progressPercentage = Math.min(100, Math.max(0, (currentStopIndex / totalStops) * 100));
  const isTerminal = currentStopIndex === totalStops;
  const currentSpeed = isTerminal || currentStopIndex === 0 ? 0 : 42;
  const statusColor = currentSpeed > 0 ? "bg-emerald-500" : "bg-amber-500";
  const statusText = isTerminal ? "SEQUENCE COMPLETE" : currentSpeed > 0 ? "OPTIMAL" : "LATENCY DETECTED";

  const nextStopObjRef = isTerminal ? routeStops[currentStopIndex] : routeStops[currentStopIndex + 1] || routeStops[currentStopIndex];
  const nextTargetId = typeof nextStopObjRef === "string" ? nextStopObjRef : (nextStopObjRef.stopId?._id || nextStopObjRef.stopId || nextStopObjRef._id);
  const nextStopHydrated = allStops.find(s => s._id === nextTargetId) || nextStopObjRef;
  const nextStopName = nextStopHydrated.name || "UNIDENTIFIED NODE";

  const nextEtaNumber = isTerminal ? 0 : Math.max(1, Math.floor(Math.random() * 3) + 2);

  const handleShare = () => {
     const text = `Tracking ID "${activeRoute.name}". Node: ${nextStopName}. ETA: ${nextEtaNumber}m.`;
     if (navigator.share) {
        navigator.share({ title: 'System Link', text, url: window.location.href }).catch(()=>{});
     } else {
        window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`);
     }
  };

  return (
    <div className="w-full relative fade-in-up flex flex-col font-mono">
      {globalAlarm && activeStopsAway > 0 && (
          <div className="w-full bg-[#0a3161] dark:bg-[#1a3a60] border border-[#d4af37] text-white p-4 mb-6 flex items-center shadow-md animate-pulse">
             <BellRing className="mr-3 shrink-0 text-[#d4af37]" size={20} />
             <div>
                <h4 className="font-black tracking-[0.1em] text-[12px] uppercase">Node Intercept Set: {globalAlarm.stopName}</h4>
                <p className="text-[10px] text-white/70 mt-1 font-bold tracking-widest uppercase">Target approaching in {activeStopsAway} units</p>
             </div>
          </div>
      )}

      <div className="w-full bg-white dark:bg-[#0f141e] border-t-8 border-t-[#0a3161] border border-slate-300 dark:border-slate-800 shadow-[0_4px_24px_rgba(0,0,0,0.05)] mb-8 transition-colors">
        <div className="bg-slate-50 dark:bg-[#151b27] px-6 py-4 border-b border-slate-300 dark:border-slate-800 flex justify-between items-start transition-colors">
           <div>
              <div className="flex items-center gap-3 mb-2">
                 <span className="px-2 py-0.5 bg-slate-200 dark:bg-[#1f2937] border border-slate-300 dark:border-slate-600 text-slate-800 dark:text-slate-300 text-[9px] font-black uppercase tracking-[0.2em]">
                   {trackingData.type === 'bus' ? `ID: ${trackingData.data.busId}` : 'TRACKER LINK'}
                 </span>
                 <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                    <span className={`w-2 h-2 rounded-full ${statusColor} shadow-[0_0_8px_currentColor]`} />
                    {statusText}
                 </div>
              </div>
              <h2 className="text-[20px] font-black uppercase tracking-widest text-[#0f172a] dark:text-white leading-tight">
                {activeRoute.name}
              </h2>
           </div>
           
           <button 
             onClick={handleShare}
             className="px-3 py-1.5 bg-slate-200 dark:bg-slate-800 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-300 hover:text-[#0a3161] dark:hover:bg-slate-700 text-[10px] font-bold uppercase tracking-widest transition-all focus:outline-none flex items-center gap-2"
             title="Broadcast Signal"
           >
             <Share2 size={14} /> EXT LINK
           </button>
        </div>

        <div className="p-6">
          <div className="flex flex-col items-center justify-center py-6 bg-slate-50 dark:bg-[#111622] border border-slate-300 dark:border-slate-700 mb-8 w-full transition-colors">
             <p className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-[0.2em] mb-2">
               {isTerminal ? "SEQUENCE TERMINATED" : "TARGET NODE"}
             </p>
             <h3 className="text-[24px] sm:text-[32px] font-black text-center text-[#0a3161] dark:text-blue-400 tracking-wider mb-2 uppercase">
               {nextStopName}
             </h3>
             {!isTerminal && (
               <div className="text-slate-800 dark:text-slate-200 text-[14px] font-bold tracking-widest flex items-baseline gap-2 uppercase">
                 ETA <span className="text-[32px] font-black tracking-tighter text-emerald-600 dark:text-emerald-400">{nextEtaNumber}</span> <span className="text-[12px] text-slate-500">MINUTES</span>
               </div>
             )}
          </div>

          <div className="w-full">
             <div className="flex justify-between text-[9px] font-black text-slate-500 dark:text-slate-400 mb-2 uppercase tracking-[0.2em]">
                <span>Start Point</span>
                <span className="flex items-center text-[#0a3161] dark:text-blue-400"><Navigation size={10} className="mr-1.5"/> {currentSpeed} KM/H // VELOCITY</span>
                <span>End Sequence</span>
             </div>
             <div className="w-full h-2 border border-slate-300 dark:border-slate-700 bg-slate-100 dark:bg-[#0a0d14] relative transition-colors shadow-inner">
                <div 
                   className="absolute top-0 left-0 h-full bg-[#0a3161] dark:bg-blue-500 transition-all duration-1000 ease-out flex items-center justify-end pr-0.5 shadow-sm"
                   style={{ width: `${progressPercentage}%` }}
                >
                    {currentSpeed > 0 && <div className="w-1 h-2 bg-emerald-400 animate-pulse" />}
                </div>
             </div>
          </div>
        </div>
      </div>

      <div className="w-full bg-white dark:bg-[#0f141e] border border-slate-300 dark:border-slate-800 shadow-sm transition-colors overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-100 dark:bg-[#151b27] border-b border-slate-300 dark:border-slate-800 transition-colors">
                <th className="p-3 text-[10px] font-black uppercase tracking-[0.15em] text-slate-500 dark:text-slate-400">Identity Index</th>
                <th className="p-3 text-[10px] font-black uppercase tracking-[0.15em] text-slate-500 dark:text-slate-400 text-center">Sync Time</th>
                <th className="p-3 text-[10px] font-black uppercase tracking-[0.15em] text-slate-500 dark:text-slate-400 text-center">Latency</th>
                <th className="p-3 text-[10px] font-black uppercase tracking-[0.15em] text-slate-500 dark:text-slate-400 text-center">Intercept</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800 bg-white dark:bg-[#0f141e] transition-colors">
              {routeStops.map((stopRef, idx) => {
                const sId = typeof stopRef === "string" ? stopRef : (stopRef.stopId?._id || stopRef.stopId || stopRef._id);
                const stopObj = allStops.find(s => s._id === sId) || stopRef;
                const stopName = stopObj.name || `NODE-${idx + 1}`;
                const scheduledTime = stopRef.scheduled || "12:00 PM";
                
                const isPast = idx < currentStopIndex;
                const isCurrent = idx === currentStopIndex;
                const isFuture = idx > currentStopIndex;

                let rowClass = "transition-all duration-300 ";
                if (isPast) rowClass += "opacity-50 bg-slate-50 hover:bg-slate-100 dark:bg-black/30 dark:hover:bg-black/50";
                if (isCurrent) rowClass += "bg-emerald-50 dark:bg-emerald-950/20";
                if (isFuture) rowClass += "hover:bg-slate-50 dark:hover:bg-[#151b27]";

                return (
                  <tr key={`tr-${idx}`} className={rowClass}>
                    <td className="p-4 border-r border-slate-200 dark:border-slate-800 relative">
                      {isCurrent && (
                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-emerald-500" />
                      )}
                      <div className="flex items-center gap-3">
                         {isCurrent ? (
                             <div className="text-[12px] bg-emerald-500 text-white font-black px-1.5 py-0.5 tracking-widest shadow-[0_0_8px_rgba(16,185,129,0.5)]">
                               ACTIVE
                             </div>
                         ) : (
                             <div className="text-[10px] font-black tracking-widest text-[#0a3161] dark:text-blue-400 bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-600 px-1.5 py-0.5">
                               {window.String(idx + 1).padStart(2,'0')}
                             </div>
                         )}
                         <span className={`font-bold text-[13px] uppercase tracking-wider ${isCurrent ? 'text-emerald-700 dark:text-emerald-400' : 'text-slate-800 dark:text-slate-200'}`}>
                           {stopName}
                         </span>
                      </div>
                    </td>
                    <td className={`p-4 border-r border-slate-200 dark:border-slate-800 text-center text-[12px] font-bold uppercase tracking-widest ${isCurrent ? 'text-emerald-700 dark:text-emerald-400' : 'text-slate-500 dark:text-slate-400'}`}>
                       {scheduledTime}
                    </td>
                    <td className="p-4 border-r border-slate-200 dark:border-slate-800 text-center">
                       <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-1 ${
                          isPast ? 'text-slate-500' : 
                          isCurrent ? 'text-emerald-700 dark:text-emerald-400' : 
                          'text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-900 bg-amber-50 dark:bg-amber-950/30'
                       }`}>
                         {getEta(idx, scheduledTime)}
                       </span>
                    </td>
                    <td className="p-4 text-center">
                       {isFuture ? (
                          <button 
                             onClick={() => toggleAlarm(sId, stopName, idx)}
                             className={`p-2 transition-all mx-auto border ${alarms.some(a => a.stopId === sId && a.routeId === activeRouteId) ? 'border-[#0a3161] dark:border-blue-400 bg-[#0a3161]/10 text-[#0a3161] dark:text-blue-400' : 'border-slate-300 dark:border-slate-600 text-slate-400 hover:text-[#0a3161] dark:hover:text-blue-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:border-[#0a3161] dark:hover:border-blue-400'}`}
                             title={alarms.some(a => a.stopId === sId) ? "ABORT INTERCEPT" : "SET INTERCEPT"}
                          >
                             <Bell size={16} className={alarms.some(a => a.stopId === sId && a.routeId === activeRouteId) ? "animate-pulse" : ""} />
                          </button>
                       ) : (
                          <span className="text-slate-300 dark:text-slate-700">—</span>
                       )}
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
