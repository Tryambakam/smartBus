import { useMemo } from "react";
import { Marker } from "react-leaflet";
import L from "leaflet";

export default function StopMarker({ position, children, eventHandlers, sequence, isHovered }) {
  const icon = useMemo(() => {
    return L.divIcon({
      className: "stop-marker-icon",
      html: `
        <div class="stop-marker ${isHovered ? 'stop-hover' : ''}">
          <span class="stop-num">${sequence}</span>
        </div>
      `,
      iconSize: [24, 24],
      iconAnchor: [12, 12],
    });
  }, [sequence, isHovered]);

  return (
    <Marker position={position} icon={icon} eventHandlers={eventHandlers}>
      {children}
    </Marker>
  );
}
