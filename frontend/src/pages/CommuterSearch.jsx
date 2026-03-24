import React, { useState, useEffect, useMemo } from "react";
import { Search, Clock, MapPin, ChevronRight, ArrowLeft } from "lucide-react";
import GovHeader from "../components/GovHeader";
import useTheme from "../hooks/useTheme";
import { getRoutes, getLiveBuses, getStops } from "../api";
import RouteTimeline from "./RouteTimeline";

export default function CommuterSearch() {
  const { theme, toggleTheme } = useTheme();
  const [query, setQuery] = useState("");
  const [routes, setRoutes] = useState([]);
  const [stops, setStops] = useState([]);
  const [buses, setBuses] = useState([]);
  const [recentSearches, setRecentSearches] = useState([]);
  const [activeTracking, setActiveTracking] = useState(null); // { type: 'route' | 'bus', data: ... }

  useEffect(() => {
    // Load initial data for search context
    Promise.all([getRoutes(), getLiveBuses()])
      .then(([rRes, bRes]) => {
        const routesData = rRes.data || rRes || [];
        setRoutes(routesData);
        setBuses(bRes.data || bRes || []);
        
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
        setStops(Array.from(allStopsMap.values()));
      })
      .catch((err) => console.error("Failed // load search context", err));

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

  const handleSelect = (item) => {
    saveRecentSearch(item);
    setActiveTracking(item);
  };

  // Autocomplete filtering
  const searchResults = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase();

    // Filter routes
    const matchedRoutes = routes
      .filter(r => r.name.toLowerCase().includes(q) || r.routeId?.toLowerCase().includes(q))
      .map(r => ({ type: "route", title: r.name, subtitle: `Route ID: ${r.routeId || r._id}`, data: r, id: r._id }));

    // Filter buses (masking raw ID with Route name for commuters)
    const matchedBuses = buses.filter(b => {
      // Find matching route name
      const route = routes.find(r => r._id === b.routeId || r.routeId === b.routeId);
      const routeName = route ? route.name : "Unknown Route";
      const searchString = `${b.busId} ${routeName}`.toLowerCase();
      return searchString.includes(q);
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

    // Filter stops
    const matchedStops = stops
      .filter(s => s.name.toLowerCase().includes(q))
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
            className="flex items-center gap-2 px-4 py-3 mb-4 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors self-start font-[500]"
          >
            <ArrowLeft size={20} /> Back to Search
          </button>
          
          <RouteTimeline trackingData={activeTracking} allRoutes={routes} allStops={stops} />
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

      <main className="flex-1 w-full max-w-2xl mx-auto flex flex-col items-center justify-start p-6 pt-12 sm:pt-24 z-10">
        <h1 className="text-4xl sm:text-5xl font-[700] tracking-tight mb-8 w-full text-left">
          Where is my bus?
        </h1>

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
             {recentSearches.length > 0 && (
               <>
                 <h2 className="text-sm font-[600] text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2 px-2 flex items-center gap-2">
                   <Clock size={16} /> Recent tracking
                 </h2>
                 {recentSearches.map((item, idx) => (
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
                 ))}
               </>
             )}
          </div>
        )}

      </main>
    </div>
  );
}
