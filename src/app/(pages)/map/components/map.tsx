'use client';

import L, { type LatLngExpression } from 'leaflet';
import { MapContainer, Marker, Popup, TileLayer } from 'react-leaflet';
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

delete (L.Icon.Default.prototype as { _getIconUrl?: unknown })._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: icon.src ?? icon,
  shadowUrl: iconShadow.src ?? iconShadow
});

export default function Map() {
  
  const mapCenter: LatLngExpression = [0.0, 0.0];
  return (
    <MapContainer
      center={mapCenter}
      zoom={13}
      style={{ height: '400px', width: '100%' }}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; OpenStreetMap contributors'
      />
      <Marker position={mapCenter}>
        <Popup>A sample marker.</Popup>
      </Marker>
    </MapContainer>
  );
}