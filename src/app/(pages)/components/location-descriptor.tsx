import { LOCATION_EVENT, SavedLocation, getMostRecentLocation } from "@/src/lib/storage/locations";
import { useEffect, useState } from "react";
import Card from "@/src/components/card";
import { DUMMY_LOCATION } from "@/src/constants/geocoding";

function formatCoordinate(value: number, positive: string, negative: string): string {
  return `${Math.abs(value).toFixed(4)}° ${value >= 0 ? positive : negative}`;
}

export default function LocationDescriptor() {
  const [location, setLocation] = useState<SavedLocation>(DUMMY_LOCATION);

  useEffect(() => {
    const refresh = () => setLocation(getMostRecentLocation());

    refresh(); // read real data only after mount

    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === 'saved-locations') refresh();
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener(LOCATION_EVENT, refresh);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener(LOCATION_EVENT, refresh);
    };
  }, []);

  const address = location.data.address;
  // console.log(address);

  const countryCode: string = address?.country_code ?? "";
  const cityName: string =
    address?.city ??
    address?.town ??
    address?.village ??
    address?.hamlet ??
    address?.municipality ??
    "";
  const province: string =
    address?.state ??
    address?.province ??
    address?.region ??
    "";
  const country: string = address?.country ?? "";

  const hasLocation = Boolean(cityName || province || country);

  return (
    <Card label="Your location">
      {hasLocation ? (
        <>
          <p className="mt-3 text-2xl font-bold leading-tight tracking-tight text-primary-strong">
            {cityName || province || country}
          </p>
          <p className="mt-1 flex items-center gap-2 text-sm text-muted">
            {[cityName ? province : "", country].filter(Boolean).join(", ")}
            {countryCode && (
              <span className="rounded bg-tint px-1.5 py-0.5 text-xs font-semibold uppercase text-primary-strong">
                {countryCode}
              </span>
            )}
          </p>
          <p className="mt-4 font-mono text-xs text-muted">
            {formatCoordinate(location.lat, "N", "S")}, {formatCoordinate(location.lng, "E", "W")}
          </p>
        </>
      ) : (
        <>
          <p className="mt-3 text-xl font-bold text-primary-strong">No location yet</p>
          <p className="mt-1 text-sm text-muted">Click on the map to choose where you&apos;re gardening.</p>
        </>
      )}
    </Card>
  );
}
