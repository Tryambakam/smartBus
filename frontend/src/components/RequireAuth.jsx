import { Navigate, useLocation } from "react-router-dom";
import { getAuthToken } from "../api";

export default function RequireAuth({ children }) {
  const loc = useLocation();
  const token = getAuthToken();
  if (!token) return <Navigate to="/welcome" replace state={{ from: loc.pathname }} />;
  return children;
}

