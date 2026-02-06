export default function GovHeader({ lastSyncText, backendOk }) {
  return (
    <header className="gov-header">
      <div className="gov-header-row">
        <div className="gov-brand">
          <div className="gov-logo">SB</div>
          <div className="gov-title">
            <div className="dept">Department of Transport</div>
            <div className="app">smartBus — Real-Time Public Transport Tracking</div>
          </div>
        </div>

        <div className="gov-status">
          <div className={`pill ${backendOk ? "ok" : "bad"}`}>
            Service: {backendOk ? "Online" : "Offline"}
          </div>
          <div className="pill">{lastSyncText}</div>
          <div className="pill">Helpline: 1800-XXX-XXXX</div>
        </div>
      </div>
    </header>
  );
}
