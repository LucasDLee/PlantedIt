import type { Recommendation } from "./recommend-plants";
import data from "@/src/data/invasive-regions.json";

// Built by scripts/build-invasive-regions.mjs. Kept out of recommend-plants.ts so the client
// bundle, which imports that file for its option lists, doesn't pull in the whole list.
const PLANTS: Record<string, string[] | undefined> = data.plants;
const COVERED = new Set(data.regions);

// Territories that geocode as a subdivision of their parent but have their own checklist
const TERRITORIES: Record<string, string> = {
  "FR-971": "GP",
  "FR-972": "MQ",
  "FR-973": "GF",
  "FR-974": "RE",
  "FR-976": "YT",
  "US-AS": "AS",
  "US-GU": "GU",
  "US-MP": "MP",
  "US-PR": "PR",
  "US-VI": "VI"
};

const US_SPLITS: Record<string, string> = {
  "US-AK": "Alaska",
  "US-HI": "Hawaii",
  "US-L48": "the contiguous US"
};

// Checklist regions covering a location, e.g. "US-OR" → ["US", "US-OR", "US-L48"]
function regionsFor(region: string): string[] {
  const country = region.split("-")[0];
  const regions = [country, region, TERRITORIES[region]];
  if (country === "US" && !US_SPLITS[region] && !TERRITORIES[region]) regions.push("US-L48");
  return regions.filter((code): code is string => Boolean(code));
}

function placeName(code: string): string {
  if (US_SPLITS[code]) return US_SPLITS[code];
  try {
    return new Intl.DisplayNames("en", { type: "region" }).of(code) ?? code;
  } catch {
    return code;
  }
}

export interface InvasiveCheck {
  // Matches dropped for being invasive here
  hidden: number;
  // Null when there's no checklist for the location
  place: string | null;
}

export function removeInvasive(results: Recommendation[], region: string): {
  check: InvasiveCheck | null;
  results: Recommendation[];
} {
  if (!region) return { check: null, results };

  const regions = regionsFor(region).filter((code) => COVERED.has(code));
  const place = regions.length ? placeName(regions[regions.length - 1]) : null;
  const kept = results.filter(({ plant }) => !PLANTS[plant.uuid]?.some((code) => regions.includes(code)));
  return { check: { hidden: results.length - kept.length, place }, results: kept };
}
