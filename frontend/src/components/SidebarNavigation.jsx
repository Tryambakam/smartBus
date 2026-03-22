import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useState, useEffect } from "react";
import { X } from "lucide-react";

export default function SidebarNavigation() {
  const { user, role, logout } = useAuth();
  const location = useLocation();

  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const handler = () => setIsOpen((prev) => !prev);
    window.addEventListener("smartbus:toggle-sidebar", handler);
    return () => window.removeEventListener("smartbus:toggle-sidebar", handler);
  }, []);

  // Close sidebar on navigation bounds
  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname]);

  if (!user) return null;

  const getNavLinks = () => {
    switch (role) {
      case "admin":
        return [
          { name: "Admin Dashboard", path: "/dashboard" },
          { name: "Live System Logs", path: "/admin/logs" }
        ];
      case "operator":
        return [
          { name: "Operator Console", path: "/dashboard" },
          { name: "Trip Analytics", path: "/operator/telemetry" },
        ];
      case "commuter":
      default:
        return [
          { name: "Public Dashboard", path: "/dashboard" },
          { name: "Universal Alerts", path: "/alerts" }
        ];
    }
  };

  const links = getNavLinks();

  return (
    <>
      {/* Backdrop Overlay */}
      <div 
        className={`fixed inset-0 bg-black/30 dark:bg-[#000000]/60 backdrop-blur-sm z-[90] transition-opacity duration-300 ${isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}
        onClick={() => setIsOpen(false)}
        aria-hidden="true"
      />

      {/* Slide-over Drawer */}
      <aside 
        className={`fixed inset-y-0 left-0 z-[100] w-[280px] bg-white/95 dark:bg-[#1C1C1E]/95 backdrop-blur-3xl text-slate-900 dark:text-slate-100 flex flex-col p-6 shadow-apple-float select-none transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${isOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        <div className="flex items-center justify-between mb-8">
          <div className="text-[12px] uppercase text-blue-600 dark:text-blue-400 font-[800] tracking-widest pl-1 bg-blue-50 dark:bg-blue-500/10 px-3 py-1.5 rounded-full inline-block">
            {role} Interface
          </div>
          <button 
            onClick={() => setIsOpen(false)}
            className="p-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-white/10 dark:hover:bg-white/20 rounded-full transition-colors text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white focus:outline-none"
          >
            <X size={18} strokeWidth={2.5} />
          </button>
        </div>

        <nav className="flex-1 space-y-2">
          {links.map((link) => {
            const isActive = location.pathname.startsWith(link.path);
            return (
              <Link
                key={link.path}
                to={link.path}
                className={`block px-5 py-3 rounded-[16px] transition-all duration-300 font-[600] text-[15px] ${
                  isActive 
                    ? "bg-blue-600 text-white shadow-md shadow-blue-600/20"
                    : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 active:scale-95"
                }`}
              >
                {link.name}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-black/5 dark:border-white/5 pt-6 mt-auto">
          <div className="mb-5 px-3 bg-slate-50 dark:bg-white/5 rounded-2xl p-4 border border-black-[0.02] dark:border-white/5">
            <div className="text-[14px] font-[800] text-slate-800 dark:text-slate-200 truncate">{user.name || user.username || "Authorized User"}</div>
            <div className="text-[12px] text-slate-500 dark:text-slate-400 font-[600] mt-0.5 max-w-full truncate">{user.busId ? `Assigned to ${user.busId}` : `System ${role} protocol`}</div>
          </div>
          <button 
            onClick={logout}
            className="w-full text-center px-4 py-3 text-white bg-slate-900 hover:bg-slate-800 dark:bg-white/10 dark:hover:bg-white/20 rounded-[16px] transition-all text-sm font-[700] shadow-sm active:scale-95"
          >
            End Secure Session
          </button>
        </div>
      </aside>
    </>
  );
}
