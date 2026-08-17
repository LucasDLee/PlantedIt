import { LOCATION_EVENT, SavedLocation, getMostRecentLocation } from "@/src/lib/storage/locations";
import { useEffect, useState } from "react";
import { DUMMY_LOCATION } from "@/src/constants/geocoding";

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

  return (
    <p>{countryCode} | {cityName} | {province} | {country}</p>
  );
}