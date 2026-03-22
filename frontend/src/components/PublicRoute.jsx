import { Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

export default function PublicRoute({ children, restricted = false }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="h-screen w-full flex items-center justify-center bg-slate-50 dark:bg-slate-900 text-slate-500 font-medium tracking-wide">Authenticating...</div>;
  }

  if (user && restricted) {
    // Rely exclusively on the UnifiedDashboard routing logic
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}
