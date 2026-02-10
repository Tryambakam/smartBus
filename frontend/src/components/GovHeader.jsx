import { useTranslation } from "react-i18next";
import {
  Bus,
  ShieldCheck,
  ShieldX,
  PhoneCall,
  RefreshCw,
  LogIn,
  Sun,
  Moon,
  Globe,
} from "lucide-react";

export default function GovHeader({
  lastSyncText,
  backendOk,
  onToggleTheme = () => {},
  themeLabel = "day",
}) {
  const { t, i18n } = useTranslation();

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
        <div className="gov-right">
          <div className="gov-pills" aria-label="status pills">
            <div className={`pill ${backendOk ? "ok" : "bad"}`} title={t("app.service")}>
              {backendOk ? <ShieldCheck size={14} /> : <ShieldX size={14} />}
              {backendOk ? t("app.operational") : t("app.down")}
              <span className="status-dot" aria-hidden="true" />
            </div>

            <div className="pill" title={t("app.lastSync")}>
              <RefreshCw size={14} />
              {lastSyncText}
            </div>

            <div className="pill" title={t("app.helpline")}>
              <PhoneCall size={14} />
              1800-XXX-XXXX
            </div>
          </div>

          {/* Actions */}
          <div className="gov-actions" aria-label="actions">
            {/* Language */}
            <div className="lang-pill" title="Language">
              <Globe size={14} style={{ opacity: 0.9 }} />
              <button className="chip" onClick={() => setLang("en")}>EN</button>
              <button className="chip" onClick={() => setLang("hi")}>हिं</button>
              <button className="chip" onClick={() => setLang("pa")}>ਪੰ</button>
            </div>

            {/* Theme */}
            <button className="icon-btn" onClick={onToggleTheme} aria-label="Toggle theme">
              {themeLabel === "night" ? <Moon size={16} /> : <Sun size={16} />}
              <span className="icon-btn-text">
                {themeLabel === "night" ? t("app.night") : t("app.day")}
              </span>
            </button>

            {/* Login */}
            <a className="icon-btn" href="/login" aria-label="Login">
              <LogIn size={16} />
              <span className="icon-btn-text">{t("app.login")}</span>
            </a>
          </div>
        </div>
      </div>
    </header>
  );
}
