const COORDS_ZONE_BASE_URL = "/api";

type CoordsZoneEndpoint = "zone" | "country" | "climate";

interface ZoneResponse {
  lat: number;
  lng: number;
  local_zone: string | null;
  usda_zone: string;
}

interface CountryResponse {
  iso_code: string;
  lat: number;
  lng: number;
  name: string;
  zones: string[];
}

interface ClimateResponse {
  frost_first_doy: number;
  frost_last_doy: number;
  lat: number;
  lng: number;
  max_temp: number;
  max_temp_f: number;
  min_temp: number;
  min_temp_f: number;
}

class CoordsZoneError extends Error {
  constructor(
    public readonly endpoint: CoordsZoneEndpoint,
    message: string,
    public readonly cause?: unknown
  ) {
    super(`coords.zone request to "${endpoint}" failed: ${message}`);
    this.name = "CoordsZoneError";
  }
}

async function fetchCoordsZone<T>(
  endpoint: CoordsZoneEndpoint,
  lat: number,
  lng: number
): Promise<T> {
  const params = new URLSearchParams({ lat: String(lat), lng: String(lng) });
  const url = `${COORDS_ZONE_BASE_URL}/${endpoint}?${params}`;

  let res: Response;
  try {
    res = await fetch(url, {
      headers: {
        Authorization: `Bearer ${process.env.NEXT_PUBLIC_COORDS_ZONE_API_KEY}`
      }
    });
  } catch (err) {
    throw new CoordsZoneError(endpoint, "network error", err);
  }

  if (!res.ok) {
    throw new CoordsZoneError(endpoint, `HTTP ${res.status}`);
  }

  try {
    return (await res.json()) as T;
  } catch (err) {
    throw new CoordsZoneError(endpoint, "invalid JSON response", err);
  }
}

async function getZone(lat: number, lng: number): Promise<ZoneResponse> {
  return fetchCoordsZone<ZoneResponse>("zone", lat, lng);
}

async function getCountry(lat: number, lng: number): Promise<CountryResponse> {
  return fetchCoordsZone<CountryResponse>("country", lat, lng);
}

async function getClimate(lat: number, lng: number): Promise<ClimateResponse> {
  return fetchCoordsZone<ClimateResponse>("climate", lat, lng);
}

export { getClimate, getCountry, getZone };
export type { ZoneResponse, CountryResponse, ClimateResponse };