import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import GovHeader from "../components/GovHeader";
import useTheme from "../hooks/useTheme";
import {
  listRoutes,
  createRoute,
  deleteRoute,
  listStops,
  createStop,
  deleteStop,
  listUsers,
  createUser,
  updateUser,
  deleteUser
} from "../api";

export default function AdminDashboard() {
  const { theme, toggleTheme } = useTheme();
  const [error, setError] = useState("");

  // Routes State
  const [routes, setRoutes] = useState([]);
  const [selectedRoute, setSelectedRoute] = useState(null);
  const [newRouteId, setNewRouteId] = useState("");
  const [newRouteName, setNewRouteName] = useState("");
  const [routesLoading, setRoutesLoading] = useState(false);

  // Stops State
  const [stops, setStops] = useState([]);
  const [stopsLoading, setStopsLoading] = useState(false);
  const [newStop, setNewStop] = useState({ stopId: "", name_en: "", lat: "", lng: "", sequence: "" });

  // Users State
  const [users, setUsers] = useState([]);
  const [userPage, setUserPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [usersLoading, setUsersLoading] = useState(false);
  const [userModal, setUserModal] = useState({ open: false, editingMap: null, username: "", password: "", role: "commuter", busId: "" });

  useEffect(() => {
    loadRoutes();
    loadUsers(userPage);
  }, [userPage]);

  useEffect(() => {
    if (selectedRoute) loadStops(selectedRoute.routeId);
    else setStops([]);
  }, [selectedRoute]);

  // Generators
  async function loadRoutes() {
    try { setRoutesLoading(true); setRoutes(await listRoutes()); } catch (e) { setError(e.message); } finally { setRoutesLoading(false); }
  }
  async function loadStops(rid) {
    try { setStopsLoading(true); setStops(await listStops(rid)); } catch (e) { setError(e.message); } finally { setStopsLoading(false); }
  }
  async function loadUsers(p) {
    try {
      setUsersLoading(true);
      const res = await listUsers(p, 5); // Display 5 per page
      setUsers(Array.isArray(res.users) ? res.users : []);
      setTotalPages(res.pages || 1);
    } catch (e) {
      setError(String(e.message || e));
    } finally {
      setUsersLoading(false);
    }
  }

  // --- API Handlers: ROUTES ---
  const handleCreateRoute = async () => {
    if (!newRouteId || !newRouteName) return setError("routeId and name required");
    try {
      await createRoute({ routeId: newRouteId, name: newRouteName });
      setNewRouteId(""); setNewRouteName(""); loadRoutes();
    } catch (e) { setError(String(e.message || e)); }
  };
  const handleDeleteRoute = async (routeId) => {
    if (!confirm("Delete route and its stops?")) return;
    try { await deleteRoute(routeId); if (selectedRoute?.routeId === routeId) setSelectedRoute(null); loadRoutes(); } catch (e) { setError(String(e.message || e)); }
  };

  // --- API Handlers: STOPS ---
  const handleCreateStop = async () => {
    try {
      const payload = { stopId: newStop.stopId, routeId: selectedRoute.routeId, name_en: newStop.name_en, lat: Number(newStop.lat), lng: Number(newStop.lng), sequence: Number(newStop.sequence) };
      await createStop(payload);
      setNewStop({ stopId: "", name_en: "", lat: "", lng: "", sequence: "" });
      loadStops(selectedRoute.routeId);
    } catch (e) { setError(String(e.message || e)); }
  };
  const handleDeleteStop = async (stopId) => {
    if (!confirm("Delete stop?")) return;
    try { await deleteStop(stopId); loadStops(selectedRoute.routeId); } catch (e) { setError(String(e.message || e)); }
  };

  // --- API Handlers: USERS ---
  const openUserModal = (u = null) => {
    setUserModal({ open: true, editingMap: u, username: u ? u.username : "", password: "", role: u ? u.role : "commuter", busId: u ? u.busId : "" });
  };
  const handleSaveUser = async () => {
    try {
      if (userModal.editingMap) {
        const payload = { username: userModal.username, role: userModal.role, busId: userModal.busId };
        if (userModal.password) payload.password = userModal.password;
        await updateUser(userModal.editingMap._id, payload);
      } else {
        await createUser({ username: userModal.username, password: userModal.password, role: userModal.role, busId: userModal.busId });
      }
      setUserModal({ ...userModal, open: false });
      loadUsers(userPage);
    } catch (e) { setError(String(e.message || e)); }
  };
  const handleDeleteUser = async (id) => {
    if (!confirm("Irreversibly delete this user?")) return;
    try { await deleteUser(id); loadUsers(userPage); } catch (e) { setError(String(e.message || e)); }
  };

  return (
    <div className="min-h-screen pb-12 transition-colors bg-slate-50 text-slate-800 dark:bg-[#030816] dark:text-slate-300 font-mono">
      <GovHeader lastSyncText="Admin Console" backendOk={true} onToggleTheme={toggleTheme} themeLabel={theme === "dark" ? "night" : "day"} />
      
      <div className="bg-white/90 dark:bg-[#0f172a]/80 text-[#0a3161] dark:text-[#38bdf8] text-[11px] font-black tracking-[0.2em] px-8 py-3.5 shadow-sm dark:shadow-[inset_0_-1px_0_rgba(56,189,248,0.2)] border-b border-slate-200 dark:border-white/5 flex items-center justify-between backdrop-blur-md sticky top-0 z-40 transition-colors">
        <div className="flex items-center gap-3">
          <i className="fa-solid fa-server"></i>
          AUTHORITY PANEL — MANAGE DOMAINS AND INFRASTRUCTURE ORCHESTRATION
        </div>
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 dark:bg-emerald-400 animate-pulse"></div>
          <span className="text-emerald-700 dark:text-emerald-400">SECURE LINK</span>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-10">
        
        {/* Error Banners */}
        {error && (
          <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="mb-8 p-4 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-500/50 text-rose-700 dark:text-rose-400 rounded shadow-sm text-[12px] uppercase tracking-widest font-bold flex justify-between items-center relative overflow-hidden backdrop-blur-sm">
            <div className="flex items-center gap-3">
              <i className="fa-solid fa-triangle-exclamation"></i>
              {error}
            </div>
            <button onClick={() => setError("")} className="text-xl leading-none text-rose-500/50 hover:text-rose-600 dark:hover:text-rose-400 font-sans">&times;</button>
          </motion.div>
        )}

        {/* TOP INFRASTRUCTURE GRID (ROUTES & STOPS) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-10">
          
          {/* Routes Pane */}
          <section className="col-span-1 lg:col-span-4 bg-white dark:bg-[#08101f] border border-slate-200 dark:border-white/10 rounded-sm shadow-lg dark:shadow-2xl overflow-hidden flex flex-col relative transition-colors">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-600 to-indigo-600"></div>
            <div className="px-6 py-5 border-b border-slate-100 dark:border-white/5 flex justify-between items-center bg-slate-50 dark:bg-[#050b14]/50">
              <div>
                <h3 className="font-black tracking-[0.1em] text-slate-900 dark:text-white uppercase text-[14px]">Transit Routes</h3>
                <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">System Path Networks</div>
              </div>
              <i className="fa-solid fa-route text-slate-400 dark:text-slate-600"></i>
            </div>
            
            <div className="p-5 flex-1 flex flex-col">
              <div className="space-y-3 mb-6 bg-slate-50 dark:bg-white/5 p-4 rounded-sm border border-slate-200 dark:border-white/5 transition-colors">
                <div className="text-[9px] uppercase tracking-widest text-[#0a3161] dark:text-[#38bdf8] font-bold mb-2">Initialize New Node</div>
                <input className="w-full text-xs py-2.5 px-3 bg-white dark:bg-transparent border border-slate-300 dark:border-slate-700/50 text-slate-800 dark:text-white outline-none focus:border-[#0a3161] dark:focus:border-[#38bdf8] focus:bg-[#0a3161]/5 dark:focus:bg-[#38bdf8]/5 transition-all shadow-inner placeholder:text-slate-400 dark:placeholder:text-slate-600" placeholder="Route ID (e.g. R-101)" value={newRouteId} onChange={(e) => setNewRouteId(e.target.value)} />
                <input className="w-full text-xs py-2.5 px-3 bg-white dark:bg-transparent border border-slate-300 dark:border-slate-700/50 text-slate-800 dark:text-white outline-none focus:border-[#0a3161] dark:focus:border-[#38bdf8] focus:bg-[#0a3161]/5 dark:focus:bg-[#38bdf8]/5 transition-all shadow-inner placeholder:text-slate-400 dark:placeholder:text-slate-600" placeholder="Route Name" value={newRouteName} onChange={(e) => setNewRouteName(e.target.value)} />
                <button className="w-full bg-[#0a3161]/10 dark:bg-[#38bdf8]/10 hover:bg-[#0a3161]/20 dark:hover:bg-[#38bdf8]/20 text-[#0a3161] dark:text-[#38bdf8] font-bold py-2.5 text-[11px] uppercase tracking-widest transition-colors border border-[#0a3161]/30 dark:border-[#38bdf8]/30 mt-2" onClick={handleCreateRoute}>
                  Deploy Route
                </button>
              </div>

              <div className="flex-1 border-t border-slate-100 dark:border-white/5 pt-4">
                {routesLoading ? <div className="text-[10px] uppercase tracking-widest font-bold animate-pulse text-slate-400 dark:text-slate-500 text-center py-8">Loading pipelines...</div> : (
                  <div className="flex flex-col gap-2 max-h-72 overflow-y-auto pr-1 custom-scrollbar">
                    {routes.map(r => (
                      <div key={r.routeId} onClick={() => setSelectedRoute(r)} className={`p-4 border cursor-pointer transition-all flex justify-between items-center ${selectedRoute?.routeId === r.routeId ? "bg-[#0a3161]/5 dark:bg-[#38bdf8]/10 border-[#0a3161]/30 dark:border-[#38bdf8]/50 shadow-[0_0_15px_rgba(10,49,97,0.05)] dark:shadow-[0_0_15px_rgba(56,189,248,0.1)]" : "bg-white dark:bg-transparent border-slate-200 dark:border-white/5 hover:border-slate-300 dark:hover:border-white/20 hover:bg-slate-50 dark:hover:bg-white/5"}`}>
                        <div>
                          <div className={`text-[12px] font-black uppercase tracking-wider ${selectedRoute?.routeId === r.routeId ? "text-[#0a3161] dark:text-[#38bdf8]" : "text-slate-700 dark:text-slate-300"}`}>{r.routeId}</div>
                          <div className="text-[10px] text-slate-500 font-medium tracking-wide mt-1">{r.name}</div>
                        </div>
                        <button onClick={(e) => { e.stopPropagation(); handleDeleteRoute(r.routeId); }} className="text-rose-500 dark:text-rose-400 hover:text-white border border-transparent hover:border-rose-500 hover:bg-rose-500 font-bold text-[9px] uppercase tracking-widest px-2.5 py-1 transition-colors rounded-sm">Del</button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </section>

          {/* Stops Pane */}
          <section className="col-span-1 lg:col-span-8 bg-white dark:bg-[#08101f] border border-slate-200 dark:border-white/10 rounded-sm shadow-lg dark:shadow-2xl overflow-hidden flex flex-col relative group transition-colors">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-teal-500 to-emerald-600"></div>
            
            {/* Very faint grey dot-matrix map background */}
            <div className="absolute inset-0 z-0 opacity-[0.05] dark:opacity-[0.03] pointer-events-none" style={{ backgroundImage: theme === 'dark' ? "radial-gradient(#ffffff 1px, transparent 1px)" : "radial-gradient(#000000 1px, transparent 1px)", backgroundSize: "20px 20px" }}></div>
            
            {/* Primary route highlight effect overlay if selected */}
            {selectedRoute && (
               <div className="absolute inset-0 z-0 opacity-10 pointer-events-none" style={{ background: "linear-gradient(45deg, transparent 48%, #10b981 49%, #10b981 51%, transparent 52%)", backgroundSize: "100px 100px" }}></div>
            )}

            <div className="px-6 py-5 border-b border-slate-100 dark:border-white/5 flex justify-between items-center bg-slate-50/90 dark:bg-[#050b14]/80 backdrop-blur-md relative z-10 transition-colors">
              <div>
                <h3 className="font-black tracking-[0.1em] text-slate-900 dark:text-white uppercase text-[14px]">Waypoints {selectedRoute ? <span className="text-emerald-600 dark:text-emerald-400 ml-2">[{selectedRoute.routeId}]</span> : ""}</h3>
                <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">Geo-Coordinate Matrices</div>
              </div>
              <i className="fa-solid fa-location-dot text-slate-400 dark:text-slate-600"></i>
            </div>
            
            <div className="p-6 relative z-10 flex-1 flex flex-col">
              {!selectedRoute ? (
                <div className="text-[11px] font-bold tracking-widest uppercase text-slate-400 dark:text-slate-600 flex flex-col items-center justify-center p-16 border border-dashed border-slate-300 dark:border-slate-700/50 bg-slate-50/50 dark:bg-white/[0.02] transition-colors">
                  <i className="fa-solid fa-satellite mb-4 text-3xl opacity-50"></i>
                  Select a primary Route to manage telemetry nodes
                </div>
              ) : (
                <div className="flex flex-col h-full">
                  
                  <div className="bg-slate-50 dark:bg-white/5 p-4 rounded-sm border border-slate-200 dark:border-white/5 mb-6 transition-colors">
                    <div className="text-[9px] uppercase tracking-widest text-emerald-700 dark:text-emerald-400 font-bold mb-3">Append Waypoint Data</div>
                    <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
                      <input className="text-xs py-2 px-3 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700/50 text-slate-800 dark:text-white outline-none focus:border-emerald-500 focus:bg-emerald-50 dark:focus:bg-emerald-500/5 shadow-inner placeholder:text-slate-400 dark:placeholder:text-slate-600 uppercase transition-colors" placeholder="Stop ID" value={newStop.stopId} onChange={e => setNewStop(v => ({ ...v, stopId: e.target.value }))} />
                      <input className="text-xs py-2 px-3 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700/50 text-slate-800 dark:text-white outline-none focus:border-emerald-500 focus:bg-emerald-50 dark:focus:bg-emerald-500/5 shadow-inner placeholder:text-slate-400 dark:placeholder:text-slate-600 transition-colors" placeholder="Name" value={newStop.name_en} onChange={e => setNewStop(v => ({ ...v, name_en: e.target.value }))} />
                      <input className="text-xs py-2 px-3 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700/50 text-slate-800 dark:text-white outline-none focus:border-emerald-500 focus:bg-emerald-50 dark:focus:bg-emerald-500/5 shadow-inner placeholder:text-slate-400 dark:placeholder:text-slate-600 font-mono transition-colors" placeholder="Lat" value={newStop.lat} onChange={e => setNewStop(v => ({ ...v, lat: e.target.value }))} />
                      <input className="text-xs py-2 px-3 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700/50 text-slate-800 dark:text-white outline-none focus:border-emerald-500 focus:bg-emerald-50 dark:focus:bg-emerald-500/5 shadow-inner placeholder:text-slate-400 dark:placeholder:text-slate-600 font-mono transition-colors" placeholder="Lng" value={newStop.lng} onChange={e => setNewStop(v => ({ ...v, lng: e.target.value }))} />
                      <div className="flex gap-2">
                         <input className="w-full text-xs py-2 px-3 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700/50 text-slate-800 dark:text-white outline-none focus:border-emerald-500 focus:bg-emerald-50 dark:focus:bg-emerald-500/5 shadow-inner placeholder:text-slate-400 dark:placeholder:text-slate-600 font-mono text-center transition-colors" placeholder="Seq" value={newStop.sequence} onChange={e => setNewStop(v => ({ ...v, sequence: e.target.value }))} />
                         <button className="bg-emerald-600/10 dark:bg-emerald-500/10 hover:bg-emerald-600/20 dark:hover:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 font-bold px-4 text-[10px] uppercase transition-colors border border-emerald-600/30 dark:border-emerald-500/30 whitespace-nowrap tracking-wider" onClick={handleCreateStop}>ADD</button>
                      </div>
                    </div>
                  </div>
                  
                  <div className="border border-slate-200 dark:border-white/5 bg-white/50 dark:bg-slate-900/50 flex-1 flex flex-col transition-colors">
                    {stopsLoading ? <div className="text-[10px] font-bold animate-pulse text-slate-400 dark:text-slate-500 text-center py-10 uppercase tracking-widest">Syncing telemetry arrays...</div> : (
                      <table className="w-full text-left text-xs border-collapse">
                        <thead>
                          <tr className="bg-slate-50 dark:bg-white/5 border-b border-slate-200 dark:border-white/10 text-[9px] uppercase tracking-widest text-slate-500 dark:text-slate-400 transition-colors">
                            <th className="px-4 py-3 font-bold w-12 text-center">Seq</th>
                            <th className="px-4 py-3 font-bold">Waypoint ID</th>
                            <th className="px-4 py-3 font-bold">Label</th>
                            <th className="px-4 py-3 font-bold font-mono">Coordinates</th>
                            <th className="px-4 py-3 font-bold text-right">Action</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                          {stops.length === 0 ? (
                            <tr><td colSpan="5" className="px-4 py-8 text-center text-slate-400 dark:text-slate-500 italic">No coordinates stored.</td></tr>
                          ) : stops.map((s) => (
                            <tr key={s.stopId} className="hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-colors group/row">
                              <td className="px-4 py-3 text-center">
                                <span className="bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 font-black text-[10px] px-1.5 py-0.5 rounded shadow-sm border border-emerald-200 dark:border-emerald-500/20">{window.String(s.sequence).padStart(2,'0')}</span>
                              </td>
                              <td className="px-4 py-3 font-bold text-slate-800 dark:text-slate-200">{s.stopId}</td>
                              <td className="px-4 py-3 text-slate-600 dark:text-slate-400">{s.name_en}</td>
                              <td className="px-4 py-3 font-mono text-[10px] text-slate-400 dark:text-slate-500 group-hover/row:text-slate-600 dark:group-hover/row:text-slate-400 transition-colors">[{Number(s.lat).toFixed(4)}, {Number(s.lng).toFixed(4)}]</td>
                              <td className="px-4 py-3 text-right">
                                <button onClick={() => handleDeleteStop(s.stopId)} className="text-rose-500 hover:text-white font-bold text-[9px] uppercase tracking-widest opacity-50 hover:opacity-100 hover:bg-rose-500 dark:hover:bg-rose-600 px-2 py-1 rounded transition-all"><i className="fa-solid fa-xmark mr-1"></i>DROP</button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </div>
                </div>
              )}
            </div>
          </section>
        </div>

        {/* BOTTOM USER MANAGEMENT GRID (TABLE) */}
        <section className="bg-white dark:bg-[#08101f] rounded-sm shadow-lg dark:shadow-2xl border border-slate-200 dark:border-white/10 overflow-hidden relative transition-colors">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-600 to-rose-600"></div>
          
          <div className="px-8 py-5 border-b border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-[#050b14]/50 flex justify-between items-center transition-colors">
            <div>
              <h3 className="font-black tracking-[0.1em] text-slate-900 dark:text-white uppercase text-[14px] flex items-center gap-3">
                Organization Roster
                <span className="bg-rose-100 dark:bg-rose-500/10 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-500/20 text-[9px] px-2 py-0.5 rounded-sm">RESTRICTED ACCESS</span>
              </h3>
              <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">Role-Based Access Control</div>
            </div>
            <button onClick={() => openUserModal()} className="bg-slate-200 dark:bg-white/5 hover:bg-slate-300 dark:hover:bg-white/10 border border-slate-300 dark:border-white/20 text-slate-700 dark:text-white text-[11px] font-bold px-5 py-2 transition-colors uppercase tracking-widest flex items-center gap-2 rounded-sm">
              <i className="fa-solid fa-plus text-slate-500 dark:text-slate-400"></i> Provision Identity
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-max">
              <thead>
                <tr className="bg-slate-100 dark:bg-[#040810] text-[10px] font-black uppercase tracking-[0.15em] text-slate-500 border-b border-slate-200 dark:border-white/10 shadow-sm transition-colors">
                  <th className="px-8 py-4">User Handle (ID)</th>
                  <th className="px-8 py-4">Permission Node</th>
                  <th className="px-8 py-4">Hardware Binding</th>
                  <th className="px-8 py-4 text-right">Administrative Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-white/5 bg-white dark:bg-[#08101f] transition-colors">
                {usersLoading ? (
                  <tr><td colSpan="4" className="px-8 py-12 text-center text-[10px] uppercase tracking-widest font-bold text-slate-400 dark:text-slate-500 animate-pulse">Decrypting node arrays...</td></tr>
                ) : users.length === 0 ? (
                  <tr><td colSpan="4" className="px-8 py-12 text-center text-[10px] uppercase tracking-widest font-bold text-slate-400 dark:text-slate-500">No organizational arrays found.</td></tr>
                ) : users.map((u) => (
                  <tr key={u._id} className="hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-colors">
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-3">
                        <i className="fa-solid fa-user-astronaut text-slate-400 dark:text-slate-600 text-lg"></i>
                        <div>
                          <div className="font-bold text-sm text-slate-900 dark:text-white tracking-wide">{u.username}</div>
                          <div className="text-[10px] font-mono tracking-wider text-slate-400 dark:text-slate-500 mt-1 opacity-70 border border-slate-200 dark:border-white/10 px-1 py-0.5 inline-block">{u._id}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <span className={`px-3 py-1 text-[10px] font-black uppercase tracking-[0.15em] border rounded-sm ${
                        u.role === 'admin' ? 'bg-purple-100 dark:bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-200 dark:border-purple-500/30' :
                        u.role === 'operator' ? 'bg-sky-100 dark:bg-[#38bdf8]/10 text-sky-700 dark:text-[#38bdf8] border-sky-200 dark:border-[#38bdf8]/30' :
                        'bg-slate-100 dark:bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-500/30'
                      }`}>
                        {u.role === 'admin' && <i className="fa-solid fa-shield-halved mr-2"></i>}
                        {u.role}
                      </span>
                    </td>
                    <td className="px-8 py-5">
                      {u.busId ? (
                        <div className="text-[11px] font-mono font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-2">
                           <i className="fa-solid fa-link"></i> {u.busId}
                        </div>
                      ) : (
                        <div className="text-[11px] font-mono text-slate-400 dark:text-slate-600">UNBOUND</div>
                      )}
                    </td>
                    <td className="px-8 py-5 text-right space-x-3">
                      <button onClick={() => openUserModal(u)} className="bg-blue-50 dark:bg-blue-900/30 hover:bg-blue-100 dark:hover:bg-blue-800/60 border border-blue-200 dark:border-blue-500/50 text-blue-700 dark:text-blue-400 text-[10px] font-bold px-4 py-2 dark:hover:text-white transition-all uppercase tracking-widest rounded-sm">
                        <i className="fa-solid fa-wrench mr-2"></i>CONFIG
                      </button>
                      <button onClick={() => handleDeleteUser(u._id)} className="bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/80 border border-rose-200 dark:border-rose-500/50 text-rose-700 dark:text-rose-400 hover:text-rose-800 dark:hover:text-white text-[10px] font-bold px-4 py-2 transition-all uppercase tracking-widest rounded-sm">
                        <i className="fa-solid fa-skull mr-2"></i>PURGE
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="bg-slate-50 dark:bg-[#040810] px-8 py-4 border-t border-slate-200 dark:border-white/5 flex justify-between items-center transition-colors">
            <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
              <i className="fa-solid fa-layer-group"></i> Page <span className="text-slate-800 dark:text-white bg-slate-200 dark:bg-white/10 px-2 py-0.5">{userPage}</span> of {Math.max(1, totalPages)}
            </div>
            <div className="space-x-2">
              <button disabled={userPage <= 1} onClick={() => setUserPage(p => p - 1)} className="px-5 py-2 text-[10px] uppercase tracking-widest font-bold bg-white dark:bg-white/5 text-slate-600 dark:text-slate-400 border border-slate-300 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-white/10 disabled:opacity-30 disabled:hover:bg-white dark:disabled:hover:bg-transparent transition-colors rounded-sm">&lt; PREV</button>
              <button disabled={userPage >= totalPages} onClick={() => setUserPage(p => p + 1)} className="px-5 py-2 text-[10px] uppercase tracking-widest font-bold bg-white dark:bg-white/5 text-slate-600 dark:text-slate-400 border border-slate-300 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-white/10 disabled:opacity-30 disabled:hover:bg-white dark:disabled:hover:bg-transparent transition-colors rounded-sm">NEXT &gt;</button>
            </div>
          </div>
        </section>

      </main>

      {/* USER MUTATION MODAL OVERLAY */}
      <AnimatePresence>
        {userModal.open && (
          <div className="fixed inset-0 z-[200] bg-slate-900/50 dark:bg-[#020617]/80 backdrop-blur-md flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 10 }} className="bg-white dark:bg-[#0a0f1c] w-full max-w-sm rounded-sm border border-slate-200 dark:border-slate-700 shadow-2xl dark:shadow-[0_0_50px_rgba(0,0,0,0.5)] overflow-hidden relative">
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-400 to-blue-600"></div>
              
              <div className="p-6 border-b border-slate-100 dark:border-white/10 bg-slate-50 dark:bg-[#060a14]">
                <h4 className="font-black text-slate-900 dark:text-white uppercase tracking-widest text-[14px]">
                  {userModal.editingMap ? "Configure Identity" : "Provision Identity"}
                </h4>
                <p className="text-[10px] mt-1 font-bold tracking-widest text-slate-500 uppercase">Mutate matrix payloads over instance</p>
              </div>
              
              <div className="p-6 space-y-5">
                <div>
                  <label className="block text-[10px] font-black tracking-[0.15em] uppercase text-slate-600 dark:text-slate-400 mb-2">Handle</label>
                  <input className="w-full text-[13px] py-2.5 px-3 border border-slate-300 dark:border-white/10 bg-white dark:bg-[#0f172a] text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 font-bold transition-colors placeholder:text-slate-400 dark:placeholder:text-slate-600" value={userModal.username} onChange={e => setUserModal({...userModal, username: e.target.value})} placeholder="EXPLICIT IDENTIFIER" autoComplete="off" />
                </div>
                <div>
                  <label className="block text-[10px] font-black tracking-[0.15em] uppercase text-slate-600 dark:text-slate-400 mb-2">Encrypted Payload (Password)</label>
                  <input className="w-full text-[13px] py-2.5 px-3 border border-slate-300 dark:border-white/10 bg-white dark:bg-[#0f172a] text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 font-bold tracking-[0.2em] transition-colors placeholder:text-slate-400 dark:placeholder:text-slate-600 placeholder:tracking-normal" type="password" value={userModal.password} onChange={e => setUserModal({...userModal, password: e.target.value})} placeholder={userModal.editingMap ? "LEAVE EMPTY FOR PRESERVATION" : "••••••••"} autoComplete="new-password" />
                </div>
                <div>
                  <label className="block text-[10px] font-black tracking-[0.15em] uppercase text-slate-600 dark:text-slate-400 mb-2">Permission Tier</label>
                  <select className="w-full text-[11px] font-bold py-3 px-3 border border-slate-300 dark:border-white/10 bg-white dark:bg-[#0f172a] text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 uppercase tracking-widest transition-colors cursor-pointer" value={userModal.role} onChange={e => setUserModal({...userModal, role: e.target.value})}>
                    <option value="commuter">Commuter (Read-Only Matrix)</option>
                    <option value="operator">Operator (Telemetry Push)</option>
                    <option value="admin">Administrator (Full Orchestration)</option>
                  </select>
                </div>
                
                <AnimatePresence>
                  {userModal.role === 'operator' && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                      <label className="block text-[10px] font-black tracking-[0.15em] uppercase text-emerald-600 dark:text-emerald-500 mb-2 mt-2">Hardware ID Assignment (Bus ID)</label>
                      <input className="w-full text-[13px] py-2.5 px-3 border border-emerald-300 dark:border-emerald-500/50 bg-emerald-50 dark:bg-emerald-950/20 focus:outline-none focus:border-emerald-500 dark:focus:border-emerald-400 text-emerald-700 dark:text-emerald-400 font-bold uppercase transition-colors placeholder:text-emerald-300 dark:placeholder:text-emerald-900" value={userModal.busId || ''} onChange={e => setUserModal({...userModal, busId: e.target.value})} placeholder="E.G. BUS-101" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <div className="p-6 bg-slate-50 dark:bg-[#040810] border-t border-slate-200 dark:border-white/5 flex gap-4 justify-end transition-colors">
                <button className="px-6 py-2.5 text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 bg-transparent border border-slate-300 dark:border-white/20 hover:border-slate-400 dark:hover:border-white/40 hover:text-slate-800 dark:hover:text-white transition-all shadow-sm rounded-sm" onClick={() => setUserModal({...userModal, open: false})}>Abort</button>
                <button disabled={!userModal.username || (!userModal.editingMap && !userModal.password)} className="px-6 py-2.5 text-[10px] font-black uppercase tracking-widest text-white dark:text-blue-900 bg-blue-600 dark:bg-blue-500 hover:bg-blue-700 dark:hover:bg-blue-400 disabled:opacity-50 dark:disabled:opacity-30 dark:disabled:bg-blue-900 dark:disabled:text-blue-950 transition-all dark:shadow-[0_0_15px_rgba(59,130,246,0.4)] dark:hover:shadow-[0_0_20px_rgba(59,130,246,0.6)] rounded-sm" onClick={handleSaveUser}>Deploy Node</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
