import "leaflet/dist/leaflet.css";
import { useEffect } from "react";
import L from "leaflet";
import { MapContainer, Marker, TileLayer, useMap, useMapEvents } from "react-leaflet";

export const COCHABAMBA: [number, number] = [-17.3895, -66.1568];

const pin = L.divIcon({ className: "", html: '<div class="delivery-pin"></div>', iconSize: [28, 28], iconAnchor: [14, 28] });

function ClickHandler({ onPick }: { onPick: (lat: number, lng: number) => void }) {
  useMapEvents({ click: (e) => onPick(e.latlng.lat, e.latlng.lng) });
  return null;
}

function FlyTo({ point }: { point: [number, number] | null }) {
  const map = useMap();
  useEffect(() => {
    if (point) map.flyTo(point, Math.max(map.getZoom(), 15), { duration: 0.6 });
  }, [point, map]);
  return null;
}

export default function DeliveryMap({
  point,
  onPick,
}: {
  point: [number, number] | null;
  onPick: (lat: number, lng: number) => void;
}) {
  return (
    <MapContainer center={COCHABAMBA} zoom={13} className="h-[350px] w-full" scrollWheelZoom={false}>
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <ClickHandler onPick={onPick} />
      <FlyTo point={point} />
      {point && <Marker position={point} icon={pin} />}
    </MapContainer>
  );
}
