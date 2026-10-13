import { ZoneResponse } from "@/src/app/api/coords-zone";

const STORAGE_KEY = "hardiness-zone";
export const ZONE_EVENT = "zone-updated";

function saveZone(data: ZoneResponse) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  window.dispatchEvent(new Event(ZONE_EVENT));
}

function getZone(): ZoneResponse | null {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (raw === null) return null;

  try {
    return JSON.parse(raw) as ZoneResponse;
  } catch (err) {
    console.error(err);
    return null;
  }
}

export { saveZone, getZone };