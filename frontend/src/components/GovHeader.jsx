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
  Menu
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
    <header className="sticky top-0 z-50 w-full backdrop-blur-3xl bg-white/60 dark:bg-[#000000]/60 border-b border-black-[0.02] dark:border-white/5 transition-colors duration-500" role="banner">
      <div className="max-w-[1600px] mx-auto px-4 h-16 flex items-center justify-between">
        
        {/* Premium Brand & Menu */}
        <div className="flex items-center gap-2 sm:gap-3">
          {isAuthed && (
            <button 
              onClick={() => window.dispatchEvent(new Event('smartbus:toggle-sidebar'))}
              className="p-2 -ml-2 text-slate-600 hover:text-blue-600 dark:text-slate-300 dark:hover:text-blue-400 bg-transparent hover:bg-black/5 dark:hover:bg-white/5 rounded-full transition-colors focus:outline-none"
              title="Toggle Navigation Menu"
            >
              <Menu size={22} strokeWidth={2.5} />
            </button>
          )}
          <div className={`w-11 h-11 flex items-center justify-center ${!isAuthed ? '-ml-1' : ''}`}>
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
            className="relative p-2 text-slate-600 hover:text-blue-500 dark:text-slate-300 dark:hover:text-blue-400 bg-black/5 hover:bg-black/10 dark:bg-white/5 dark:hover:bg-white/10 border border-transparent rounded-full transition-all duration-200 focus:outline-none"
            title="Public Notices"
          >
            <Bell size={18} strokeWidth={2.5} />
            {unreadNoticesCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-rose-500 rounded-full border-2 border-white dark:border-[#000000] animate-pulse"></span>
            )}
          </button>

          {/* Language Matrix Dropdown */}
          <div className="relative group" title="Select Language">
            <button className="flex items-center hover:bg-slate-100 dark:hover:bg-slate-800 border border-transparent hover:border-slate-200 dark:hover:border-slate-700 px-3 py-1.5 rounded-xl transition-all font-medium text-sm text-slate-700 dark:text-slate-300 cursor-pointer outline-none">
              <Globe size={16} className="mr-2 text-slate-500 dark:text-slate-400 group-hover:text-[#1E3A8A] transition-colors" />
              <span className="font-bold uppercase pr-1">{i18n.language.split('-')[0]}</span>
              <ChevronDown size={14} className="opacity-50 group-hover:opacity-100 transition-opacity" />
            </button>
            
            {/* Custom Floating Menu */}
            <div className="absolute top-full right-0 mt-2 w-36 bg-white dark:bg-[#1C1C1E] border border-slate-200 dark:border-slate-800 rounded-xl shadow-[0_4px_24px_rgba(0,0,0,0.06)] dark:shadow-[0_4px_24px_rgba(0,0,0,0.4)] opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 transform origin-top-right translate-y-2 group-hover:translate-y-0 z-50">
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
            className="flex items-center gap-2 hover:bg-black/5 dark:hover:bg-white/5 px-3 py-2 rounded-full transition-all font-[500] text-[13px] text-slate-700 dark:text-slate-300"
            onClick={onToggleTheme} 
            aria-label="Toggle theme"
          >
            {themeLabel === "night" ? <Moon size={18} className="text-blue-400" /> : <Sun size={18} className="text-amber-500" />}
            <span className="hidden sm:inline-block">{themeLabel === "night" ? t("app.night") : t("app.day")}</span>
          </button>

          {/* Auth Controls */}
          {isAuthed ? (
            <>
              <button
                className="flex items-center gap-2 hover:bg-rose-50 dark:hover:bg-rose-500/10 text-rose-500 dark:text-rose-400 px-3 py-2 rounded-full transition-all font-[600] text-[13px]"
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
            <Link 
              className="flex items-center gap-2 bg-[#0a3161] hover:bg-[#072448] text-white px-5 py-2 rounded transition-colors font-semibold text-[13px] ml-2" 
              to="/login"
            >
              <LogIn size={16} strokeWidth={2.5} />
              <span className="hidden sm:inline-block">{t("app.login")}</span>
            </Link>
          )}
        </div>
        
      </div>
    </header>
  );
}
