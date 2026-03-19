import { useMemo } from "react";
import { Marker } from "react-leaflet";
import L from "leaflet";

export default function BusMarker({ position, children, eventHandlers, isSelected, heading = 0, busStatus = "On Route" }) {
  const icon = useMemo(() => {
    let fillColor = "#0b4ea2"; // Default (On Route)
    if (busStatus === "Out of Service") fillColor = "#64748b"; // Slate-500
    else if (busStatus === "Stopped") fillColor = "#e11d48"; // Rose-600

    return L.divIcon({
      className: "bus-marker-icon",
      html: `
        <div class="bus-marker-wrap ${isSelected ? 'marker-bounce' : ''}">
          <div class="bus-marker-pulse"></div>
          <div class="bus-marker-chevron" style="transform: rotate(${heading}deg); transition: transform 1.5s linear;">
            <svg viewBox="0 0 24 24" fill="${fillColor}" width="28" height="28" stroke="white" stroke-width="1.8" stroke-linejoin="round">
              <path d="M12 2L2 22l10-4 10 4L12 2z" />
            </svg>
          </div>
        </div>
      `,
      iconSize: [34, 34],
      iconAnchor: [17, 17],
    });
  }, [isSelected, heading, busStatus]);

  return (
    <Marker position={position} icon={icon} eventHandlers={eventHandlers}>
      {children}
    </Marker>
  );
}
