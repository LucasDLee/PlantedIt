'use client';

import { HARDINESS_TILE_MAX_ZOOM, HARDINESS_TILE_URL, HARDINESS_ZONE_COLORS } from '@/src/constants/hardiness';
import L, { type LatLngExpression } from 'leaflet';
import { LayersControl, MapContainer, Marker, Popup, TileLayer, useMapEvents } from 'react-leaflet';
import { type SavedLocation, getLocation, saveLocation } from '@/src/lib/storage/locations';
import { DUMMY_LOCATION } from '@/src/constants/geocoding';
import { getZone } from '@/src/app/api/coords-zone';
import { reverseGeocode } from '@/src/app/api/nominatim';
import { saveZone } from '@/src/lib/storage/zone';
import { useState } from 'react';

// Flat pin in the app's primary green (replaces Leaflet's shaded default marker)
const pinIcon = L.divIcon({
  className: 'flat-pin',
  html: `<svg viewBox="0 0 28 36" width="28" height="36" aria-hidden="true">
    <path d="M14 0C6.3 0 0 6.1 0 13.6 0 23.8 14 36 14 36s14-12.2 14-22.4C28 6.1 21.7 0 14 0z" fill="#1f7a45"/>
    <circle cx="14" cy="13.5" r="5" fill="#ffffff"/>
  </svg>`,
  iconAnchor: [14, 36],
  iconSize: [28, 36],
  popupAnchor: [0, -32]
});

// Child component that listens for map clicks and reports them up

function LocationMarker({
  position,
  setPosition
}: {
  position: [number, number] | null;
  setPosition: (pos: [number, number]) => void;
}) {
  useMapEvents({
    async click(e) {
      const { lat, lng } = e.latlng;
      setPosition([lat, lng]);

      // Save immediately on click; location and zone are independent so one failing doesn't block the other
      const [geocode, zone] = await Promise.allSettled([reverseGeocode(lat, lng), getZone(lat, lng)]);

      if (geocode.status === 'fulfilled') {
        const entry: SavedLocation = {
          data: geocode.value,
          lat,
          lng,
          savedAt: new Date().toISOString()
        };
        saveLocation(entry);
      } else {
        console.error(geocode.reason);
      }

      if (zone.status === 'fulfilled') {
        saveZone(zone.value);
      } else {
        console.error(zone.reason);
      }
    }
  });

  if (!position) return null;

  return (
    <Marker position={position} icon={pinIcon}>
      <Popup>
        Lat: {position[0].toFixed(5)}, Lng: {position[1].toFixed(5)}
      </Popup>
    </Marker>
  );
}

const HARDINESS_LAYER_NAME = 'Hardiness zones';

// Reports when the hardiness overlay is toggled in the layers control
function OverlayWatcher({ onToggle }: { onToggle: (visible: boolean) => void }) {
  useMapEvents({
    overlayadd(e) {
      if (e.name === HARDINESS_LAYER_NAME) onToggle(true);
    },
    overlayremove(e) {
      if (e.name === HARDINESS_LAYER_NAME) onToggle(false);
    }
  });

  return null;
}

function HardinessLegend() {
  return (
    <div className="absolute bottom-6 left-4 z-[1000] rounded-md border border-line bg-background px-3 py-2">
      <p className="mb-1 text-xs font-medium text-muted">Hardiness zone</p>
      <div className="flex">
        {Array.from({ length: HARDINESS_ZONE_COLORS.length / 2 }, (_, i) => (
          <div key={i} className="flex w-6 flex-col items-center">
            <div className="flex h-3 w-full">
              <span className="flex-1" style={{ background: HARDINESS_ZONE_COLORS[i * 2] }} />
              <span className="flex-1" style={{ background: HARDINESS_ZONE_COLORS[i * 2 + 1] }} />
            </div>
            <span className="mt-0.5 text-[10px] text-muted">{i + 1}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function Map() {
  const [showHardiness, setShowHardiness] = useState(true);
  const [position, setPosition] = useState<[number, number] | null>(() => {
    const saved = getLocation();
    return saved === DUMMY_LOCATION ? null : [saved.lat, saved.lng];
  });
  const [initialCenter] = useState<LatLngExpression>(() => position ?? [20, 0]);

  return (
    <div className="relative h-full w-full">
      {!position && (
        <div className="pointer-events-none absolute right-4 top-4 z-[1000]">
          <p className="rounded-md bg-primary px-3 py-2 text-sm font-medium text-on-primary">
            Click anywhere to drop a pin
          </p>
        </div>
      )}
      <MapContainer center={initialCenter} zoom={position ? 6 : 2} worldCopyJump style={{ height: '100%', width: '100%' }}>
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; OpenStreetMap contributors'
        />
        <LayersControl position="topleft">
          <LayersControl.Overlay checked={showHardiness} name={HARDINESS_LAYER_NAME}>
            <TileLayer
              url={HARDINESS_TILE_URL}
              maxNativeZoom={HARDINESS_TILE_MAX_ZOOM}
              opacity={0.55}
              attribution="Zones derived from NOAA CPC and WorldClim"
            />
          </LayersControl.Overlay>
        </LayersControl>
        <OverlayWatcher onToggle={setShowHardiness} />
        <LocationMarker position={position} setPosition={setPosition} />
      </MapContainer>
      {showHardiness && <HardinessLegend />}

      {/* {address && (
        <div style={{ marginTop: '1rem' }}>
          <p>{address.display_name}</p>
        </div>
      )} */}
    </div>
  );
}