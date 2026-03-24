import { useAuth } from "../contexts/AuthContext";
import AdminDashboard from "./AdminDashboard";
import OperatorDemo from "./OperatorDemo";
import CommuterSearch from "./CommuterSearch";

export default function UnifiedDashboard() {
  const { role, loading } = useAuth();

  if (loading) {
    return <div className="p-8 text-slate-500 font-[500] text-center w-full flex justify-center items-center min-h-screen">Authenticating Secure Platform...</div>;
  }

  // Switch the primary view dynamically utilizing the securely decrypted role string
  switch (role) {
    case "admin":
      return <AdminDashboard />;
    case "operator":
      return <OperatorDemo />;
    case "commuter":
    default:
      // Overriding standard maps for the ultra-minimal Search Architecture
      return <CommuterSearch />;
  }
}
