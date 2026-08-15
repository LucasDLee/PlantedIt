import type { NominatimResult } from '@/src/api/nominatim';

export interface SavedLocation {
  address: NominatimResult;
  lat: number;
  lng: number;
  savedAt: string; // ISO timestamp
}

const STORAGE_KEY = 'saved-locations';

export function getSavedLocations(): SavedLocation[] {
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

export function saveLocation(location: SavedLocation): SavedLocation[] {
  const current = getSavedLocations();
  console.log(location)
  const updated = [...current, location];
  // localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  // return updated;
}

export function clearSavedLocations(): void {
  localStorage.removeItem(STORAGE_KEY);
}