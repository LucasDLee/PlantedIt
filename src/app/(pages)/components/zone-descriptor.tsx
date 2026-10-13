import { ZONE_EVENT, getZone } from "@/src/lib/storage/zone";
import { useEffect, useState } from "react";
import Card from "@/src/components/card";
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

  return (
    <Card label="Hardiness zone">
      {zone ? (
        <div className="mt-3 flex items-end gap-4">
          <span className="rounded-md bg-primary px-4 py-2.5 text-4xl font-bold leading-none tracking-tight text-on-primary">
            {zone.usda_zone}
          </span>
          <div className="pb-1 text-sm text-muted">
            <p>USDA zone</p>
            {zone.local_zone && <p>Local: {zone.local_zone}</p>}
          </div>
        </div>
      ) : (
        <p className="mt-3 text-sm text-muted">Pick a location to see its hardiness zone.</p>
      )}
    </Card>
  );
}
