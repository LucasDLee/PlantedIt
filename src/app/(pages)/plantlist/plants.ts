import { extractFacets, formatGroup, parseZone } from "./facets";
import type { Plant } from "./components/plant-card";
import { getAllFlowers } from "@/src/services/flowers.service";
import { getFoodList } from "@/src/services/farming.service";

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

function fromFlower(row: Row): Plant {
  const hardiness = text(row.minimum_cold_hardiness);
  const zone = hardiness && parseZone(hardiness);
  const group = text(row.flower_group);

  return {
    details: details([
      // "Full Sun, Full Sun to Partial Shade" -> "Full Sun"
      ["Sun", text(row.sun_requirements)?.split(",")[0].trim()],
      ["Life cycle", text(row.life_cycle)],
      ["Height", text(row.plant_height)],
      ["Color", text(row.flower_color)]
    ]),
    facets: extractFacets("flowers", row),
    group: group && formatGroup(group),
    hardiness_zone: zone,
    name: text(row.flower_name) ?? "Unnamed plant",
    scientific_name: null,
    url: text(row.url),
    uuid: String(row.uuid),
    zone_label: zone ? `Zone ${zone}` : null,
    zone_range: null
  };
}

function fromFarming(row: Row): Plant {
  const facets = extractFacets("farming", row);
  const zoneMin = num(row.usda_zone_min);
  const zoneMax = num(row.usda_zone_max);
  const zoneRange: [number, number] | null =
    zoneMin !== null && zoneMax !== null ? [zoneMin, zoneMax] : null;

  return {
    details: details([
      ["Type", capitalize(text(row.subcategory))],
      ["Sun", facets.sun?.[0]],
      ["Water", facets.water?.[0]],
      ["Height", height(num(row.height_in_min), num(row.height_in_max))],
      ["Maturity", maturity(num(row.maturity_days_min), num(row.maturity_days_max))]
    ]),
    facets,
    group: facets.category?.[0] ?? null,
    hardiness_zone: null,
    name: text(row.common_name) ?? "Unnamed plant",
    scientific_name: text(row.scientific_name),
    url: null,
    uuid: String(row.uuid),
    zone_label: zoneRange ? `Zones ${zoneRange[0]}–${zoneRange[1]}` : null,
    zone_range: zoneRange
  };
}

const collator = new Intl.Collator("en", { sensitivity: "base" });

// Both tables as one alphabetical list
export async function getAllPlants(): Promise<Plant[]> {
  const [flowers, farming] = await Promise.all([getAllFlowers(), getFoodList()]);
  return [...flowers.map(fromFlower), ...farming.map(fromFarming)]
    .sort((a, b) => collator.compare(a.name, b.name));
}
