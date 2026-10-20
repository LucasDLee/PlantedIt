import { HARDINESS_ZONES, facetLabel, matchesZone } from "../plantlist/facets";
import type { Plant } from "../plantlist/components/plant-card";
import type { SearchParams } from "../plantlist/filter-plants";

// Preferences live in the URL: ?zone=6b&region=US-OR&sun=Full+sun&space=container&grow=Vegetable&grow=Herb
export const SHOWN = 24;

export const SPACES = ["garden", "container", "indoors"] as const;
export type Space = (typeof SPACES)[number];

export const SUN_OPTIONS = ["full", "partial", "shade"].map((value) => facetLabel("sun", value));
export const GROW_OPTIONS = ["vegetable", "fruit", "berry", "herb", "flower", "tree", "shrub", "vine"]
  .map((value) => facetLabel("category", value));

export interface Preferences {
  grow: string[];
  // ISO 3166 code for where the garden is ("US-OR", or just "NZ"), to rule out invasive plants
  region: string;
  // Southern hemisphere seasons run six months off the northern ones
  south: boolean;
  space: Space;
  sun: string;
  zone: string;
}

export interface Recommendation {
  plant: Plant;
  reasons: string[];
  score: number;
}

function list(value: string | string[] | undefined): string[] {
  if (value === undefined) return [];
  return Array.isArray(value) ? value : [value];
}

const REGION = /^[A-Z]{2}(-[A-Z0-9]{1,3})?$/;

export function parsePreferences(params: SearchParams): Preferences {
  const region = list(params.region)[0] ?? "";
  const zone = list(params.zone)[0] ?? "";
  const sun = list(params.sun)[0] ?? "";
  const space = list(params.space)[0] as Space;

  return {
    grow: list(params.grow).filter((value) => GROW_OPTIONS.includes(value)),
    region: REGION.test(region) ? region : "",
    south: list(params.south)[0] === "1",
    space: SPACES.includes(space) ? space : "garden",
    sun: SUN_OPTIONS.includes(sun) ? sun : "",
    zone: HARDINESS_ZONES.includes(zone) ? zone : ""
  };
}

export function toSearch(prefs: Preferences): string {
  const params = new URLSearchParams();
  if (prefs.zone) params.set("zone", prefs.zone);
  if (prefs.region) params.set("region", prefs.region);
  if (prefs.south) params.set("south", "1");
  if (prefs.sun) params.set("sun", prefs.sun);
  if (prefs.space !== "garden") params.set("space", prefs.space);
  prefs.grow.forEach((value) => params.append("grow", value));
  return params.toString();
}

// Rough average last spring and first fall frost (day of year, northern hemisphere)
// for each whole USDA zone. Zones 11 and up rarely see frost.
const FROST_DATES: [number, number][] = [
  [152, 243], // zone 1
  [142, 253],
  [135, 263],
  [130, 273],
  [120, 283],
  [110, 293],
  [95, 303],
  [79, 319],
  [51, 339],
  [31, 354] // zone 10
];

export interface Frost {
  first: number;
  last: number;
}

export function estimateFrost(zone: string): Frost | null {
  const dates = FROST_DATES[parseInt(zone, 10) - 1];
  return dates ? { first: dates[1], last: dates[0] } : null;
}

const YEAR = 365;
const WEEK = 7;
const HALF_YEAR = 182;

function dayOfYear(date: Date): number {
  return Math.floor((Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) -
    Date.UTC(date.getFullYear(), 0, 0)) / 86_400_000);
}

const mod = (day: number) => ((day % YEAR) + YEAR) % YEAR;

// Inclusive window that may wrap past the end of the year
function within(day: number, start: number, end: number): boolean {
  const [d, s, e] = [mod(day), mod(start), mod(end)];
  return s <= e ? d >= s && d <= e : d >= s || d <= e;
}

// "Apr 20" for a northern day of year, shifted back for the southern hemisphere
export function formatDay(day: number, south: boolean): string {
  const date = new Date(Date.UTC(2025, 0, mod(day + (south ? HALF_YEAR : 0))));
  return date.toLocaleDateString("en", { day: "numeric", month: "short", timeZone: "UTC" });
}

const has = (plant: Plant, key: keyof Plant["facets"], value: string) =>
  plant.facets[key]?.includes(value) ?? false;

type Kind = "bulb" | "cool" | "perennial" | "warm" | "woody";

function kindOf(plant: Plant): Kind {
  if (has(plant, "sow_methods", "Bulb") &&
    (has(plant, "bloom_seasons", "Spring") || has(plant, "bloom_seasons", "Late winter"))) return "bulb";
  if (has(plant, "season", "Cool season")) return "cool";
  if (has(plant, "season", "Warm season")) return "warm";
  if (["Tree", "Shrub", "Vine"].includes(plant.group ?? "")) return "woody";
  if (has(plant, "life_cycle", "Annual") || has(plant, "life_cycle", "Biennial")) {
    return has(plant, "frost_tolerance", "Hardy") || has(plant, "frost_tolerance", "Half-hardy") ? "cool" : "warm";
  }
  return "perennial";
}

