import { useAuth } from "../contexts/AuthContext";
import LiveMap from "./LiveMap";
import AdminDashboard from "./AdminDashboard";
import OperatorDemo from "./OperatorDemo";

export default function UnifiedDashboard() {
  const { role, loading } = useAuth();

  if (loading) {
    return <div className="p-8 text-slate-500 font-medium">Authenticating Unified Dashboard...</div>;
  }

  // Switch the primary view dynamically utilizing the securely decrypted role string
  switch (role) {
    case "admin":
      return <AdminDashboard />;
    case "operator":
      return <OperatorDemo />;
    case "commuter":
    default:
      return <LiveMap />;
  }
}
