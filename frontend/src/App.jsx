import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import LiveMap from "./pages/LiveMap";
import BusDetails from "./pages/BusDetails";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Welcome from "./pages/Welcome";
import RequireAuth from "./components/RequireAuth";
import OperatorDemo from "./pages/OperatorDemo";


export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/welcome" replace />} />
        <Route path="/welcome" element={<Welcome />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route
          path="/app"
          element={
            <RequireAuth>
              <LiveMap />
            </RequireAuth>
          }
        />
        <Route
          path="/bus/:busId"
          element={
            <RequireAuth>
              <BusDetails />
            </RequireAuth>
          }
        />
        <Route
          path="/operator"
          element={
            <RequireAuth>
              <OperatorDemo />
            </RequireAuth>
          }
        />
        <Route path="*" element={<Navigate to="/welcome" replace />} />

      </Routes>
    </BrowserRouter>
  );
}

