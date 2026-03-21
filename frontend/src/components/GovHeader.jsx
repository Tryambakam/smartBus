import { useTranslation } from "react-i18next";
import { Link, useNavigate } from "react-router-dom";
import {
  Bus,
  LogIn,
  LogOut,
  Sun,
  Moon,
  Globe,
  ChevronDown,
  Bell
} from "lucide-react";
import SmartBusLogo from "./SmartBusLogo";
import { useAuth } from "../contexts/AuthContext";

export default function GovHeader({
  lastSyncText,
  backendOk,
  onToggleTheme = () => {},
  themeLabel = "day",
  unreadNoticesCount = 0,
  onOpenNotices = () => {}
}) {
  const { t, i18n } = useTranslation();
  const nav = useNavigate();
  const { user, logout } = useAuth();
  const isAuthed = Boolean(user);

  const setLang = (lng) => i18n.changeLanguage(lng);

  return (
    <header className="sticky top-0 z-50 w-full backdrop-blur-xl bg-white/80 dark:bg-[#0B1E33]/80 border-b border-slate-200 dark:border-white/10 shadow-sm transition-colors duration-300" role="banner">
      <div className="max-w-[1600px] mx-auto px-4 h-16 flex items-center justify-between">
        
        {/* Premium Brand */}
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 flex items-center justify-center -ml-1">
            <SmartBusLogo className="w-12 h-12 drop-shadow-md transition-transform hover:scale-105 duration-300" />
          </div>
          <div className="flex flex-col">
            <div className="text-[10px] font-bold tracking-widest text-slate-500 dark:text-slate-400 uppercase leading-none mb-1">
              {t("app.dept")}
            </div>
            <div className="text-xl font-extrabold tracking-tight leading-none bg-gradient-to-r from-slate-800 to-slate-600 dark:from-white dark:to-slate-300 bg-clip-text text-transparent flex items-center gap-2">
              <span>{t("app.name")}</span>
              <span className="text-sm font-medium text-slate-400 dark:text-slate-500 tracking-normal hidden sm:inline-block">— {t("app.tagline")}</span>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          
          {/* Notifications Bell */}
          <button
            onClick={onOpenNotices}
            className="relative p-2 text-slate-500 hover:text-[#0b4ea2] dark:text-slate-400 dark:hover:text-blue-400 bg-slate-50/50 hover:bg-slate-100 dark:bg-slate-800/50 dark:hover:bg-slate-800 border border-transparent hover:border-slate-200 dark:hover:border-slate-700 rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#0b4ea2]/50"
            title="Public Notices"
          >
            <Bell size={20} strokeWidth={2.5} />
            {unreadNoticesCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-rose-500 rounded-full border-2 border-white dark:border-[#0B1E33] animate-pulse"></span>
            )}
          </button>

          {/* Language Component */}
          <div className="relative flex items-center hover:bg-slate-100 dark:hover:bg-slate-800 border border-transparent hover:border-slate-200 dark:hover:border-slate-700 px-3 py-1.5 rounded-xl transition-all font-medium text-sm text-slate-700 dark:text-slate-300 group cursor-pointer" title="Select Language">
            <Globe size={16} className="mr-2 text-slate-500 dark:text-slate-400 group-hover:text-blue-500 transition-colors" />
            <select 
              className="bg-transparent font-bold outline-none cursor-pointer appearance-none pr-4 uppercase"
              value={i18n.language.split('-')[0]}
              onChange={(e) => setLang(e.target.value)}
            >
              <option value="en" className="text-slate-800 dark:text-slate-800">EN</option>
              <option value="hi" className="text-slate-800 dark:text-slate-800">HI</option>
              <option value="pa" className="text-slate-800 dark:text-slate-800">PA</option>
            </select>
            <ChevronDown size={14} className="absolute right-2 opacity-50 group-hover:opacity-100 transition-opacity pointer-events-none" />
          </div>

          <div className="w-px h-6 bg-slate-200 dark:bg-slate-700 mx-1 hidden sm:block"></div>

          {/* Theme Toggle */}
          <button 
            className="flex items-center gap-2 hover:bg-slate-100 dark:hover:bg-slate-800 px-3 py-2 rounded-xl transition-all font-medium text-sm text-slate-700 dark:text-slate-300"
            onClick={onToggleTheme} 
            aria-label="Toggle theme"
          >
            {themeLabel === "night" ? <Moon size={18} className="text-blue-400" /> : <Sun size={18} className="text-amber-500" />}
            <span className="hidden sm:inline-block">{themeLabel === "night" ? t("app.night") : t("app.day")}</span>
          </button>

          {/* Auth Controls */}
          {isAuthed ? (
            <>
              <Link className="flex items-center gap-2 hover:bg-blue-50 dark:hover:bg-blue-900/40 text-blue-700 dark:text-blue-300 px-3 py-2 rounded-xl transition-all font-semibold text-sm border border-transparent hover:border-blue-200 dark:hover:border-blue-800" to="/operator">
                <Bus size={18} />
                <span className="hidden sm:inline-block">Operator</span>
              </Link>
              <button
                className="flex items-center gap-2 hover:bg-rose-50 dark:hover:bg-rose-900/40 text-rose-600 dark:text-rose-400 px-3 py-2 rounded-xl transition-all font-semibold text-sm border border-transparent hover:border-rose-200 dark:hover:border-rose-800"
                onClick={async () => {
                  await logout();
                  nav("/welcome");
                }}
              >
                <LogOut size={18} />
                <span className="hidden sm:inline-block">Logout</span>
              </button>
            </>
          ) : (
            <Link className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl transition-all font-semibold text-sm shadow-md shadow-blue-600/20 hover:shadow-lg hover:-translate-y-0.5" to="/login">
              <LogIn size={18} />
              <span className="hidden sm:inline-block">{t("app.login")}</span>
            </Link>
          )}
        </div>
        
      </div>
    </header>
  );
}
