import type { NominatimResponse } from '@/src/api/nominatim';

export interface SavedLocation {
  data: NominatimResponse;
  lat: number;
  lng: number;
  savedAt: string; // ISO timestamp
}

const STORAGE_KEY = 'saved-locations';
export const LOCATION_EVENT = 'saved-locations-changed';

function notifyChange() {
  window.dispatchEvent(new Event(LOCATION_EVENT));
}

export function getMostRecentLocation(): SavedLocation {
  const dummyLocation: SavedLocation = {
    data: {
      address: {},
      addresstype: '',
      boundingbox: ['0', '0', '0', '0'],
      class: '',
      display_name: 'Unable to geocode',
      importance: 0,
      lat: '0',
      licence: '',
      lon: '0',
      name: '',
      osm_id: 0,
      osm_type: '',
      place_id: 0,
      place_rank: 0,
      type: ''
    },
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
  const updated = [...current, location];
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  notifyChange();
  return updated;
}

export function clearSavedLocations(): void {
  localStorage.removeItem(STORAGE_KEY);
}