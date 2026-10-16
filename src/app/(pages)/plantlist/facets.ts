// Filterable categories for the plants table. Its columns use a fixed vocabulary
// (see pipeline/attributes.py), so each facet lists its raw values in display
// order, with labels where capitalizing the raw value isn't enough.

type Row = Record<string, unknown>;

export type FacetKey =
  | "bloom_seasons"
  | "category"
  | "edible_parts"
  | "features"
  | "flower_colors"
  | "foliage"
  | "frost_tolerance"
  | "habit"
  | "life_cycle"
  | "resistances"
  | "season"
  | "soil_types"
  | "sow_methods"
  | "suitable_for"
  | "sun"
  | "uses"
  | "water"
  | "wildlife";

export type PlantFacets = Partial<Record<FacetKey, string[]>>;

export interface Facet {
  key: FacetKey;
  label: string;
  options: string[];
}

interface FacetDefinition {
  // Column holding a single value or an array of values, or a function for derived facets
  from: string | ((row: Row) => string[]);
  key: FacetKey;
  label: string;
  labels?: Record<string, string>;
  // Raw values in display order
  values: string[];
}

// The source data files every ornamental under "flower", trees and shrubs included,
// so for those the plant type (or a telling subcategory) decides the category
const HABIT_CATEGORIES: Record<string, string> = {
  "aquatic": "aquatic",
  "cactus/succulent": "succulent",
  "fern": "fern",
  "grass": "grass",
  "shrub": "shrub",
  "tree": "tree",
  "vine": "vine"
};
const SUBCATEGORY_CATEGORIES: [RegExp, string][] = [
  [/\bconifer/, "tree"],
  [/\b(sedge|rush)/, "grass"],
  [/\bground ?cover/, "groundcover"]
];

function category(row: Row): string[] {
  const value = typeof row.category === "string" ? row.category : null;
  if (value !== "flower") return value ? [value] : [];
  const habit = typeof row.habit === "string" ? HABIT_CATEGORIES[row.habit] : undefined;
  const subcategory = String(row.subcategory ?? "").toLowerCase();
  const named = SUBCATEGORY_CATEGORIES.find(([pattern]) => pattern.test(subcategory))?.[1];
  return [habit ?? named ?? "flower"];
}

// Display order of the filter panel
const FACET_DEFINITIONS: FacetDefinition[] = [
  {
    from: category,
    key: "category",
    label: "Category",
    labels: { "cover-crop": "Cover crop" },
    values: ["vegetable", "fruit", "berry", "herb", "flower", "tree", "shrub", "vine", "grass", "fern",
      "succulent", "houseplant", "groundcover", "aquatic", "cover-crop"]
  },
  {
    from: "habit",
    key: "habit",
    label: "Plant type",
    labels: { "cactus/succulent": "Cactus/Succulent", "herb/forb": "Herb/Forb" },
    values: ["herb/forb", "shrub", "tree", "vine", "grass", "fern", "cactus/succulent", "bulb", "aquatic"]
  },
  {
    from: "life_cycle",
    key: "life_cycle",
    label: "Life cycle",
    values: ["annual", "biennial", "perennial"]
  },
  {
    from: "season",
    key: "season",
    label: "Growing season",
    labels: { cool: "Cool season", warm: "Warm season" },
    values: ["cool", "warm"]
  },
  {
    from: "sun",
    key: "sun",
    label: "Sun",
    labels: { full: "Full sun", partial: "Part shade", shade: "Full shade" },
    values: ["full", "partial", "shade"]
  },
  { from: "water", key: "water", label: "Water", values: ["low", "moderate", "high"] },
  {
    from: "frost_tolerance",
    key: "frost_tolerance",
    label: "Frost tolerance",
    values: ["hardy", "half-hardy", "tender"]
  },
  {
    from: "sow_methods",
    key: "sow_methods",
    label: "Planting method",
    labels: { "direct": "Direct sow", "indoor-start": "Start indoors" },
    values: ["direct", "indoor-start", "transplant", "division", "cutting", "bulb", "tuber"]
  },
  {
    from: "soil_types",
    key: "soil_types",
    label: "Soil",
    values: ["sandy", "loamy", "clay", "chalky", "rocky", "well-drained", "moist", "wet", "acidic", "alkaline"]
  },
  {
    from: "bloom_seasons",
    key: "bloom_seasons",
    label: "Bloom time",
    values: ["late winter", "spring", "early summer", "summer", "late summer", "fall", "winter", "year-round"]
  },
  {
    from: "flower_colors",
    key: "flower_colors",
    label: "Flower color",
    labels: { bicolor: "Bi-color" },
    values: ["white", "cream", "yellow", "orange", "red", "pink", "magenta", "purple", "lavender", "blue",
      "green", "brown", "black", "bicolor"]
  },
  {
    from: "foliage",
    key: "foliage",
    label: "Foliage",
    values: ["evergreen", "semi-evergreen", "deciduous", "herbaceous"]
  },
  {
    from: "ornamental_features",
    key: "features",
    label: "Features",
    values: ["showy flowers", "fragrant flowers", "fragrant foliage", "colorful foliage", "variegated",
      "fall color", "winter interest", "ornamental fruit", "ornamental bark"]
  },
  {
    from: "edible_parts",
    key: "edible_parts",
    label: "Edible parts",
    values: ["fruit", "leaves", "roots", "tubers", "bulbs", "stems", "flowers", "seeds", "pods", "nuts", "sap"]
  },
  {
    from: "uses",
    key: "uses",
    label: "Uses",
    values: ["culinary", "medicinal", "ornamental", "cut flower", "dried flower", "hedge", "screen", "windbreak",
      "groundcover", "erosion control", "container", "houseplant", "rock garden", "rain garden", "water garden",
      "xeriscape", "pollinator garden", "cover crop", "forage", "shade tree", "street tree", "naturalizing", "dye"]
  },
  {
    from: "wildlife",
    key: "wildlife",
    label: "Attracts",
    labels: { "caterpillar host": "Caterpillar host plant" },
    values: ["bees", "butterflies", "hummingbirds", "birds", "moths", "beneficial insects", "caterpillar host"]
  },
  {
    from: "resistances",
    key: "resistances",
    label: "Resistances",
    labels: {
      "deer": "Deer resistant",
      "disease": "Disease resistant",
      "drought": "Drought tolerant",
      "dry shade": "Tolerates dry shade",
      "foot traffic": "Tolerates foot traffic",
      "heat": "Heat tolerant",
      "humidity": "Humidity tolerant",
      "juglone": "Juglone tolerant",
      "pests": "Pest resistant",
      "pollution": "Pollution tolerant",
      "powdery mildew": "Mildew resistant",
      "rabbit": "Rabbit resistant",
      "salt": "Salt tolerant",
      "wet soil": "Tolerates wet soil"
    },
    values: ["deer", "rabbit", "drought", "heat", "humidity", "salt", "pollution", "juglone", "foot traffic",
      "wet soil", "dry shade", "powdery mildew", "disease", "pests"]
  },
  {
    from: (row) => [
      ...(row.container_suitable === true ? ["containers"] : []),
      ...(row.indoor_suitable === true ? ["indoors"] : [])
    ],
    key: "suitable_for",
    label: "Grows well in",
    values: ["containers", "indoors"]
  }
];

