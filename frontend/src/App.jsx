import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import LiveMap from "./pages/LiveMap";
import BusDetails from "./pages/BusDetails";
import Login from "./pages/Login";
import AdminDashboard from "./pages/AdminDashboard";
import DriverDashboard from "./pages/DriverDashboard";


export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LiveMap />} />
        <Route path="/bus/:busId" element={<BusDetails />} />
        <Route path="*" element={<Navigate to="/" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/driver" element={<DriverDashboard />} />

      </Routes>
    </BrowserRouter>
  );
}

