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

const STORAGE_KEY = 'saved-locations';
export const LOCATION_EVENT = 'saved-locations-changed';

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

function getMostRecentLocation(): SavedLocation {

  if (typeof window === 'undefined') return DUMMY_LOCATION; // guard for SSR

  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return DUMMY_LOCATION;

  try {
    const listLocation = JSON.parse(raw) as SavedLocation[];

    if (!Array.isArray(listLocation) || listLocation.length === 0) {
      return DUMMY_LOCATION;
    }

    const mostRecent = [...listLocation].sort(
      (a, b) => new Date(b.savedAt).getTime() - new Date(a.savedAt).getTime()
    )[0];

    return mostRecent;
  } catch (err) {
    console.error('Failed to get most recent location', err);
    return DUMMY_LOCATION;
  }
}

function getSavedLocations(): SavedLocation[] {
  if (typeof window === 'undefined') return []; // guard for SSR

  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return [];

  try {
    return JSON.parse(raw) as SavedLocation[];
  } catch (err) {
    console.error('Failed to parse saved locations:', err);
    return [];
  }
}

function saveLocation(location: SavedLocation): SavedLocation[] {
  const current = getSavedLocations();
  const updated = [...current, location];
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  notifyChange();
  return updated;
}

function clearSavedLocations(): void {
  localStorage.removeItem(STORAGE_KEY);
}

export { clearSavedLocations, saveLocation, getMostRecentLocation, getSavedLocations };