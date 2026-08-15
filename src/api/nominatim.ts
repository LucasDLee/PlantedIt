export interface NominatimAddress {
  [key: string]: string | undefined;
  city?: string;
  country?: string;
  country_code?: string;
  postcode?: string;
  road?: string;
  state?: string;
}

export interface NominatimResult {
  [key: string]: unknown;
  address: Record<string, string>;
  display_name: string;
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