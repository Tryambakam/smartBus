import { useAuth } from "../contexts/AuthContext";
import CommuterSearch from "./CommuterSearch";

import AdminDashboard from "./AdminDashboard";
import OperatorDemo from "./OperatorDemo";

export default function UnifiedDashboard() {
  const { role, user, loading } = useAuth();

  if (loading) {
    return <div className="p-8 text-slate-500 font-[500] text-center w-full flex justify-center items-center min-h-screen">Authenticating Secure Platform...</div>;
  }

  // Strict Role-Based Navigation Architecture
  if (role === 'admin') {
     return <AdminDashboard />;
  }
  
  if (role === 'operator') {
     return <OperatorDemo />;
  }

  return <CommuterSearch user={user} role={role} />;
}
