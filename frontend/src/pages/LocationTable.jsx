import React, { useState, useEffect, useRef } from "react";
import { RefreshCw, Navigation, BusFront, Bell, BellRing, Share2 } from "lucide-react";

export default function LocationTable({ trackingData, allRoutes, allStops }) {
  const [currentStopIndex, setCurrentStopIndex] = useState(0);
  const [lastUpdated, setLastUpdated] = useState(new Date());

  // Alarm State Management
  const [alarms, setAlarms] = useState(() => {
     try { return JSON.parse(localStorage.getItem('smartbus_alarms')) || []; }
     catch(e) { return []; }
  });
  
  const alarmsRef = useRef(alarms);
  alarmsRef.current = alarms;

  // Native Web Push Notification Hook
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
    let internalIndex = currentStopIndex;
    const interval = setInterval(() => {
       internalIndex++;
       if (internalIndex >= routeStops.length) {
         internalIndex = 0; // Loop the simulation
       }
       setCurrentStopIndex(internalIndex);
       setLastUpdated(new Date());

       // Alarm Proximity Check Execution
       const currentRouteId = activeRoute?._id || activeRoute?.routeId;
       let modified = false;
       const nextAlarms = alarmsRef.current.map(a => {
           if (a.routeId === currentRouteId && !a.triggered) {
               const stopsAway = a.stopIndex - internalIndex;
               if (stopsAway === 2) {
                   triggerNotification("SmartBus Alarm", `Your stop (${a.stopName}) is exactly 2 stops away! Get ready to disembark.`);
                   modified = true;
                   return { ...a, triggered: true };
               } else if (stopsAway <= 0) {
                   modified = true;
                   return { ...a, triggered: true }; // Passed stop silently without alert
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
               alert("Notifications blocked. Cannot set alarms natively.");
               return;
            }
         } else if (Notification.permission === "denied") {
            alert("Please unblock Notifications in browser settings to utilize Station Alarms.");
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

  // Resolve visual countdown banner parameters
  const activeRouteId = activeRoute?._id || activeRoute?.routeId;
  const globalAlarm = alarms.find(a => a.routeId === activeRouteId);
  const activeStopsAway = globalAlarm ? (globalAlarm.stopIndex - currentStopIndex) : null;

  // Glance Card Mathematics
  const totalStops = Math.max(1, routeStops.length - 1);
  const progressPercentage = Math.min(100, Math.max(0, (currentStopIndex / totalStops) * 100));
  const isTerminal = currentStopIndex === totalStops;
  const currentSpeed = isTerminal || currentStopIndex === 0 ? 0 : 42;
  const statusColor = currentSpeed > 0 ? "bg-emerald-500" : "bg-amber-500";
  const statusText = isTerminal ? "Journey Complete" : currentSpeed > 0 ? "On time" : "Delayed by ~2 min";

  const nextStopObjRef = isTerminal ? routeStops[currentStopIndex] : routeStops[currentStopIndex + 1] || routeStops[currentStopIndex];
  const nextTargetId = typeof nextStopObjRef === "string" ? nextStopObjRef : (nextStopObjRef.stopId?._id || nextStopObjRef.stopId || nextStopObjRef._id);
  const nextStopHydrated = allStops.find(s => s._id === nextTargetId) || nextStopObjRef;
  const nextStopName = nextStopHydrated.name || "Unknown Stop";

  const nextEtaNumber = isTerminal ? 0 : Math.max(1, Math.floor(Math.random() * 3) + 2);

  const handleShare = () => {
     const text = `Tracking Bus on route "${activeRoute.name}". Next stop: ${nextStopName}. ETA is ${nextEtaNumber} mins.`;
     if (navigator.share) {
        navigator.share({ title: 'SmartBus Tracker', text, url: window.location.href }).catch(()=>{});
     } else {
        window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`);
     }
  };

  return (
    <div className="w-full relative fade-in-up">
      {globalAlarm && activeStopsAway > 0 && (
          <div className="w-full bg-blue-600 dark:bg-blue-500 text-white rounded-xl p-4 mb-6 flex items-center shadow-md animate-pulse-slow">
             <BellRing className="mr-3 shrink-0" size={24} />
             <div>
                <h4 className="font-[700] tracking-wide text-[16px]">Alarm set for Terminus: {globalAlarm.stopName}</h4>
                <p className="text-sm text-blue-100 mt-0.5">Your stop is {activeStopsAway} stops away • Paced alarm in ~{activeStopsAway * 4} minutes</p>
             </div>
          </div>
      )}

      {/* Minimalist Glance Card Hero */}
      <div className="w-full bg-white dark:bg-[#1C1C1E] border border-slate-200 dark:border-slate-800 rounded-3xl p-5 sm:p-8 mb-8 shadow-sm">
        <div className="flex justify-between items-start mb-6">
           <div>
              <div className="flex items-center gap-2 mb-1">
                 <span className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-[700] rounded-md uppercase tracking-wider">
                   {trackingData.type === 'bus' ? `Bus ${trackingData.data.busId}` : 'Live Tracker'}
                 </span>
                 <div className="flex items-center gap-1.5 text-xs font-[600] text-slate-500">
                    <span className={`w-2 h-2 rounded-full ${statusColor} ${currentSpeed > 0 ? "animate-pulse" : ""}`} />
                    {statusText}
                 </div>
              </div>
              <h2 className="text-2xl sm:text-3xl font-[800] tracking-tight text-slate-900 dark:text-white leading-tight">
                {activeRoute.name}
              </h2>
           </div>
           
           <button 
             onClick={handleShare}
             className="p-3 bg-slate-50 hover:bg-blue-50 dark:bg-[#2C2C2E] dark:hover:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full transition-colors shrink-0 outline-none ring-2 ring-transparent hover:ring-blue-500/20"
             title="Share Live Status"
           >
             <Share2 size={20} />
           </button>
        </div>

        <div className="flex flex-col items-center justify-center py-8 sm:py-10 border-y border-slate-100 dark:border-slate-800/50 mb-8 fade-in-up">
           <p className="text-sm font-[600] text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-3">
             {isTerminal ? "Final Destination reached" : "Next Stop"}
           </p>
           <h3 className="text-3xl sm:text-4xl md:text-5xl font-[800] text-center text-slate-900 dark:text-white tracking-tight mb-3">
             {nextStopName}
           </h3>
           {!isTerminal && (
             <div className="text-blue-600 dark:text-blue-400 text-xl font-[700] tracking-tight flex items-baseline gap-2">
               Arriving in <span className="text-6xl sm:text-7xl font-[800] tracking-tighter leading-none">{nextEtaNumber}</span> <span className="text-2xl">min</span>
             </div>
           )}
        </div>

        <div className="w-full">
           <div className="flex justify-between text-xs font-[600] text-slate-400 dark:text-slate-500 mb-3 uppercase tracking-wide">
              <span>Origin</span>
              <span className="flex items-center bg-slate-50 dark:bg-[#2C2C2E] px-2 py-1 rounded-md"><Navigation size={12} className="mr-1.5"/> {currentSpeed} km/h</span>
              <span>Terminal</span>
           </div>
           <div className="w-full h-3 border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#1C1C1E] rounded-full overflow-hidden relative shadow-inner">
              <div 
                 className="absolute top-0 left-0 h-full bg-blue-600 dark:bg-blue-500 transition-all duration-1000 ease-out flex items-center justify-end pr-1 shadow-[0_0_10px_rgba(37,99,235,0.4)]"
                 style={{ width: `${progressPercentage}%` }}
              >
                  {currentSpeed > 0 && <div className="w-1.5 h-1.5 bg-white rounded-full animate-ping" />}
              </div>
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
                <th className="p-4 border-b border-slate-200 dark:border-slate-700 font-[600] w-12 text-center text-slate-400"><Bell size={16} className="mx-auto" /></th>
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
                    <td className="p-4 text-center">
                       {isFuture && (
                          <button 
                             onClick={() => toggleAlarm(sId, stopName, idx)}
                             className={`p-2.5 rounded-full transition-all flex items-center justify-center mx-auto ${alarms.some(a => a.stopId === sId && a.routeId === activeRouteId) ? 'text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/30 ring-2 ring-blue-500/30' : 'text-slate-400 hover:text-blue-600 hover:bg-black/5 dark:hover:bg-white/5'}`}
                             title={alarms.some(a => a.stopId === sId) ? "Remove Alarm" : "Set tracking alarm"}
                          >
                             <Bell size={18} className={alarms.some(a => a.stopId === sId && a.routeId === activeRouteId) ? "fill-blue-600 dark:fill-blue-400 animate-pulse" : ""} />
                          </button>
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
