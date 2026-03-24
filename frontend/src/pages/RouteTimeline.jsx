import React, { useState, useEffect } from "react";
import { Clock, MapPin, AlertCircle, RefreshCw } from "lucide-react";
import { getLiveBuses } from "../api";
import { io as ioClient } from "socket.io-client";
import { API_BASE } from "../api";

export default function RouteTimeline({ trackingData, allRoutes, allStops }) {
  const [buses, setBuses] = useState([]);
  const [lastSync, setLastSync] = useState(new Date());

  // Derive active route from tracking payload
  const activeRoute = trackingData.type === "route" ? trackingData.data : allRoutes.find(r => r._id === trackingData.data.routeId || r.routeId === trackingData.data.routeId);
  
  // Simulated timeline sequence fallback for robust UX demonstration
  const baseStops = activeRoute?.stops;
  const routeStops = Array.isArray(baseStops) && baseStops.length > 0 ? baseStops : [
    { _id: "mock1", name: "Sector 17 Terminal (Origin)" },
    { _id: "mock2", name: "Tribune Chowk Intercept" },
    { _id: "mock3", name: "Zirakpur Highway Point" },
    { _id: "mock4", name: "Ambala Cantonment" },
    { _id: "mock5", name: "Ludhiana ISBT (Destination)" }
  ];

  useEffect(() => {
    // Initial fetch
    getLiveBuses().then(res => {
      const bPayload = res.data || res || [];
      // Filter buses on this route
      const activeBusesForRoute = bPayload.filter(b => b.routeId === activeRoute?._id || b.routeId === activeRoute?.routeId);
      setBuses(activeBusesForRoute);
    });

    // Subscribe to rapid Socket updates
    const socket = ioClient(API_BASE, { withCredentials: true });
    socket.emit("subscribeToBuses");
    socket.on("busesStream", (data) => {
      const activeBusesForRoute = data.filter(b => b.routeId === activeRoute?._id || b.routeId === activeRoute?.routeId);
      setBuses(activeBusesForRoute);
      setLastSync(new Date());
    });

    return () => socket.disconnect();
  }, [activeRoute]);

  // If user searched a Stop, render a different view
  if (trackingData.type === "stop") {
    return (
      <div className="w-full flex justify-center py-20 text-slate-500">
        Stop timetable view coming soon.
      </div>
    );
  }

  if (!activeRoute) {
    return <div className="text-center p-8 text-rose-500">Failed to map route framework.</div>;
  }

  return (
    <div className="w-full relative">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-[700] tracking-tight">{activeRoute.name}</h2>
          <p className="text-sm text-slate-500 dark:text-[#8E8E93]">Live status • Sequence view</p>
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-400 bg-slate-100 dark:bg-slate-900 px-3 py-1.5 rounded-full">
           <RefreshCw size={14} className="animate-spin" />
           {lastSync.toLocaleTimeString([], { hour: '2-digit', minute:'2-digit', second:'2-digit' })}
        </div>
      </div>

      <div className="relative pl-6 sm:pl-8 border-l-2 border-slate-200 dark:border-slate-800 ml-4 py-4 space-y-12">
        {routeStops.length > 0 ? routeStops.map((stopRef, idx) => {
          // Resolve standard stop ID schema
          const sId = typeof stopRef === "string" ? stopRef : (stopRef.stopId?._id || stopRef.stopId || stopRef._id);
          const stopObj = allStops.find(s => s._id === sId) || stopRef;
          
          // Find buses approaching this stop
          // In a complex backend, we check 'nextStop.stopId'. For now gracefully hash to simulate:
          const approachingBuses = buses.filter((b, bIndex) => {
             const nId = b.nextStop?.stopId?._id || b.nextStop?.stopId || b.nextStop;
             if (nId === sId) return true;
             // UI Demonstration Logic: If backend lacks explicit nextStop mapping, assign Bus deterministically to mock stops based on array indices
             return (routeStops.length > 0 && routeStops[0]._id.startsWith("mock") && bIndex % routeStops.length === idx);
          });

          return (
            <div key={`stopnode-${idx}`} className="relative flex flex-col justify-center min-h-[40px]">
              {/* Structural Sequence Node */}
              <div className="absolute -left-[35px] sm:-left-[43px] top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-white dark:bg-black border-4 border-slate-300 dark:border-slate-700 z-10" />
              
              <h3 className="text-lg font-[600]">{stopObj.name || `Stop ${idx + 1}`}</h3>
              
              {/* Approaching Buses Injection */}
              {approachingBuses.length > 0 && (
                <div className="mt-4 space-y-3">
                  {approachingBuses.map((b, bIdx) => {
                     // Evaluate color matrices
                     const delayMinutes = b.delay || 0;
                     let statusColor = "bg-emerald-500";
                     let statusText = "On Time";
                     
                     if (delayMinutes > 5) {
                        statusColor = "bg-rose-500";
                        statusText = "Critical Delay";
                     } else if (delayMinutes > 1) {
                        statusColor = "bg-amber-500";
                        statusText = "Slight Delay";
                     }

                     // Pulse indicator if it's the exact bus tracked
                     const isTarget = trackingData.type === "bus" && trackingData.data.busId === b.busId;

                     return (
                       <div key={bIdx} className={`relative flex items-center justify-between p-4 rounded-2xl border ${isTarget ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-[#1C1C1E] shadow-sm'}`}>
                          {isTarget && (
                             <div className="absolute -left-[45px] sm:-left-[53px] top-1/2 -translate-y-1/2 flex items-center justify-center">
                                <div className="absolute w-8 h-8 rounded-full bg-blue-500/30 animate-ping" />
                                <div className="w-4 h-4 bg-blue-500 rounded-full z-20 shadow-md transform rotate-45 border-2 border-white dark:border-black" />
                             </div>
                          )}
                          <div>
                            <p className="text-xs font-[600] text-slate-500 dark:text-[#8E8E93] uppercase tracking-wider mb-1">
                              {isTarget ? "Your tracked vehicle" : "Live Vehicle"}
                            </p>
                            <div className="flex items-center gap-2">
                              <span className={`w-2 h-2 rounded-full ${statusColor}`} />
                              <span className="font-[600]">{statusText}</span>
                              {delayMinutes > 0 && <span className="text-sm font-[500] text-slate-500">+{delayMinutes}m</span>}
                            </div>
                          </div>
                          
                          <div className="flex flex-col items-end">
                            <span className="text-xs text-slate-500 mb-1">Speed</span>
                            <span className="font-[600] text-lg tabular-nums">{Math.round(b.speed || 0)} <span className="text-sm font-normal text-slate-400">km/h</span></span>
                          </div>
                       </div>
                     );
                  })}
                </div>
              )}
            </div>
          );
        }) : (
          <div className="text-slate-500 italic">No structural stops mapped for this sequence.</div>
        )}
      </div>
    </div>
  );
}
