import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";

export default function GovHeader({ lastSyncText, backendOk, onToggleTheme, themeLabel }) {
  const { t, i18n } = useTranslation();
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const timeText = useMemo(() => now.toLocaleTimeString(), [now]);

  const setLang = (lng) => i18n.changeLanguage(lng);

  return (
    <header className="gov-header" role="banner">
      <div className="gov-header-row">
        <div className="gov-brand" aria-label="smartBus brand">
          <div className="gov-logo" aria-hidden="true">
            <span style={{ fontSize: 18 }}>🚌</span>
          </div>
          <div className="gov-title">
            <div className="dept">{t("app.dept")}</div>
            <div className="app">
              <b>{t("app.name")}</b> — {t("app.tagline")}
            </div>
          </div>
        </div>

        <div className="gov-right">
          <div className="gov-pills" aria-label="status pills">
            <div className={`pill ${backendOk ? "ok" : "bad"}`} title={t("app.service")}>
              <span className="status-dot" aria-hidden="true" />
              {backendOk ? t("app.operational") : t("app.down")}
            </div>

            <div className="pill" title={t("app.lastSync")}>
              ⟳ {lastSyncText || timeText}
            </div>

            <div className="pill" title={t("app.helpline")}>
              ☎ 1800-XXX-XXXX
            </div>
          </div>

          <div className="gov-actions" aria-label="actions">
            {/* Language */}
            <div className="pill" style={{ padding: 6 }}>
              <button className="chip" onClick={() => setLang("en")} aria-label="English">EN</button>
              <button className="chip" onClick={() => setLang("hi")} aria-label="Hindi">हिं</button>
              <button className="chip" onClick={() => setLang("pa")} aria-label="Punjabi">ਪੰ</button>
            </div>

            {/* Theme */}
            <button className="icon-btn" onClick={onToggleTheme} aria-label="Toggle theme">
              {themeLabel === "night" ? "🌙" : "☀️"} <span className="icon-btn-text">{t(themeLabel === "night" ? "app.night" : "app.day")}</span>
            </button>

            {/* Login */}
            <a className="icon-btn" href="/login" aria-label="Login">
              🔒 <span className="icon-btn-text">{t("app.login")}</span>
            </a>
          </div>
        </div>
      </div>
    </header>
  );
}
