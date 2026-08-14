export interface NominatimAddress {
  road?: string;
  city?: string;
  state?: string;
  postcode?: string;
  country?: string;
  country_code?: string;
  [key: string]: string | undefined;
}

export interface NominatimResult {
  display_name: string;
  address: Record<string, string>;
  [key: string]: unknown;
}

const NOMINATIM_BASE_URL = 'https://nominatim.openstreetmap.org';
const USER_AGENT = 'YourAppName/1.0 (your-email@example.com)';

export async function reverseGeocode(lat: number, lon: number): Promise<NominatimResult> {
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