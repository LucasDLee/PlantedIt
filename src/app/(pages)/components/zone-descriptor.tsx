import { ZONE_EVENT, getZone } from "@/src/lib/storage/zone";
import { useEffect, useState } from "react";
import { ZoneResponse } from "@/src/app/api/coords-zone";

export default function ZoneDescriptor() {
  const [zone, setZone] = useState<ZoneResponse | null>(null);

  useEffect(() => {
    const refresh = () => setZone(getZone());

    refresh(); // read real data only after mount

    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === "hardiness-zone") refresh();
    };

    window.addEventListener("storage", handleStorageChange);
    window.addEventListener(ZONE_EVENT, refresh);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener(ZONE_EVENT, refresh);
    };
  }, []);

  if (!zone) return null; // or a placeholder/skeleton

  return <p>Zone: {zone.usda_zone}</p>;
}