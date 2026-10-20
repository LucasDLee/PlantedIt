import { extractFacets, facetLabel } from "./facets";
import type { Plant } from "./components/plant-card";
import { getPlantList } from "@/src/services/plants.service";

type Row = Record<string, unknown>;

function text(value: unknown): string | null {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function num(value: unknown): number | null {
  if (value === null || value === undefined || value === "") return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

// Drops rows without a value
function details(rows: [string, string | null | undefined][]): [string, string][] {
  return rows.filter((row): row is [string, string] => Boolean(row[1]));
}

function range(min: number | null, max: number | null, unit: string): string | null {
  if (min === null && max === null) return null;
  if (min === null || max === null || min === max) return `${min ?? max} ${unit}`;
  return `${min}–${max} ${unit}`;
}

// Inches, switching to feet for taller plants
function height(min: number | null, max: number | null): string | null {
  if ((max ?? min ?? 0) < 48) return range(min, max, "in");
  const feet = (inches: number | null) => (inches === null ? null : Math.round(inches / 12));
  return range(feet(min), feet(max), "ft");
}

// Days, switching to years for long-lived crops
function maturity(min: number | null, max: number | null): string | null {
  if ((max ?? min ?? 0) < 365) return range(min, max, "days");
  const years = (days: number | null) => (days === null ? null : Math.max(1, Math.round(days / 365)));
  return range(years(min), years(max), "years");
}

function capitalize(value: string | null): string | null {
  return value && value.charAt(0).toUpperCase() + value.slice(1);
}

const MAX_ZONE = 13;

// A plant with only one end of its range known (e.g. coldest zone) is open-ended
function zoneRange(min: number | null, max: number | null): [number, number] | null {
  if (min === null && max === null) return null;
  return [min ?? 1, max ?? MAX_ZONE];
}

function zoneLabel(min: number | null, max: number | null): string | null {
  if (min === null && max === null) return null;
  if (max === null) return `Zones ${min}+`;
  if (min === null) return `Zones 1–${max}`;
  return min === max ? `Zone ${min}` : `Zones ${min}–${max}`;
}

function fromPlant(row: Row): Plant {
  const facets = extractFacets(row);
  const zoneMin = num(row.usda_zone_min);
  const zoneMax = num(row.usda_zone_max);
  const scientific = text(row.scientific_name);
  const habit = text(row.habit);
  const maturityMin = num(row.maturity_days_min);
  const maturityMax = num(row.maturity_days_max);
  // Many iNaturalist common names are lowercase ("tomato")
  const name = capitalize(text(row.common_name)) ?? scientific ?? "Unnamed plant";

  return {
    details: details([
      ["Type", capitalize(text(row.subcategory)) ?? (habit && facetLabel("habit", habit))],
      ["Sun", facets.sun?.[0]],
      ["Water", facets.water?.[0]],
      ["Height", height(num(row.height_in_min), num(row.height_in_max))],
      ["Maturity", maturity(maturityMin, maturityMax)]
    ]),
    facets,
    group: facets.category?.[0] ?? null,
    maturity_days: maturityMax ?? maturityMin,
    name,
    scientific_name: scientific !== name ? scientific : null,
    url: text(row.wikipedia_url),
    uuid: String(row.uuid),
    zone_label: zoneLabel(zoneMin, zoneMax),
    zone_range: zoneRange(zoneMin, zoneMax)
  };
}

// Ignores punctuation so names like "'ohelo" sort under O, not before A
const collator = new Intl.Collator("en", { ignorePunctuation: true, sensitivity: "base" });

// One card per species, alphabetical
export async function getAllPlants(): Promise<Plant[]> {
  const rows = await getPlantList();
  return rows.map(fromPlant).sort((a, b) => collator.compare(a.name, b.name));
}
