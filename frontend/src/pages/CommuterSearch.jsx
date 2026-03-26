import React, { useState, useEffect, useMemo } from "react";
import { Search, Clock, MapPin, ChevronRight, ArrowLeft, WifiOff, Map as MapIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";
import GovHeader from "../components/GovHeader";
import useTheme from "../hooks/useTheme";
import { getRoutes, getLiveBuses } from "../api";
import LocationTable from "./LocationTable";

// Strict Subsequence string-distance matcher matching user intent despite misspellings/spaces
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

// Haversine distance calculator for "Nearby" logic (km)
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
  
  // Offline Capability States
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [lastSyncTime, setLastSyncTime] = useState(null);
  
  // Geolocation & Role States
  const [isSearchingNearby, setIsSearchingNearby] = useState(false);
  const [locationSharing, setLocationSharing] = useState(false);

  // Operator Hardware Targeting
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
    // Network Event Listeners
    window.addEventListener("offline", () => setIsOffline(true));
    window.addEventListener("online", () => setIsOffline(false));

    if (!navigator.onLine) {
       hydrateFromCache();
    } else {
       // Attempt network fetch
       Promise.all([getRoutes(), getLiveBuses()])
         .then(([rRes, bRes]) => {
           const routesData = rRes.data || rRes || [];
           const busesData = bRes.data || bRes || [];
           
           // Extract and flatten Populated Stops natively from Route Payload
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
           
           // Cache to LocalStorage mimicking IndexedDB persistence
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

    // Load recent searches
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
      alert("Geolocation is not supported by your browser.");
      return;
    }
    setIsSearchingNearby(true);
    navigator.geolocation.getCurrentPosition((pos) => {
       setIsSearchingNearby(false);
       const { latitude, longitude } = pos.coords;
       // Find the closest stop mathematically from cached arrays
       let closestStop = null;
       let minDistance = Infinity;
       
       stops.forEach(s => {
          if (s.lat !== undefined && s.lng !== undefined) {
             const lat = s.lat;
             const lon = s.lng;
             const dist = calculateDistance(latitude, longitude, lat, lon);
             if (dist < minDistance) {
               minDistance = dist;
               closestStop = s;
             }
          }
       });

       if (closestStop) {
          // Find routes that encompass this closest stop
          const nearbyRoute = routes.find(r => r.stops.some(st => {
             const refId = st.stopId?._id || st.stopId || st._id;
             return refId === closestStop._id;
          }));
          
          if (nearbyRoute) {
             handleSelect({ type: "route", title: `Nearby: ${nearbyRoute.name}`, subtitle: `Located via ${closestStop.name} (${minDistance.toFixed(1)}km)`, data: nearbyRoute, id: nearbyRoute._id });
          } else {
             alert(`Found closest stop (${closestStop.name}) but no active tracking matrix.`);
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

  // Autocomplete filtering
  const searchResults = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase();

    // Filter routes using subsequence fuzzy match
    const matchedRoutes = routes
      .filter(r => fuzzyMatch(r.name, query) || fuzzyMatch(r.routeId, query))
      .map(r => ({ type: "route", title: r.name, subtitle: `Route ID: ${r.routeId || r._id}`, data: r, id: r._id }));

    // Filter buses (masking raw ID with Route name for commuters)
    const matchedBuses = buses.filter(b => {
      // Find matching route name
      const route = routes.find(r => r._id === b.routeId || r.routeId === b.routeId);
      const routeName = route ? route.name : "Unknown Route";
      return fuzzyMatch(`${b.busId} ${routeName}`, query);
    }).map(b => {
      const route = routes.find(r => r._id === b.routeId || r.routeId === b.routeId);
      return { 
        type: "bus", 
        title: `Bus traveling on ${route ? route.name : "Active Route"}`, 
        subtitle: `Status: ${b.status || "En route"}`, 
        data: b, 
        id: b.busId 
      };
    });

    // Filter stops using subsequence fuzzy match
    const matchedStops = stops
      .filter(s => fuzzyMatch(s.name, query))
      .map(s => ({ type: "stop", title: s.name, subtitle: "Bus Stop", data: s, id: s._id }));

    return [...matchedRoutes, ...matchedBuses, ...matchedStops].slice(0, 8); // top 8 results
  }, [query, routes, buses, stops]);

  if (activeTracking) {
    return (
      <div className="min-h-screen bg-white dark:bg-[#000000] text-black dark:text-white flex flex-col font-sans transition-colors duration-500">
        <GovHeader
          lastSyncText="SmartBus"
          backendOk={true}
          onToggleTheme={toggleTheme}
          themeLabel={theme === "dark" ? "night" : "day"}
        />
        <main className="flex-1 w-full max-w-2xl mx-auto flex flex-col items-stretch p-4">
          <button 
            onClick={() => setActiveTracking(null)}
            className={`flex items-center gap-2 px-4 py-3 mb-4 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors self-start font-[500] ${role === 'operator' ? 'hidden' : ''}`}
          >
            <ArrowLeft size={20} /> Back to Search
          </button>
          
          {/* Operator Specific Action Node */}
          {role === "operator" && (
            <div className="w-full bg-slate-50 dark:bg-[#2C2C2E] border border-slate-200 dark:border-slate-800 rounded-xl p-5 mb-8 flex justify-between items-center shadow-sm fade-in-up">
               <div>
                  <p className="text-xs font-[600] text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-1 mt-0">Authorized Broadcasting</p>
                  <h4 className="text-md sm:text-lg font-[800] text-slate-800 dark:text-white tracking-tight flex items-center gap-2">
                    <span className={`w-2.5 h-2.5 rounded-full ${locationSharing ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`} />
                    Location Signal: {locationSharing ? 'ON' : 'OFF'}
                  </h4>
               </div>
               <button 
                  onClick={() => setLocationSharing(!locationSharing)}
                  className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 dark:focus:ring-offset-[#1C1C1E] ${locationSharing ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-700'}`}
               >
                  <span className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${locationSharing ? 'translate-x-7' : 'translate-x-1'} shadow-sm`} />
               </button>
            </div>
          )}

          <LocationTable trackingData={activeTracking} allRoutes={routes} allStops={stops} />
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-[#000000] text-black dark:text-white flex flex-col font-sans transition-colors duration-500">
      <GovHeader
        lastSyncText="SmartBus Search"
        backendOk={true}
        onToggleTheme={toggleTheme}
        themeLabel={theme === "dark" ? "night" : "day"}
      />

      <main className="flex-1 w-full max-w-2xl mx-auto flex flex-col items-center justify-start p-6 pt-8 sm:pt-16 z-10">
        
        {/* Offline Cache Banner */}
        {isOffline && lastSyncTime && (
          <div className="w-full flex items-center gap-3 p-4 mb-6 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-700 dark:text-slate-300 shadow-sm animate-pulse-slow">
            <WifiOff size={20} className="text-rose-500 shrink-0" />
            <div className="text-sm">
              <span className="font-[600] text-black dark:text-white">Offline Mode Enabled.</span>{' '}
              Schedules loaded securely from localized cache. <br/>
              <span className="text-xs text-slate-500 opacity-80 pt-1 block">Last Synced: {new Date(lastSyncTime).toLocaleString()}</span>
            </div>
          </div>
        )}

        <div className="w-full flex justify-between items-center mb-8">
          <h1 className="text-4xl sm:text-5xl font-[700] tracking-tight text-left">
            Where is my bus?
          </h1>
          {role === "admin" && (
             <button 
               onClick={() => navigate("/admin/dashboard")} 
               className="px-4 py-2 bg-[#003366] text-white text-xs font-[700] uppercase tracking-wider rounded-md hover:bg-blue-800 transition-colors shadow-sm hidden sm:block shrink-0"
             >
               Admin Panel &rarr;
             </button>
          )}
        </div>

        <div className="relative w-full mb-10">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Search className="h-6 w-6 text-slate-400" />
          </div>
          <input
            type="text"
            className="block w-full pl-12 pr-4 py-5 bg-slate-100 dark:bg-[#1C1C1E] border-transparent rounded-2xl text-[19px] shadow-sm focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 outline-none transition-all placeholder:text-slate-500 dark:placeholder:text-[#8E8E93]"
            placeholder="Search by bus number, route name, or stop..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
          />
        </div>

        {query.trim() ? (
          <div className="w-full flex flex-col gap-2">
            <h2 className="text-sm font-[600] text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2 px-2">
              Results
            </h2>
            {searchResults.length > 0 ? (
              searchResults.map((item, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSelect(item)}
                  className="flex items-center justify-between w-full p-4 bg-white dark:bg-[#1C1C1E] border border-slate-200 dark:border-slate-800 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-all text-left group"
                >
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-500 rounded-xl">
                      {item.type === "route" ? <MapPin size={24} /> : <Search size={24} />}
                    </div>
                    <div>
                      <h3 className="font-[600] text-lg">{item.title}</h3>
                      <p className="text-sm text-slate-500 dark:text-[#8E8E93]">{item.subtitle}</p>
                    </div>
                  </div>
                  <ChevronRight className="text-slate-400 group-hover:text-black dark:group-hover:text-white transition-colors" />
                </button>
              ))
            ) : (
              <p className="text-center text-slate-500 py-8">No results found for "{query}"</p>
            )}
          </div>
        ) : (
          <div className="w-full flex flex-col gap-2">
             <div className="w-full flex items-center justify-between mb-2 px-2">
               <h2 className="text-sm font-[600] text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-2">
                 <Clock size={16} /> Recent tracking
               </h2>
               
               <button 
                 onClick={handleNearbySearch}
                 disabled={isSearchingNearby}
                 className="flex items-center gap-1.5 text-sm font-[600] text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors bg-blue-50/50 dark:bg-blue-900/20 px-3 py-1.5 rounded-full"
               >
                 <MapIcon size={14} className={isSearchingNearby ? "animate-pulse" : ""} />
                 {isSearchingNearby ? "Scanning..." : "Find Nearby Bus"}
               </button>
             </div>
             
             {recentSearches.length > 0 ? (
                 recentSearches.map((item, idx) => (
                  <button
                    key={`recent-${idx}`}
                    onClick={() => handleSelect(item)}
                    className="flex items-center justify-between w-full p-4 bg-white dark:bg-[#1C1C1E] border border-slate-200 dark:border-slate-800 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-all text-left group"
                  >
                    <div className="flex flex-col">
                      <h3 className="font-[600] text-lg">{item.title}</h3>
                      <p className="text-sm text-slate-500 dark:text-[#8E8E93]">{item.subtitle}</p>
                    </div>
                    <ChevronRight className="text-slate-400 group-hover:text-black dark:group-hover:text-white transition-colors" />
                  </button>
                 ))
             ) : (
                <div className="text-center p-6 bg-slate-50 dark:bg-slate-900/50 rounded-xl text-slate-500 text-sm border border-slate-100 dark:border-slate-800 border-dashed">
                  No recent searches. Try searching for a route above or use the radar to scan nearby services.
                </div>
             )}
          </div>
        )}

      </main>
    </div>
  );
}
