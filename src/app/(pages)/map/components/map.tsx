'use client';

import L, { type LatLngExpression } from 'leaflet';
import { MapContainer, Marker, Popup, TileLayer, useMapEvents } from 'react-leaflet';
import { useEffect, useState } from 'react';
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

// Child component that listens for map clicks and reports them up
function LocationMarker({
  position,
  setPosition
}: {
  position: LatLngExpression;
  setPosition: (pos: LatLngExpression) => void;
}) {
  useMapEvents({
    click(e) {
      setPosition([e.latlng.lat, e.latlng.lng]);
    }
  });

  return (
    <Marker position={position}>
      <Popup>
        Lat: {(position as [number, number])[0].toFixed(5)}, Lng:{' '}
        {(position as [number, number])[1].toFixed(5)}
      </Popup>
    </Marker>
  );
}

export default function Map() {
  useEffect(() => {
    delete (L.Icon.Default.prototype as { _getIconUrl?: unknown })._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconUrl: icon.src ?? icon,
      shadowUrl: iconShadow.src ?? iconShadow
    });
  }, []);

  const [position, setPosition] = useState<LatLngExpression>([0.0, 0.0]);

  return (
    <MapContainer center={position} zoom={13} style={{ height: '400px', width: '100%' }}>
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; OpenStreetMap contributors'
      />
      <LocationMarker position={position} setPosition={setPosition} />
    </MapContainer>
  );
}