function capitalize(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

const LABELS = new Map(FACET_DEFINITIONS.map((definition) => [
  definition.key,
  new Map(definition.values.map((raw) => [raw, definition.labels?.[raw] ?? capitalize(raw)]))
]));

// Display label for a raw column value, e.g. ("sun", "partial") -> "Part shade"
export function facetLabel(key: FacetKey, raw: string): string {
  return LABELS.get(key)?.get(raw) ?? capitalize(raw);
}

function rawValues(from: FacetDefinition["from"], row: Row): string[] {
  if (typeof from === "function") return from(row);
  const value = row[from];
  if (Array.isArray(value)) return value.filter((v): v is string => typeof v === "string");
  return typeof value === "string" && value ? [value] : [];
}

export function extractFacets(row: Row): PlantFacets {
  const facets: PlantFacets = {};
  for (const definition of FACET_DEFINITIONS) {
    const labels = LABELS.get(definition.key)!;
    // Values outside the vocabulary are ignored
    const values = rawValues(definition.from, row).flatMap((raw) => labels.get(raw) ?? []);
    if (values.length) facets[definition.key] = values;
  }
  return facets;
}

// Facets with only the options that occur in the data
export function buildFacets(plants: { facets: PlantFacets }[]): Facet[] {
  const present = new Map<FacetKey, Set<string>>();
  for (const { facets } of plants) {
    for (const [key, values] of Object.entries(facets) as [FacetKey, string[]][]) {
      const set = present.get(key) ?? new Set<string>();
      values.forEach((value) => set.add(value));
      present.set(key, set);
    }
  }

  return FACET_DEFINITIONS.map(({ key, label }) => {
    const found = present.get(key) ?? new Set<string>();
    return { key, label, options: [...LABELS.get(key)!.values()].filter((option) => found.has(option)) };
  }).filter((facet) => facet.options.length > 0);
}

export interface PlantZone {
  // Whole-number USDA range the plant grows in
  zone_range: [number, number] | null;
}

// A plant matches any zone inside its range; "6b" counts as zone 6
export function matchesZone(plant: PlantZone, selected: string): boolean {
  if (!plant.zone_range) return false;
  const zone = parseInt(selected, 10);
  return zone >= plant.zone_range[0] && zone <= plant.zone_range[1];
}

export const HARDINESS_ZONES = Array.from({ length: 13 }, (_, i) => [`${i + 1}a`, `${i + 1}b`]).flat();
