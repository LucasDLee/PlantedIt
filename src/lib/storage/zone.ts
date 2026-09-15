import { ZoneResponse } from "@/src/app/api/coords-zone";

const STORAGE_KEY = "hardiness-zone";

function saveZone(data: ZoneResponse) {
  // const existing: ZoneResponse = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
  const updated = data;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
}

export { saveZone };