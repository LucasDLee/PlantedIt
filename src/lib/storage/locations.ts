import { DUMMY_LOCATION } from '@/src/constants/geocoding';
import type { NominatimResponse } from '@/src/app/api/nominatim';

export interface SavedLocation {
  data: NominatimResponse;
  lat: number;
  lng: number;
  savedAt: string; // ISO timestamp
}

export interface Coordinates {
  lat: number;
  lng: number;
}

const STORAGE_KEY = 'saved-location';
const LEGACY_STORAGE_KEY = 'saved-locations'; // old array format, removed on next save
export const LOCATION_EVENT = 'saved-location-changed';

function notifyChange() {
  window.dispatchEvent(new Event(LOCATION_EVENT));
}

function postLatitudeLongitude(lat: number, lng: number): void {
  const data: Coordinates = { lat, lng };
  localStorage.setItem("coordinates", JSON.stringify(data));
}

function getLatitudeLongitude(): Coordinates | null {
  const data = localStorage.getItem("coordinates");
  if (data === null) return null;

  try {
    const parsed = JSON.parse(data);
    if (
      typeof parsed === "object" &&
      parsed !== null &&
      typeof parsed.lat === "number" &&
      typeof parsed.lng === "number"
    ) {
      return parsed as Coordinates;
    }
    console.error("Stored coordinates have unexpected shape:", parsed);
    return null;
  } catch (err) {
    console.error(err);
    return null;
  }
}

function getLocation(): SavedLocation {
  if (typeof window === 'undefined') return DUMMY_LOCATION; // guard for SSR

  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return DUMMY_LOCATION;

  try {
    return JSON.parse(raw) as SavedLocation;
  } catch (err) {
    console.error('Failed to parse saved location:', err);
    return DUMMY_LOCATION;
  }
}

function saveLocation(location: SavedLocation): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(location));
  localStorage.removeItem(LEGACY_STORAGE_KEY);
  notifyChange();
}

function clearLocation(): void {
  localStorage.removeItem(STORAGE_KEY);
  notifyChange();
}

export { clearLocation, saveLocation, getLocation };
