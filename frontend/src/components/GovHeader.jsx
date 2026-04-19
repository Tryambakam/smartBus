import { useTranslation } from "react-i18next";
import { Link, useNavigate } from "react-router-dom";
import {
  LogIn,
  LogOut,
  Sun,
  Moon,
  Globe,
  ChevronDown,
  Bell,
  Menu,
  CalendarClock
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
    <header className="sticky top-0 z-50 w-full bg-slate-50/90 dark:bg-[#070b14]/80 backdrop-blur-xl border-b border-slate-200/50 dark:border-blue-900/40 border-t-2 border-t-[#0a3161] dark:border-t-blue-500 shadow-sm dark:shadow-[0_4px_30px_rgba(0,0,0,0.5)] transition-colors duration-500" role="banner">
      <div className="max-w-[1600px] mx-auto px-4 h-16 flex items-center justify-between relative">
        
        {/* Premium Brand & Menu */}
        <div className="flex items-center gap-2 sm:gap-3">
          {isAuthed && (
            <button 
              onClick={() => window.dispatchEvent(new Event('smartbus:toggle-sidebar'))}
              className="p-2 -ml-2 text-gray-700 hover:text-[#0a3161] dark:text-gray-300 dark:hover:text-white bg-transparent hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors focus:outline-none"
              title="Toggle Navigation Menu"
            >
              <Menu size={22} strokeWidth={2.5} />
            </button>
          )}
          <div className={`w-11 h-11 flex items-center justify-center ${!isAuthed ? '-ml-1' : ''}`}>
            <SmartBusLogo className="w-12 h-12 drop-shadow-md transition-transform hover:scale-105 duration-300" />
          </div>
          <div className="flex flex-col justify-center select-none pt-1">
            <div className="relative flex items-center text-[#06335e] dark:text-white leading-none">
              <span className="font-black text-[27px] tracking-tight">smart</span>
              <div className="relative">
                <span className="font-medium text-[27px] tracking-tight ml-[1px] opacity-95">Bus</span>
                <svg className="absolute -left-[12px] bottom-[3px] w-6 h-3.5" viewBox="0 0 24 16" fill="none">
                  <path d="M 0,0 C 8,14 16,14 20,4" stroke="#00b4d8" strokeWidth="2.5" strokeLinecap="round" />
                  <circle cx="21" cy="2.5" r="2.5" fill="#00b4d8" filter="drop-shadow(0 0 2px #00b4d8)" />
                </svg>
              </div>
            </div>
            <div className="text-[7.5px] font-black tracking-[0.2em] text-[#0a3161]/80 dark:text-cyan-400/80 uppercase mt-0.5 text-center w-full flex items-center justify-center gap-1.5">
              <div className="w-1 h-1 rounded-full bg-[#0a3161] dark:bg-cyan-400 animate-pulse"></div>
              Real-Time Tracking
            </div>
          </div>
        </div>

        {/* Navigation Core Features */}
        <nav className="hidden lg:flex items-center gap-5 xl:gap-8 absolute left-1/2 -translate-x-1/2">
          <Link to="/timetable" className="group flex flex-col items-center gap-1 text-[#0a3161] hover:text-[#005ea2] dark:text-slate-300 dark:hover:text-cyan-400 transition-colors">
            <CalendarClock size={18} strokeWidth={2} className="group-hover:-translate-y-0.5 transition-transform opacity-80 group-hover:opacity-100" />
            <span className="text-[9px] font-black uppercase tracking-widest">Bus Timetable</span>
          </Link>
        </nav>

        {/* Action Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          
          {/* Helpline Indicator */}
          <div className="hidden lg:flex items-center gap-2 text-[#0a3161] dark:text-[#a5f3fc] font-black text-[10px] bg-[#eff6ff] dark:bg-cyan-900/20 border border-[#bfdbfe] dark:border-cyan-800/50 px-3 py-1.5 shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)] uppercase tracking-widest rounded-sm">
            <i className="fa-solid fa-phone text-[9px]"></i>
            <span>Helpline: 1073</span>
          </div>

          {/* Notifications Bell */}
          <button
            onClick={onOpenNotices}
            className="relative p-2 text-gray-600 hover:text-[#0a3161] dark:text-gray-300 dark:hover:text-cyan-400 bg-gray-50/50 hover:bg-gray-100 dark:bg-[#0b1221]/50 dark:hover:bg-[#0f172a] border border-gray-300/50 dark:border-blue-900/50 rounded transition-colors focus:outline-none backdrop-blur-md"
            title="Public Notices"
          >
            <Bell size={18} strokeWidth={2.5} />
            {unreadNoticesCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-rose-500 rounded-full border-2 border-white dark:border-[#000000] animate-pulse"></span>
            )}
          </button>

          {/* Language Matrix Dropdown */}
          <div className="relative group" title="Select Language">
            <button className="flex items-center hover:bg-gray-100 dark:hover:bg-gray-800 border border-transparent hover:border-gray-300 dark:hover:border-gray-700 px-3 py-1.5 rounded transition-all font-medium text-sm text-gray-700 dark:text-gray-300 cursor-pointer outline-none">
              <Globe size={16} className="mr-2 text-slate-500 dark:text-slate-400 group-hover:text-[#1E3A8A] transition-colors" />
              <span className="font-bold uppercase pr-1">{i18n.language.split('-')[0]}</span>
              <ChevronDown size={14} className="opacity-50 group-hover:opacity-100 transition-opacity" />
            </button>
            
            {/* Custom Floating Menu */}
            <div className="absolute top-full right-0 mt-2 w-36 bg-white dark:bg-[#111318] border border-gray-300 dark:border-gray-800 rounded shadow-sm opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
              <div className="py-1.5 flex flex-col items-center">
                {['en', 'hi', 'pa'].map((lang) => (
                  <button 
                    key={lang}
                    onClick={() => setLang(lang)}
                    className={`w-full text-left px-4 py-2.5 text-[13px] font-[600] transition-colors hover:bg-slate-50 dark:hover:bg-slate-800 ${i18n.language.split('-')[0] === lang ? 'text-[#1E3A8A] dark:text-[#4CA6FF] bg-blue-50/50 dark:bg-blue-900/10' : 'text-slate-600 dark:text-slate-300'}`}
                  >
                    {lang === 'en' ? 'English (EN)' : lang === 'hi' ? 'Hindi (HI)' : 'Punjabi (PA)'}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="w-px h-6 bg-slate-200 dark:bg-slate-700 mx-1 hidden sm:block"></div>

          {/* Theme Toggle */}
          <button 
            className="flex items-center gap-2 hover:bg-slate-200/50 dark:hover:bg-blue-900/20 border border-transparent hover:border-slate-300 dark:hover:border-blue-800/50 px-3 py-1.5 rounded transition-all font-bold tracking-widest uppercase text-[10px] text-slate-700 dark:text-slate-300"
            onClick={onToggleTheme} 
            aria-label="Toggle theme"
          >
            {themeLabel === "night" ? <Moon size={14} className="text-cyan-400 drop-shadow-[0_0_2px_rgba(34,211,238,0.8)]" /> : <Sun size={14} className="text-amber-500 drop-shadow-[0_0_2px_rgba(245,158,11,0.5)]" />}
            <span className="hidden sm:inline-block">{themeLabel === "night" ? t("app.night") : t("app.day")}</span>
          </button>

          {/* Auth Controls */}
          {isAuthed ? (
            <>
              <button
                className="flex items-center gap-2 text-rose-600 hover:text-white dark:text-rose-400 dark:hover:text-white bg-transparent hover:bg-rose-600 dark:hover:bg-rose-500 border border-transparent hover:border-rose-600 dark:hover:border-rose-500 px-3 py-1.5 rounded-sm transition-colors font-bold tracking-widest uppercase text-[10px]"
                onClick={async () => {
                  await logout();
                  nav("/welcome");
                }}
              >
                <LogOut size={14} />
                <span className="hidden sm:inline-block">Logout</span>
              </button>
            </>
          ) : (
            <Link 
              className="flex items-center gap-2 bg-[#005ea2] hover:bg-[#1a4480] dark:bg-blue-600 dark:hover:bg-blue-500 !text-white px-5 py-2 rounded shadow border border-[#005ea2] dark:border-blue-600 transition-all font-black tracking-widest uppercase text-[11px] ml-2" 
              to="/login"
            >
              <LogIn size={14} strokeWidth={2.5} />
              <span className="hidden sm:inline-block">{t("app.login")}</span>
            </Link>
          )}
        </div>
        
      </div>
    </header>
  );
}
