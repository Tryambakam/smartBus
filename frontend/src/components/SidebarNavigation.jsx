import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useTranslation } from "react-i18next";
import SmartBusLogo from "./SmartBusLogo";

export default function SidebarNavigation() {
  const { user, role, logout } = useAuth();
  const location = useLocation();
  const { t } = useTranslation();

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
    <aside className="w-64 h-screen bg-slate-900 text-white flex flex-col p-5 shadow-xl select-none sticky top-0 hidden md:flex">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 flex items-center justify-center">
          <SmartBusLogo className="w-8 h-8 drop-shadow-md text-blue-400" />
        </div>
        <div className="text-xl font-bold bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">{t("app.name") || "SmartBus"}</div>
      </div>
      
      <div className="text-[10px] uppercase text-slate-500 font-bold tracking-widest mb-3">
        {role} Navigation
      </div>

      <nav className="flex-1 space-y-1.5">
        {links.map((link) => {
          const isActive = location.pathname.startsWith(link.path);
          return (
            <Link
              key={link.path}
              to={link.path}
              className={`block px-4 py-2.5 rounded-xl transition-colors font-medium text-sm ${
                isActive 
                  ? "bg-blue-600 text-white shadow-md shadow-blue-900/50 relative overflow-hidden"
                  : "text-slate-300 hover:bg-slate-800 hover:text-white"
              }`}
            >
              <div className={isActive ? "absolute left-0 top-0 bottom-0 w-1 bg-white opacity-90" : "hidden"} />
              {link.name}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-slate-800 pt-5 mt-auto">
        <div className="mb-4 px-2">
          <div className="text-sm font-semibold text-slate-100 truncate">{user.name || user.username || "Authorized User"}</div>
          <div className="text-xs text-slate-400 font-medium capitalize">{role || "Commuter"} tier</div>
        </div>
        <button 
          onClick={logout}
          className="w-full text-left px-4 py-2 text-rose-400 hover:bg-rose-500/10 hover:text-rose-300 rounded-xl transition-colors text-sm font-semibold flex items-center gap-2"
        >
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
}