// Annual crops have to finish between frosts (hardy ones shrug off the first few)
function fitsSeason(plant: Plant, kind: Kind, frost: Frost): boolean {
  if ((kind !== "cool" && kind !== "warm") || plant.maturity_days === null) return true;
  const indoorStart = has(plant, "sow_methods", "Start indoors") ? 6 * WEEK : 0;
  const hardy = kind === "cool" ? 4 * WEEK : 0;
  return plant.maturity_days <= frost.first - frost.last + indoorStart + hardy;
}

interface Timing {
  points: number;
  reason: string;
}

// Whether today falls in the plant's planting window. `day` is already shifted to northern seasons.
function timing(plant: Plant, kind: Kind, frost: Frost | null, day: number, south: boolean): Timing | null {
  if (!frost) {
    if (kind === "cool") {
      return within(day, 274, 59) ? { points: 3, reason: "Cool-season crop: plant now through winter" } : null;
    }
    return { points: 2, reason: "No frost to wait for: plant any time" };
  }

  const { first, last } = frost;
  const lastFrost = formatDay(last, south);
  const indoorStart = has(plant, "sow_methods", "Start indoors");

  switch (kind) {
    case "bulb":
      return within(day, first - 6 * WEEK, first + 6 * WEEK)
        ? { points: 3, reason: "Plant spring bulbs now, before the ground freezes" }
        : null;
    case "cool":
      if (within(day, last - 6 * WEEK, last + 2 * WEEK)) return { points: 3, reason: "Cool-season crop: plant now" };
      if (within(day, first - 10 * WEEK, first - 4 * WEEK)) {
        return { points: 3, reason: "Cool-season crop: plant now for a fall harvest" };
      }
      if (indoorStart && within(day, last - 10 * WEEK, last - 6 * WEEK - 1)) {
        return { points: 2, reason: "Start indoors now for spring" };
      }
      return null;
    case "warm": {
      const cutoff = first - (plant.maturity_days ?? 8 * WEEK) - WEEK;
      if (cutoff >= last && within(day, last, cutoff)) {
        return { points: 3, reason: `Warm-season crop: plant now, it ripens before frost` };
      }
      if (indoorStart && within(day, last - 8 * WEEK, last - 1)) {
        return { points: 2, reason: `Start indoors now, plant out after the last frost (~${lastFrost})` };
      }
      return null;
    }
    case "woody":
      if (within(day, last - 2 * WEEK, last + 8 * WEEK)) return { points: 2, reason: "Spring planting season" };
      if (within(day, first - 8 * WEEK, first + 4 * WEEK)) {
        return { points: 2, reason: "Fall planting season: roots establish over winter" };
      }
      return null;
    case "perennial":
      if (within(day, last - 2 * WEEK, last + 8 * WEEK)) return { points: 2, reason: "Spring planting season" };
      if (within(day, first - 8 * WEEK, first - 2 * WEEK)) return { points: 2, reason: "Fall planting season" };
      return null;
  }
}

const LOW_MAINTENANCE = ["Disease resistant", "Pest resistant", "Drought tolerant"];

function scorePlant(plant: Plant, prefs: Preferences, frost: Frost | null, day: number): Recommendation | null {
  if (!matchesZone(plant, prefs.zone)) return null;
  if (prefs.grow.length && !prefs.grow.some((value) => has(plant, "category", value))) return null;
  if (prefs.space === "container" && !has(plant, "suitable_for", "Containers")) return null;
  if (prefs.space === "indoors" && !has(plant, "suitable_for", "Indoors")) return null;
  // Plants without sun data get the benefit of the doubt
  if (prefs.sun && plant.facets.sun && !plant.facets.sun.includes(prefs.sun)) return null;

  const kind = kindOf(plant);
  const outdoors = prefs.space !== "indoors";
  if (outdoors && frost && !fitsSeason(plant, kind, frost)) return null;

  let score = 0;
  const reasons: string[] = [];
  const add = (points: number, reason: string) => {
    score += points;
    reasons.push(reason);
  };

  if (outdoors) {
    const now = timing(plant, kind, frost, day, prefs.south);
    if (now) add(now.points, now.reason);
  }

  if (prefs.sun && plant.facets.sun) add(3, `Suits ${prefs.sun.toLowerCase()}`);
  if (prefs.space === "container") add(1, "Grows well in containers");
  if (prefs.space === "indoors") add(1, "Grows well indoors");

  // A zone at either end of the range means a harsh winter or summer can hurt it
  const zone = parseInt(prefs.zone, 10);
  const [min, max] = plant.zone_range!;
  if (zone > min && zone < max) add(1, `Comfortably within zones ${min}–${max}`);

  if (plant.facets.water?.includes("Low") ||
    LOW_MAINTENANCE.some((value) => has(plant, "resistances", value))) add(1, "Low maintenance");

  return { plant, reasons, score };
}

// Best matches first; ties keep the input's alphabetical order
export function recommendPlants(plants: Plant[], prefs: Preferences, today = new Date()): Recommendation[] {
  if (!prefs.zone) return [];
  const frost = estimateFrost(prefs.zone);
  const day = mod(dayOfYear(today) + (prefs.south ? HALF_YEAR : 0));

  return plants
    .map((plant) => scorePlant(plant, prefs, frost, day))
    .filter((result): result is Recommendation => result !== null)
    .sort((a, b) => b.score - a.score);
}
