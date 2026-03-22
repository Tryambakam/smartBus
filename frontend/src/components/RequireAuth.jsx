import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

export default function RequireAuth({ children, allowedRoles }) {
  const loc = useLocation();
  const { user, role, loading } = useAuth();

  if (loading) {
    return <div className="h-screen w-full flex items-center justify-center bg-slate-50 dark:bg-slate-900 text-slate-500 font-medium">Authenticating Secure Platform...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace state={{ from: loc.pathname }} />;
  }

  if (allowedRoles && role && !allowedRoles.includes(role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}

