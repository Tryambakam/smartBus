import { useAuth } from "../contexts/AuthContext";
import CommuterSearch from "./CommuterSearch";

export default function UnifiedDashboard() {
  const { role, user, loading } = useAuth();

  if (loading) {
    return <div className="p-8 text-slate-500 font-[500] text-center w-full flex justify-center items-center min-h-screen">Authenticating Secure Platform...</div>;
  }

  // Phase 27: Strict Role-Based Convergence enforces all hardware viewports onto the primary Commuter timeline array natively.
  return <CommuterSearch user={user} role={role} />;
}
