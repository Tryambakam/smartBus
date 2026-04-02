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
  const [userModal, setUserModal] = useState({ open: false, editingMap: null, username: "", password: "", role: "commuter" });

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
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 pb-12 transition-colors">
      <GovHeader lastSyncText="Admin Console" backendOk={true} onToggleTheme={toggleTheme} themeLabel={theme === "dark" ? "night" : "day"} />
      
      <div className="bg-slate-800 text-white text-sm font-semibold tracking-wider px-6 py-2.5 shadow border-b border-slate-700">
        🛡 AUTHORITY PANEL — MANAGE DOMAINS AND INFRASTRUCTURE ORCHESTRATION
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        
        {/* Error Banners */}
        {error && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6 p-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl shadow-sm text-sm font-bold flex justify-between items-center">
            {error}
            <button onClick={() => setError("")} className="text-2xl leading-none">&times;</button>
          </motion.div>
        )}

        {/* TOP INFRASTRUCTURE GRID (ROUTES & STOPS) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          
          {/* Routes Pane */}
          <section className="bg-white dark:bg-[#111111] rounded-none shadow-none border border-gray-300 dark:border-gray-700 border-t-2 border-t-[#0a3161] overflow-hidden col-span-1">
            <div className="px-6 py-4 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700">
              <h3 className="font-bold tracking-tight text-slate-800 dark:text-white">Transit Routes</h3>
              <div className="text-xs text-slate-500 font-medium tracking-tight">System Path Networks</div>
            </div>
            <div className="p-5">
              <div className="space-y-3 mb-5">
                <input className="w-full text-sm py-2 px-3 border border-gray-300 dark:border-gray-700 rounded-none bg-white dark:bg-[#1a1d24] dark:text-white outline-none focus:border-[#0a3161] transition-colors" placeholder="Route ID (e.g. R-101)" value={newRouteId} onChange={(e) => setNewRouteId(e.target.value)} />
                <input className="w-full text-sm py-2 px-3 border border-gray-300 dark:border-gray-700 rounded-none bg-white dark:bg-[#1a1d24] dark:text-white outline-none focus:border-[#0a3161] transition-colors" placeholder="Route Name" value={newRouteName} onChange={(e) => setNewRouteName(e.target.value)} />
                <button className="w-full bg-[#0a3161] hover:bg-[#072448] text-white font-semibold py-2 rounded-none text-sm transition-colors border border-[#0a3161]" onClick={handleCreateRoute}>Initialize Route</button>
              </div>

              <div className="border-t border-slate-100 dark:border-slate-700 pt-4">
                {routesLoading ? <div className="text-sm font-bold animate-pulse text-slate-400">Loading pipelines...</div> : (
                  <div className="flex flex-col gap-2 max-h-64 overflow-y-auto pr-1">
                    {routes.map(r => (
                      <div key={r.routeId} onClick={() => setSelectedRoute(r)} className={`p-3 rounded-sm border cursor-pointer transition-all flex justify-between items-center ${selectedRoute?.routeId === r.routeId ? "bg-blue-50 border-blue-300 dark:bg-[#1a1d24] dark:border-blue-500" : "bg-white dark:bg-[#111111] border-gray-200 dark:border-gray-800 hover:border-gray-400"}`}>
                        <div>
                          <div className="text-sm font-bold text-slate-900 dark:text-white">{r.routeId}</div>
                          <div className="text-[11px] text-slate-500 leading-tight mt-0.5">{r.name}</div>
                        </div>
                        <button onClick={(e) => { e.stopPropagation(); handleDeleteRoute(r.routeId); }} className="text-rose-500 hover:text-rose-600 font-bold text-[10px] uppercase bg-rose-50 dark:bg-rose-900/30 px-2 py-1 rounded">Del</button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </section>

          {/* Stops Pane */}
          <section className="bg-white dark:bg-[#111111] rounded-none shadow-none border border-gray-300 dark:border-gray-700 border-t-2 border-t-[#0a3161] overflow-hidden col-span-2">
            <div className="px-6 py-4 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700">
              <h3 className="font-bold tracking-tight text-slate-800 dark:text-white">Waypoints {selectedRoute ? `[ ${selectedRoute.routeId} ]` : ""}</h3>
              <div className="text-xs text-slate-500 font-medium tracking-tight">Geo-Coordinate Matrices</div>
            </div>
            
            <div className="p-5">
              {!selectedRoute ? <div className="text-sm font-bold text-slate-400 flex items-center justify-center p-12 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-2xl">Select a primary Route to manage Waypoints</div> : (
                <div className="flex flex-col h-full">
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-4">
                    <input className="text-sm py-2 px-3 border border-gray-300 dark:border-gray-700 rounded-none bg-white dark:bg-[#1a1d24] dark:text-white outline-none focus:border-[#0a3161]" placeholder="Stop ID" value={newStop.stopId} onChange={e => setNewStop(v => ({ ...v, stopId: e.target.value }))} />
                    <input className="text-sm py-2 px-3 border border-gray-300 dark:border-gray-700 rounded-none bg-white dark:bg-[#1a1d24] dark:text-white outline-none focus:border-[#0a3161]" placeholder="Name (EN)" value={newStop.name_en} onChange={e => setNewStop(v => ({ ...v, name_en: e.target.value }))} />
                    <input className="text-sm py-2 px-3 border border-gray-300 dark:border-gray-700 rounded-none bg-white dark:bg-[#1a1d24] dark:text-white outline-none focus:border-[#0a3161]" placeholder="Lat" value={newStop.lat} onChange={e => setNewStop(v => ({ ...v, lat: e.target.value }))} />
                    <input className="text-sm py-2 px-3 border border-gray-300 dark:border-gray-700 rounded-none bg-white dark:bg-[#1a1d24] dark:text-white outline-none focus:border-[#0a3161]" placeholder="Lng" value={newStop.lng} onChange={e => setNewStop(v => ({ ...v, lng: e.target.value }))} />
                    <input className="text-sm py-2 px-3 border border-gray-300 dark:border-gray-700 rounded-none bg-white dark:bg-[#1a1d24] dark:text-white outline-none focus:border-[#0a3161]" placeholder="Seq" value={newStop.sequence} onChange={e => setNewStop(v => ({ ...v, sequence: e.target.value }))} />
                  </div>
                  
                  <button className="bg-emerald-700 hover:bg-emerald-800 text-white font-semibold py-2.5 rounded-none text-sm transition-colors mb-5 border border-emerald-700" onClick={handleCreateStop}>Append Waypoint</button>
                  
                  <div className="border-t border-slate-100 dark:border-slate-700 pt-4 flex-1">
                    {stopsLoading ? <div className="text-sm font-bold animate-pulse text-slate-400">Syncing telemetry arrays...</div> : (
                      <div className="flex flex-col gap-2 max-h-56 overflow-y-auto">
                        {stops.map((s) => (
                          <div key={s.stopId} className="flex justify-between items-center bg-gray-50 dark:bg-[#1a1d24] border border-gray-200 dark:border-gray-800 p-3 rounded-sm hover:border-emerald-500 transition-colors">
                            <div className="flex items-center gap-4">
                              <span className="bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-400 font-bold text-xs px-2 py-1 rounded">SEQ {s.sequence}</span>
                              <div>
                                <div className="text-sm font-bold dark:text-white">{s.stopId}</div>
                                <div className="text-[11px] text-slate-500 font-medium">({s.lat}, {s.lng}) - {s.name_en}</div>
                              </div>
                            </div>
                            <button onClick={() => handleDeleteStop(s.stopId)} className="text-rose-500 hover:text-white hover:bg-rose-500 font-bold text-[10px] uppercase bg-rose-50 dark:bg-rose-900/30 px-3 py-1.5 rounded transition-colors">Scrub</button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </section>
        </div>

        {/* BOTTOM USER MANAGEMENT GRID (TABLE) */}
        <section className="bg-white dark:bg-[#111111] rounded-none shadow-none border border-gray-300 dark:border-gray-700 border-t-2 border-t-[#0a3161] overflow-hidden">
          <div className="px-6 py-4 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center">
            <div>
              <h3 className="font-bold tracking-tight text-slate-800 dark:text-white">Organization Roster</h3>
              <div className="text-[11px] text-slate-500 font-black uppercase tracking-widest mt-0.5">Role-Based Access Control</div>
            </div>
            <button onClick={() => openUserModal()} className="bg-[#0a3161] hover:bg-[#072448] border border-[#0a3161] text-white text-sm font-bold px-4 py-2 rounded-sm transition-colors">
              + Provision Identity
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-100/50 dark:bg-slate-900/30 text-[10px] font-black uppercase tracking-widest text-slate-400 border-b border-slate-200 dark:border-slate-700">
                  <th className="px-6 py-3">User Handle (ID)</th>
                  <th className="px-6 py-3">Permission Node</th>
                  <th className="px-6 py-3 text-right">Administrative Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {usersLoading ? (
                  <tr><td colSpan="3" className="px-6 py-8 text-center text-sm font-bold text-slate-400 animate-pulse">Decrypting node arrays...</td></tr>
                ) : users.length === 0 ? (
                  <tr><td colSpan="3" className="px-6 py-8 text-center text-sm font-bold text-slate-400">No organizational arrays found.</td></tr>
                ) : users.map((u) => (
                  <tr key={u._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/20 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-bold text-sm text-slate-900 dark:text-white">{u.username}</div>
                      <div className="text-[10px] font-medium tracking-tight text-slate-400">{u._id}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 text-[10px] font-black uppercase tracking-widest rounded shadow-sm ${
                        u.role === 'admin' ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800' :
                        u.role === 'operator' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800' :
                        'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 border border-slate-200 dark:border-slate-700'
                      }`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right flex justify-end gap-2 text-sm font-medium">
                      <button onClick={() => openUserModal(u)} className="bg-[#0a3161] hover:bg-[#072448] text-white text-xs font-bold px-3 py-1.5 rounded-none transition-colors uppercase tracking-widest border border-[#0a3161]">
                        Config
                      </button>
                      <button onClick={() => handleDeleteUser(u._id)} className="bg-rose-700 hover:bg-rose-800 text-white text-xs font-bold px-3 py-1.5 rounded-none transition-colors uppercase tracking-widest border border-rose-700">
                        Purge
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="bg-slate-50 dark:bg-slate-800/50 px-6 py-3 border-t border-slate-200 dark:border-slate-700 flex justify-between items-center">
            <div className="text-xs font-semibold text-slate-500">Node Page <span className="font-black text-slate-700 dark:text-slate-300">{userPage}</span> out of {Math.max(1, totalPages)}</div>
            <div className="space-x-2">
              <button disabled={userPage <= 1} onClick={() => setUserPage(p => p - 1)} className="px-4 py-1.5 text-sm font-bold bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-600 rounded-lg shadow-sm disabled:opacity-50 transition-colors">Prev</button>
              <button disabled={userPage >= totalPages} onClick={() => setUserPage(p => p + 1)} className="px-4 py-1.5 text-sm font-bold bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-600 rounded-lg shadow-sm disabled:opacity-50 transition-colors">Next</button>
            </div>
          </div>
        </section>

      </main>

      {/* USER MUTATION MODAL OVERLAY */}
      {userModal.open && (
        <div className="fixed inset-0 z-[200] bg-slate-900/40 dark:bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white dark:bg-[#111111] w-full max-w-sm rounded-none border border-gray-300 dark:border-gray-700 border-t-4 border-t-[#0a3161] shadow-none overflow-hidden">
            <div className="p-5 border-b border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60">
              <h4 className="font-bold text-slate-900 dark:text-white">{userModal.editingMap ? "Configure Identity" : "Provision Identity"}</h4>
              <p className="text-xs font-medium text-slate-500">Mutate matrix payloads directly over the MongoDB instance</p>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-[11px] font-black tracking-widest uppercase text-slate-500 dark:text-slate-400 mb-1">Handle</label>
                <input className="w-full text-sm py-2 px-3 border border-gray-300 dark:border-gray-700 rounded-none bg-white dark:bg-[#1a1d24] dark:text-white focus:outline-none focus:border-[#0a3161]" value={userModal.username} onChange={e => setUserModal({...userModal, username: e.target.value})} placeholder="Explicit identifier" autoComplete="off" />
              </div>
              <div>
                <label className="block text-[11px] font-black tracking-widest uppercase text-slate-500 dark:text-slate-400 mb-1">Encrypted Payload (Password)</label>
                <input className="w-full text-sm py-2 px-3 border border-gray-300 dark:border-gray-700 rounded-none bg-white dark:bg-[#1a1d24] dark:text-white focus:outline-none focus:border-[#0a3161]" type="password" value={userModal.password} onChange={e => setUserModal({...userModal, password: e.target.value})} placeholder={userModal.editingMap ? "Leave empty to preserve signature" : "••••••••"} autoComplete="new-password" />
              </div>
              <div>
                <label className="block text-[11px] font-black tracking-widest uppercase text-slate-500 dark:text-slate-400 mb-1">Permission Tier</label>
                <select className="w-full text-sm py-2 px-3 border border-gray-300 dark:border-gray-700 rounded-none bg-white dark:bg-[#1a1d24] dark:text-white focus:outline-none focus:border-[#0a3161]" value={userModal.role} onChange={e => setUserModal({...userModal, role: e.target.value})}>
                  <option value="commuter">Commuter (Read-Only Matrix)</option>
                  <option value="operator">Operator (Telemetry Push)</option>
                  <option value="admin">Administrator (Full Orchestration)</option>
                </select>
              </div>
              
              <AnimatePresence>
                {userModal.role === 'operator' && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                    <label className="block text-[11px] font-black tracking-widest uppercase text-slate-500 dark:text-slate-400 mb-1 mt-1">Hardware ID Assigment (Bus ID)</label>
                    <input className="w-full text-sm py-2 px-3 border border-gray-300 dark:border-emerald-800 rounded-none bg-emerald-50 dark:bg-emerald-900/10 focus:outline-none focus:border-emerald-600 text-emerald-900 dark:text-emerald-300 font-bold" value={userModal.busId || ''} onChange={e => setUserModal({...userModal, busId: e.target.value})} placeholder="e.g. BUS-101" />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="p-5 bg-gray-50 dark:bg-[#1a1d24] border-t border-gray-200 dark:border-gray-700 flex gap-3 justify-end">
              <button className="px-5 py-2 text-sm font-bold text-gray-700 dark:text-gray-300 bg-white dark:bg-[#111111] border border-gray-300 dark:border-gray-600 rounded-none hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors" onClick={() => setUserModal({...userModal, open: false})}>Abort</button>
              <button disabled={!userModal.username || (!userModal.editingMap && !userModal.password)} className="px-5 py-2 text-sm font-bold text-white bg-[#0a3161] hover:bg-[#072448] disabled:opacity-50 disabled:cursor-not-allowed rounded-none border border-[#0a3161] transition-colors" onClick={handleSaveUser}>Deploy Node</button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
