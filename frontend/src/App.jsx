import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Welcome from "./pages/Welcome";
import RequireAuth from "./components/RequireAuth";
import OperatorDemo from "./pages/OperatorDemo";
import AdminDashboard from "./pages/AdminDashboard";
import UnifiedDashboard from "./pages/UnifiedDashboard";
import { AuthProvider } from "./contexts/AuthContext";
import PublicRoute from "./components/PublicRoute";
import MainLayout from "./components/MainLayout";

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Shielded Arrays */}
          <Route path="/" element={<Navigate to="/welcome" replace />} />
          <Route path="/welcome" element={<Welcome />} />
          <Route path="/login" element={<PublicRoute restricted={true}><Login /></PublicRoute>} />
          <Route path="/register" element={<PublicRoute restricted={true}><Register /></PublicRoute>} />

          {/* Core Protected DOM */}
          <Route path="/*" element={
            <RequireAuth>
              <MainLayout>
                <Routes>
                  {/* The Root Main Dashboard Engine */}
                  <Route path="dashboard" element={<UnifiedDashboard />} />

                  {/* Generic Fallbacks */}
                  <Route path="app" element={<Navigate to="/dashboard" replace />} />
                  <Route path="map" element={<Navigate to="/dashboard" replace />} />
                  <Route path="routes" element={<Navigate to="/dashboard" replace />} />
                  <Route path="alerts" element={<Navigate to="/dashboard" replace />} />
                  
                  {/* Universal Tracking */}
                  <Route path="bus/:busId" element={<Navigate to="/dashboard" replace />} />
                  
                  {/* Strict Operational Hierarchy (Operators + Admins) */}
                  <Route path="operator/*" element={
                    <RequireAuth allowedRoles={["operator", "admin"]}>
                      <Routes>
                        <Route path="bus" element={<OperatorDemo />} />
                        <Route path="telemetry" element={<OperatorDemo />} />
                        <Route path="status" element={<OperatorDemo />} />
                        <Route path="*" element={<OperatorDemo />} />
                      </Routes>
                    </RequireAuth>
                  } />
                  
                  {/* Pure Administrative Control */}
                  <Route path="admin/*" element={
                    <RequireAuth allowedRoles={["admin"]}>
                      <Routes>
                        <Route path="users" element={<AdminDashboard />} />
                        <Route path="logs" element={<AdminDashboard />} />
                        <Route path="routes" element={<AdminDashboard />} />
                        <Route path="*" element={<AdminDashboard />} />
                      </Routes>
                    </RequireAuth>
                  } />

                  <Route path="*" element={<Navigate to="/dashboard" replace />} />
                </Routes>
              </MainLayout>
            </RequireAuth>
          } />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

