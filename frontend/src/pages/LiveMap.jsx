import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";

// Fix marker icon issue (Vite/React)
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

const API_BASE = import.meta.env.VITE_API_BASE;

export default function LiveMap() {
  const [buses, setBuses] = useState([]);
  const [error, setError] = useState("");

  async function load() {
    try {
      setError("");
      const res = await fetch(`${API_BASE}/api/buses/live`);
      if (!res.ok) throw new Error(`API error: ${res.status}`);
      const data = await res.json();
      setBuses(Array.isArray(data) ? data : []);
    } catch (e) {
      setError(e.message);
    }
  }

  useEffect(() => {
    load();
    const t = setInterval(load, 5000);
    return () => clearInterval(t);
  }, []);

  return (
    <div style={{ height: "100vh", width: "100vw" }}>
      {error && (
        <div style={{ position: "absolute", zIndex: 999, margin: 10, padding: 10, background: "white" }}>
          ❌ {error}
        </div>
      )}

      <MapContainer center={[30.7333, 76.7794]} zoom={13} style={{ height: "100%", width: "100%" }}>
        <TileLayer
          attribution="&copy; OpenStreetMap contributors"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {buses.map((b) => (
          <Marker key={b.busId} position={[b.lat, b.lng]}>
            <Popup>
              <div>
                <div><b>{b.busId}</b></div>
                <div>Speed: {b.speed ?? 0}</div>
                <div>Last: {b.timestamp ? new Date(b.timestamp).toLocaleString() : "N/A"}</div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
