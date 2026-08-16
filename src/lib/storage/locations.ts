import type { NominatimResult } from '@/src/api/nominatim';

export interface SavedLocation {
  address: NominatimResult;
  lat: number;
  lng: number;
  savedAt: string; // ISO timestamp
}

const STORAGE_KEY = 'saved-locations';

export function getMostRecentLocation(): SavedLocation {
  const dummyLocation: SavedLocation = {
    address: {
      error: 'Unable to geocode'
    } as unknown as NominatimResult,
    lat: 0,
    lng: 0,
    savedAt: new Date().toISOString()
  };

  if (typeof window === 'undefined') return dummyLocation; // guard for SSR

  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return dummyLocation;

  try {
    const listLocation = JSON.parse(raw) as SavedLocation[];

    if (!Array.isArray(listLocation) || listLocation.length === 0) {
      return dummyLocation;
    }

    const mostRecent = [...listLocation].sort(
      (a, b) => new Date(b.savedAt).getTime() - new Date(a.savedAt).getTime()
    )[0];

    return mostRecent;
  } catch (err) {
    console.error('Failed to get most recent location', err);
    return dummyLocation;
  }
}

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
  console.log(updated)
  // localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  // return updated;
}

export function clearSavedLocations(): void {
  localStorage.removeItem(STORAGE_KEY);
}