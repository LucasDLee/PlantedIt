import { type Facet, type FacetKey, HARDINESS_ZONES, matchesZone } from "./facets";
import type { Plant } from "./components/plant-card";

// Filters live in the URL: ?q=rose&zone=6b&sun=Full+sun&sun=Part+shade&show=96
export const PAGE_SIZE = 48;
const MAX_SHOWN = 2000;

export type Selection = Partial<Record<FacetKey, string[]>>;
export type FacetCounts = Partial<Record<FacetKey, Record<string, number>>>;
export type SearchParams = Record<string, string | string[] | undefined>;

export interface PlantFilters {
  query: string;
  selected: Selection;
  zone: string;
}

function list(value: string | string[] | undefined): string[] {
  if (value === undefined) return [];
  return Array.isArray(value) ? value : [value];
}

export function parseFilters(params: SearchParams, facets: Facet[]): PlantFilters & { show: number } {
  const selected: Selection = {};
  for (const facet of facets) {
    const values = list(params[facet.key]).filter((value) => facet.options.includes(value));
    if (values.length) selected[facet.key] = values;
  }

  const zone = list(params.zone)[0] ?? "";
  const show = Number(list(params.show)[0]);

  return {
    query: list(params.q)[0]?.trim() ?? "",
    selected,
    show: Number.isInteger(show) ? Math.min(Math.max(show, PAGE_SIZE), MAX_SHOWN) : PAGE_SIZE,
    zone: HARDINESS_ZONES.includes(zone) ? zone : ""
  };
}

export function toSearch(filters: PlantFilters, show = PAGE_SIZE): string {
  const params = new URLSearchParams();
  if (filters.query.trim()) params.set("q", filters.query.trim());
  if (filters.zone) params.set("zone", filters.zone);
  for (const [key, values] of Object.entries(filters.selected)) {
    values.forEach((value) => params.append(key, value));
  }
  if (show > PAGE_SIZE) params.set("show", String(show));
  return params.toString();
}

// Values within a facet are OR'd, facets are AND'd. `skip` ignores one facet,
// which gives each facet's option counts as if that facet were unfiltered.
function matchesSelection(plant: Plant, selected: Selection, skip?: FacetKey): boolean {
  return (Object.entries(selected) as [FacetKey, string[]][]).every(([key, values]) =>
    key === skip || values.some((value) => plant.facets[key]?.includes(value))
  );
}

function tally(plants: Plant[], key: FacetKey): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const plant of plants) {
    for (const value of plant.facets[key] ?? []) counts[value] = (counts[value] ?? 0) + 1;
  }
  return counts;
}

export function filterPlants(plants: Plant[], filters: PlantFilters, facets: Facet[]) {
  const q = filters.query.toLowerCase();

  // Search and zone narrow the pool every facet counts from
  const base = plants.filter((plant) =>
    (!q ||
      plant.name.toLowerCase().includes(q) ||
      (plant.scientific_name ?? "").toLowerCase().includes(q) ||
      (plant.group ?? "").toLowerCase().includes(q)) &&
    (!filters.zone || matchesZone(plant, filters.zone))
  );
  const results = base.filter((plant) => matchesSelection(plant, filters.selected));

  const counts: FacetCounts = {};
  for (const { key } of facets) {
    counts[key] = filters.selected[key]
      ? tally(base.filter((plant) => matchesSelection(plant, filters.selected, key)), key)
      : tally(results, key);
  }

  return { counts, results };
}
