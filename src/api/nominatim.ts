export interface NominatimAddress {
  [key: string]: string | undefined;  // catch-all for the rest (postcode, county, etc.)
  city?: string;
  country?: string;
  country_code?: string;
  hamlet?: string;
  municipality?: string;
  province?: string;
  region?: string;
  state?: string;
  town?: string;
  village?: string;
}

export interface NominatimResponse {
  address: NominatimAddress;
  addresstype: string;
  boundingbox: string[],
  class: string;
  display_name: string;
  importance: number;
  lat: string;
  licence: string;
  lon: string;
  name: string;
  osm_id: number;
  osm_type: string;
  place_id: number;
  place_rank: number;
  type: string;
}

const NOMINATIM_BASE_URL = 'https://nominatim.openstreetmap.org';
const USER_AGENT = 'YourAppName/1.0 (your-email@example.com)';

export async function reverseGeocode(lat: number, lon: number): Promise<NominatimResponse> {
  const res = await fetch(
    `${NOMINATIM_BASE_URL}/reverse?format=json&lat=${lat}&lon=${lon}`,
    {
      headers: {
        'User-Agent': USER_AGENT
      }
    }
  );

  if (!res.ok) {
    throw new Error(`Nominatim error: ${res.status}`);
  }

  return res.json();
}