import React, { useState, useEffect, useMemo } from "react";
import { Search, Clock, MapPin, ChevronRight, ArrowLeft, WifiOff, Map as MapIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";
import GovHeader from "../components/GovHeader";
import useTheme from "../hooks/useTheme";
import { getRoutes, getLiveBuses } from "../api";
import LocationTable from "./LocationTable";

const fuzzyMatch = (str, pattern) => {
  if (!pattern || !str) return false;
  const s = String(str).toLowerCase().replace(/\s+/g, "");
  const p = String(pattern).toLowerCase().replace(/\s+/g, "");
  let pIdx = 0;
  for (let i = 0; i < s.length && pIdx < p.length; i++) {
    if (s[i] === p[pIdx]) pIdx++;
  }
  return pIdx === p.length;
};

const calculateDistance = (lat1, lon1, lat2, lon2) => {
  if (!lat1 || !lon1 || !lat2 || !lon2) return Infinity;
  const R = 6371; 
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
            Math.sin(dLon/2) * Math.sin(dLon/2);
  return R * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)));
};

export default function CommuterSearch({ user, role }) {
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [routes, setRoutes] = useState([]);
  const [stops, setStops] = useState([]);
  const [buses, setBuses] = useState([]);
  const [recentSearches, setRecentSearches] = useState([]);
  const [activeTracking, setActiveTracking] = useState(null); 
  
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [lastSyncTime, setLastSyncTime] = useState(null);
  
  const [isSearchingNearby, setIsSearchingNearby] = useState(false);
  const [locationSharing, setLocationSharing] = useState(false);

  useEffect(() => {
    if (role === "operator" && buses.length > 0 && routes.length > 0 && !activeTracking) {
      const assignedBus = buses.find(b => b.operatorId?._id === user?._id || b.operatorId === user?._id);
      if (assignedBus) {
         const assignedRoute = routes.find(r => r._id === assignedBus.routeId?._id || r._id === assignedBus.routeId);
         setActiveTracking({ 
            type: "bus", 
            title: `Bus ${assignedBus.busId}`, 
            subtitle: assignedRoute?.name || "Assigned Route", 
            data: assignedBus, 
            id: assignedBus._id 
         });
      }
    }
  }, [role, user, buses, routes, activeTracking]);

  const hydrateFromCache = () => {
     try {
       const cache = JSON.parse(localStorage.getItem("smartbus_offline_tracker_cache"));
       if (cache) {
         setRoutes(cache.routes || []);
         setStops(cache.stops || []);
         setBuses(cache.buses || []);
         setLastSyncTime(cache.timestamp);
         setIsOffline(true);
       }
     } catch (e) {
       console.error("Cache Hydration Failed", e);
     }
  };

  useEffect(() => {
    window.addEventListener("offline", () => setIsOffline(true));
    window.addEventListener("online", () => setIsOffline(false));

    if (!navigator.onLine) {
       hydrateFromCache();
    } else {
       Promise.all([getRoutes(), getLiveBuses()])
         .then(([rRes, bRes]) => {
           const routesData = rRes.data || rRes || [];
           const busesData = bRes.data || bRes || [];
           
           const allStopsMap = new Map();
           routesData.forEach(r => {
              if (Array.isArray(r.stops)) {
                 r.stops.forEach(sRef => {
                    const stopObj = sRef.stopId || sRef;
                    if (stopObj && stopObj._id && stopObj.name) {
                       allStopsMap.set(stopObj._id, stopObj);
                    }
                 });
              }
           });
           const flatStops = Array.from(allStopsMap.values());
           
           setRoutes(routesData);
           setStops(flatStops);
           setBuses(busesData);
           setIsOffline(false);
           setLastSyncTime(Date.now());
           
           localStorage.setItem("smartbus_offline_tracker_cache", JSON.stringify({
              routes: routesData,
              stops: flatStops,
              buses: busesData,
              timestamp: Date.now()
           }));
         })
         .catch((err) => {
           console.error("Network Fetch Failed, falling back to cache", err);
           hydrateFromCache();
         });
    }

    try {
      const saved = JSON.parse(localStorage.getItem("smartbus_recent_searches")) || [];
      setRecentSearches(saved);
    } catch (e) {
      setRecentSearches([]);
    }
  }, []);

  const saveRecentSearch = (item) => {
    const newRecent = [item, ...recentSearches.filter(i => i.id !== item.id)].slice(0, 5);
    setRecentSearches(newRecent);
    localStorage.setItem("smartbus_recent_searches", JSON.stringify(newRecent));
  };

  const handleNearbySearch = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your hardware.");
      return;
    }
    setIsSearchingNearby(true);
    navigator.geolocation.getCurrentPosition((pos) => {
       setIsSearchingNearby(false);
       const { latitude, longitude } = pos.coords;
       let closestStop = null;
       let minDistance = Infinity;
       
       stops.forEach(s => {
          if (s.lat !== undefined && s.lng !== undefined) {
             const dist = calculateDistance(latitude, longitude, s.lat, s.lng);
             if (dist < minDistance) {
               minDistance = dist;
               closestStop = s;
             }
          }
       });

       if (closestStop) {
          const nearbyRoute = routes.find(r => r.stops.some(st => {
             const refId = st.stopId?._id || st.stopId || st._id;
             return refId === closestStop._id;
          }));
          
          if (nearbyRoute) {
             handleSelect({ type: "route", title: `ROUTE: ${nearbyRoute.name}`, subtitle: `ANCHOR: ${closestStop.name} (${minDistance.toFixed(1)}km)`, data: nearbyRoute, id: nearbyRoute._id });
          } else {
             alert(`Found closest node (${closestStop.name}) but no active tracking array.`);
          }
       } else {
         alert("No stops structurally initialized with coordinates in the system.");
       }
    }, (err) => {
       setIsSearchingNearby(false);
       alert("Failed to access hardware location core. Check permissions.");
    });
  };

  const handleSelect = (item) => {
    saveRecentSearch(item);
    setActiveTracking(item);
  };

  const searchResults = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase();

    const matchedRoutes = routes
      .filter(r => fuzzyMatch(r.name, query) || fuzzyMatch(r.routeId, query))
      .map(r => ({ type: "route", title: r.name, subtitle: `ROUTE ID: ${r.routeId || r._id}`, data: r, id: r._id }));

    const matchedBuses = buses.filter(b => {
      const route = routes.find(r => r._id === b.routeId || r.routeId === b.routeId);
      const routeName = route ? route.name : "Unknown Route";
      return fuzzyMatch(`${b.busId} ${routeName}`, query);
    }).map(b => {
      const route = routes.find(r => r._id === b.routeId || r.routeId === b.routeId);
      return { 
        type: "bus", 
        title: `VEHICLE ID: ${b.busId}`, 
        subtitle: `ASSIGNED: ${route ? route.name : "Active Route"} | STATUS: ${b.status || "NOMINAL"}`, 
        data: b, 
        id: b.busId 
      };
    });

    const matchedStops = stops
      .filter(s => fuzzyMatch(s.name, query))
      .map(s => ({ type: "stop", title: s.name, subtitle: "WAYPOINT NODE", data: s, id: s._id }));

    return [...matchedRoutes, ...matchedBuses, ...matchedStops].slice(0, 8);
  }, [query, routes, buses, stops]);

  if (activeTracking) {
    return (
      <div className="min-h-screen bg-slate-100 dark:bg-[#0a0d14] flex flex-col font-mono text-slate-800 dark:text-slate-200">
        <GovHeader
          lastSyncText="SmartBus"
          backendOk={true}
          onToggleTheme={toggleTheme}
          themeLabel={theme === "dark" ? "night" : "day"}
        />
        <div className="bg-[#0a3161] text-white py-1.5 px-4 text-[10px] uppercase tracking-widest font-bold flex justify-between items-center border-b-[3px] border-[#d4af37]">
          <span>City Bus Transit Service</span>
          <span>Live Bus Tracking</span>
        </div>

        <main className="flex-1 w-full max-w-5xl mx-auto flex flex-col items-stretch p-4 sm:p-6 pb-20">
          <div className="mb-4 text-[11px] font-bold">
            <button 
              onClick={() => setActiveTracking(null)}
              className="text-slate-500 hover:text-[#0a3161] dark:hover:text-blue-400 bg-white/50 dark:bg-black/20 px-3 py-1.5 border border-slate-300 dark:border-slate-700 transition uppercase tracking-widest"
            >
              &#9664; RETURN TO SEARCH
            </button>
          </div>
          
          <LocationTable trackingData={activeTracking} allRoutes={routes} allStops={stops} />
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-[#0a0d14] flex flex-col font-mono text-slate-800 dark:text-slate-200">
      <GovHeader
        lastSyncText="SmartBus Search"
        backendOk={true}
        onToggleTheme={toggleTheme}
        themeLabel={theme === "dark" ? "night" : "day"}
      />
      <div className="bg-[#0a3161] text-white py-1.5 px-4 text-[10px] uppercase tracking-widest font-bold flex justify-between items-center border-b-[3px] border-[#d4af37]">
        <span>City Bus Transit Service</span>
        <span>Public Area</span>
      </div>

      <main className="flex-1 p-4 sm:p-6 w-full max-w-5xl mx-auto flex flex-col">
        
        {isOffline && lastSyncTime && (
           <div className="mb-6 bg-rose-50 dark:bg-rose-950/30 border border-rose-300 dark:border-rose-900 px-5 py-4 flex items-start gap-4">
             <i className="fa-solid fa-triangle-exclamation text-rose-600 dark:text-rose-500 mt-1"></i>
             <div>
               <div className="text-[11px] font-black tracking-widest text-rose-700 dark:text-rose-400 uppercase mb-1">YOU ARE OFFLINE</div>
               <div className="text-[13px] font-bold text-rose-900 dark:text-rose-300">Schedules are loaded from your device. Showing data from {new Date(lastSyncTime).toLocaleString()}.</div>
             </div>
           </div>
        )}

        <section className="bg-white dark:bg-[#0f141e] border-t-8 border-t-[#0a3161] border border-slate-300 dark:border-slate-800 shadow-[0_4px_24px_rgba(0,0,0,0.05)] overflow-hidden transition-colors">
          
          <div className="bg-slate-50 dark:bg-[#151b27] px-8 py-5 border-b border-slate-300 dark:border-slate-800 flex justify-between items-center">
            <div>
              <h1 className="text-[22px] font-black uppercase tracking-widest text-[#0f172a] dark:text-white m-0 leading-tight">
                Search for a Bus
              </h1>
              <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 uppercase tracking-[0.2em] font-bold">
                Find routes, stops, and schedules
              </div>
            </div>
            <img src="https://upload.wikimedia.org/wikipedia/commons/5/55/Emblem_of_India.svg" alt="State Crest" className="h-[46px] filter grayscale opacity-50 dark:invert" />
          </div>

          <div className="p-8">
            <div className="bg-slate-50 dark:bg-[#151b27] border border-slate-300 dark:border-slate-700 p-5 mb-8 flex flex-col gap-3">
               <h3 className="text-[11px] font-black uppercase tracking-widest text-[#0a3161] dark:text-blue-400 border-b border-slate-300 dark:border-slate-700 pb-2">
                 Enter Search Details
               </h3>
               <div className="relative w-full">
                 <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                   <i className="fa-solid fa-satellite-dish text-slate-400"></i>
                 </div>
                 <input
                   type="text"
                   className="block w-full pl-10 pr-3 py-3 bg-white dark:bg-[#0a0d14] border border-slate-300 dark:border-slate-700 text-[14px] font-bold text-slate-800 dark:text-white focus:border-[#0a3161] focus:ring-1 focus:ring-[#0a3161] outline-none transition uppercase placeholder:normal-case placeholder:font-normal placeholder:opacity-70"
                   placeholder="Enter Bus ID, Route, or Stop..."
                   value={query}
                   onChange={(e) => setQuery(e.target.value)}
                   autoFocus
                 />
               </div>
            </div>

            {query.trim() ? (
              <div className="w-full flex flex-col gap-2">
                <h3 className="text-[11px] font-black uppercase tracking-widest text-[#0a3161] dark:text-blue-400 border-b border-slate-300 dark:border-slate-700 pb-2 mb-2">
                 Search Results
               </h3>
                {searchResults.length > 0 ? (
                  searchResults.map((item, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSelect(item)}
                      className="flex items-center justify-between w-full p-3 bg-white dark:bg-[#151b27] border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-[#1f2937] transition-all text-left group"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 flex items-center justify-center bg-blue-50 dark:bg-blue-900/20 text-[#0a3161] dark:text-blue-400 border border-slate-200 dark:border-blue-900/50">
                          {item.type === "route" ? <i className="fa-solid fa-route"></i> : <i className="fa-solid fa-bus"></i>}
                        </div>
                        <div>
                          <h3 className="font-bold text-[14px] uppercase tracking-wider text-slate-800 dark:text-white">{item.title}</h3>
                          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{item.subtitle}</p>
                        </div>
                      </div>
                      <i className="fa-solid fa-chevron-right text-slate-400 group-hover:text-[#0a3161] dark:group-hover:text-blue-400 transition-colors"></i>
                    </button>
                  ))
                ) : (
                  <div className="text-center bg-slate-50 dark:bg-[#151b27] border border-slate-300 dark:border-slate-700 p-8 text-slate-500 text-xs font-bold uppercase tracking-widest">
                    No results found for "{query}"
                  </div>
                )}
              </div>
            ) : (
              <div className="w-full flex flex-col gap-2">
                 <div className="flex items-center gap-4 mb-2">
                   <h3 className="flex-1 text-[11px] font-black uppercase tracking-widest text-[#0a3161] dark:text-blue-400 border-b border-slate-300 dark:border-slate-700 pb-2">
                     Recent Searches
                   </h3>
                   <button 
                     onClick={handleNearbySearch}
                     disabled={isSearchingNearby}
                     className="bg-slate-200 dark:bg-slate-800 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-700 text-[10px] px-3 py-1.5 uppercase tracking-widest font-bold transition-all flex items-center gap-2"
                   >
                     <i className={`fa-solid fa-location-crosshairs ${isSearchingNearby ? 'animate-spin' : ''}`}></i>
                     {isSearchingNearby ? "SEARCHING..." : "FIND NEARBY STOPS"}
                   </button>
                 </div>
                 
                 {recentSearches.length > 0 ? (
                     recentSearches.map((item, idx) => (
                      <button
                        key={`recent-${idx}`}
                        onClick={() => handleSelect(item)}
                         className="flex items-center justify-between w-full p-3 bg-white dark:bg-[#151b27] border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-[#1f2937] transition-all text-left group"
                      >
                        <div className="flex flex-col">
                          <h3 className="font-bold text-[14px] uppercase tracking-wider text-slate-800 dark:text-slate-200">{item.title}</h3>
                          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{item.subtitle}</p>
                        </div>
                        <i className="fa-solid fa-clock-rotate-left text-slate-300 dark:text-slate-600 group-hover:text-[#0a3161] dark:group-hover:text-blue-400 transition-colors"></i>
                      </button>
                     ))
                 ) : (
                    <div className="text-center bg-slate-50 dark:bg-[#151b27] border border-slate-300 dark:border-slate-700 p-8 text-slate-500 text-xs font-bold uppercase tracking-widest">
                      No recent searches. Use the search bar above to begin.
                    </div>
                 )}
              </div>
            )}
            
            <div className="mt-8 text-center border-t border-slate-300 dark:border-slate-800 pt-6">
               <div className="text-[10px] text-slate-500 uppercase tracking-[0.2em] font-bold">
                 Official Platform for City Bus Tracking
               </div>
            </div>
            
          </div>
        </section>
      </main>
    </div>
  );
}
