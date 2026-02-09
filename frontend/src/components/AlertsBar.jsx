export default function AlertsBar({ alerts = [] }) {
  if (!alerts.length) return null;

  return (
    <div className="alerts">
      {alerts.map((a, i) => (
        <div key={i} className={`alert ${a.type || "info"}`}>
          <b>{a.title}</b>
          <span>— {a.message}</span>
        </div>
      ))}
    </div>
  );
}
