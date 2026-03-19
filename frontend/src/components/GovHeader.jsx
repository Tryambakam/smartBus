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
} from "lucide-react";
import { clearSession, getAuthToken } from "../api";

export default function GovHeader({
  lastSyncText,
  backendOk,
  onToggleTheme = () => {},
  themeLabel = "day",
}) {
  const { t, i18n } = useTranslation();
  const nav = useNavigate();
  const isAuthed = Boolean(getAuthToken());

  const setLang = (lng) => i18n.changeLanguage(lng);

  return (
    <header className="gov-header" role="banner">
      <div className="gov-header-row">
        {/* Brand */}
        <div className="gov-brand" aria-label="smartBus brand">
          <div className="gov-logo" aria-hidden="true">
            <Bus size={22} />
          </div>

          <div className="gov-title">
            <div className="dept">{t("app.dept")}</div>
            <div className="app">
              <b>{t("app.name")}</b> — {t("app.tagline")}
            </div>
          </div>
        </div>

        {/* Right cluster */}
        <div className="gov-right flex items-center justify-end w-full">
          {/* Actions */}
          <div className="gov-actions" aria-label="actions">
            {/* Language */}
            <div className="relative flex items-center bg-white/10 hover:bg-white/20 px-2.5 py-1.5 rounded-lg border border-white/20 transition-colors" title="Select Language">
              <Globe size={14} style={{ opacity: 0.9 }} className="mr-1.5" />
              <select 
                className="bg-transparent text-sm font-bold outline-none cursor-pointer appearance-none pr-4 text-inherit uppercase"
                value={i18n.language.split('-')[0]}
                onChange={(e) => setLang(e.target.value)}
              >
                <option value="en" className="text-slate-800">EN</option>
                <option value="hi" className="text-slate-800">HI</option>
                <option value="pa" className="text-slate-800">PA</option>
              </select>
              <ChevronDown size={12} className="absolute right-1.5 opacity-70 pointer-events-none" />
            </div>

            {/* Theme */}
            <button className="icon-btn" onClick={onToggleTheme} aria-label="Toggle theme">
              {themeLabel === "night" ? <Moon size={16} /> : <Sun size={16} />}
              <span className="icon-btn-text">
                {themeLabel === "night" ? t("app.night") : t("app.day")}
              </span>
            </button>

            {/* Auth */}
            {isAuthed ? (
              <>
                <Link className="icon-btn" to="/operator" aria-label="Operator demo">
                  <Bus size={16} />
                  <span className="icon-btn-text">Operator</span>
                </Link>
                <button
                  className="icon-btn"
                  onClick={() => {
                    clearSession();
                    nav("/welcome");
                  }}
                  aria-label="Logout"
                >
                  <LogOut size={16} />
                  <span className="icon-btn-text">Logout</span>
                </button>
              </>
            ) : (
              <Link className="icon-btn" to="/login" aria-label="Login">
                <LogIn size={16} />
                <span className="icon-btn-text">{t("app.login")}</span>
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
