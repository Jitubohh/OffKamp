"use client";

import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from "react-leaflet";
import { divIcon } from "leaflet";
import { useEffect } from "react";
import "leaflet/dist/leaflet.css";
import type { LatLng } from "@/lib/geo";

// Leaflet's default marker loads PNGs by URL, which bundlers break.
// A divIcon is pure HTML, so it always renders and inherits our theme.
const pinIcon = divIcon({
  className: "",
  html: `<div style="
    width:28px;height:28px;border-radius:50% 50% 50% 0;
    background:#0B3B5E;border:3px solid #fff;
    transform:rotate(-45deg);
    box-shadow:0 4px 12px rgba(0,0,0,.35);
  "></div>`,
  iconSize: [28, 28],
  iconAnchor: [14, 28],
});

function ClickHandler({ onPick }: { onPick: (p: LatLng, accuracy: number | null) => void }) {
  useMapEvents({
    click(e) {
      onPick({ lat: e.latlng.lat, lng: e.latlng.lng }, null);
    },
  });
  return null;
}

function Recenter({ position }: { position: LatLng | null }) {
  const map = useMap();
  useEffect(() => {
    if (position) map.flyTo([position.lat, position.lng], 17, { duration: 0.8 });
  }, [position, map]);
  return null;
}

export default function LocationMap({
  position,
  center,
  onPick,
}: {
  position: LatLng | null;
  center: LatLng;
  onPick: (p: LatLng, accuracy: number | null) => void;
}) {
  return (
    <MapContainer
      center={[center.lat, center.lng]}
      zoom={position ? 17 : 13}
      scrollWheelZoom
      className="h-72 w-full rounded-2xl sm:h-80"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <ClickHandler onPick={onPick} />
      <Recenter position={position} />
      {position && (
        <Marker
          position={[position.lat, position.lng]}
          icon={pinIcon}
          draggable
          eventHandlers={{
            dragend(e) {
              const { lat, lng } = e.target.getLatLng();
              onPick({ lat, lng }, null); // dragging = manual, so accuracy resets
            },
          }}
        />
      )}
    </MapContainer>
  );
}