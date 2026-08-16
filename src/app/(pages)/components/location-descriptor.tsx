import { LOCATION_EVENT, SavedLocation, getMostRecentLocation } from "@/src/lib/storage/locations";
import { useEffect, useMemo, useState } from "react";
import { NominatimAddress } from "@/src/api/nominatim";

export default function LocationDescriptor() {
  // bump a counter whenever storage changes, to trigger a re-read
  const [version, setVersion] = useState(0);

  useEffect(() => {
    const refresh = () => setVersion((v) => v + 1);

    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === 'saved-locations') refresh();
    };

    window.addEventListener('storage', handleStorageChange); // other tabs
    window.addEventListener(LOCATION_EVENT, refresh);         // same tab

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener(LOCATION_EVENT, refresh);
    };
  }, []);

  const location: SavedLocation = useMemo(
    () => getMostRecentLocation(),
    [version]
  );

  // console.log(typeof(location));
  // console.log(location);

  const address = location.data.address;
  console.log(address);

  const countryCode = address?.country_code ?? "";
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

  return (
    <p>{countryCode} | {cityName} | {province} | {country}</p>
  );
}