// Filterable categories across the flowers and farming tables. Flowers columns
// hold comma-joined garden.org vocabulary mixed with free text ("Other: ..."),
// so each facet lists its known values and anything outside that list is ignored.

export type PlantSource = "farming" | "flowers";

type Row = Record<string, unknown>;

export type FacetKey =
  | "bloom_size"
  | "category"
  | "containers"
  | "flower_color"
  | "flower_group"
  | "flower_time"
  | "flowers"
  | "frost_tolerance"
  | "fruit"
  | "leaves"
  | "life_cycle"
  | "miscellaneous"
  | "plant_habit"
  | "resistances"
  | "season"
  | "soil_pH_preferences"
  | "sow_method"
  | "suitable_locations"
  | "sun"
  | "uses"
  | "water"
  | "wildlife_attractant";

export type PlantFacets = Partial<Record<FacetKey, string[]>>;

export interface Facet {
  key: FacetKey;
  label: string;
  options: string[];
}

// Either column(s) whose values map through a lookup, or a function for
// values that need more than a lookup
type FacetSource =
  | {
    column: string | string[];
    // Lowercased raw value -> option(s); defaults to the options themselves
    values?: Record<string, string | string[]>;
  }
  | ((row: Row) => string[]);

interface FacetDefinition extends Facet {
  farming?: FacetSource;
  flowers?: FacetSource;
}

// Flower groups that are crops; every other group counts as "Flower"
const FLOWER_GROUP_CATEGORIES: Record<string, string> = {
  apples: "Fruit",
  apricots: "Fruit",
  artichokes: "Vegetable",
  asparagus: "Vegetable",
  basil: "Herb",
  beans: "Vegetable",
  beets: "Vegetable",
  brassicas: "Vegetable",
  cantaloupes: "Vegetable",
  carrots: "Vegetable",
  celery: "Vegetable",
  cherries: "Fruit",
  chives: "Herb",
  cilantro: "Herb",
  citrus: "Fruit",
  corn: "Vegetable",
  cucumbers: "Vegetable",
  cucurbits: "Vegetable",
  dill: "Herb",
  eggplants: "Vegetable",
  figs: "Fruit",
  garlic: "Vegetable",
  jujubes: "Fruit",
  leeks: "Vegetable",
  lettuces: "Vegetable",
  marjoram: "Herb",
  mints: "Herb",
  okra: "Vegetable",
  onions: "Vegetable",
  oregano: "Herb",
  parsley: "Herb",
  parsnips: "Vegetable",
  peaches: "Fruit",
  pears: "Fruit",
  peas: "Vegetable",
  peppers: "Vegetable",
  plums: "Fruit",
  potatoes: "Vegetable",
  radishes: "Vegetable",
  rhubarbs: "Vegetable",
  ribes: "Berry",
  rubus: "Berry",
  sage: "Herb",
  spinach: "Vegetable",
  strawberries: "Berry",
  sunroots: "Vegetable",
  sweetpotatoes: "Vegetable",
  swisschard: "Vegetable",
  tarragon: "Herb",
  thyme: "Herb",
  tomatoes: "Vegetable",
  turnips: "Vegetable",
  vitis: "Fruit"
};

function flowerCategory(row: Row): string[] {
  const group = String(row.flower_group ?? "").trim().toLowerCase();
  return group ? [FLOWER_GROUP_CATEGORIES[group] ?? "Flower"] : [];
}

// Farming subcategories describe the habit in free text ("tree fruit", "evergreen shrub")
const SUBCATEGORY_HABITS: [RegExp, string][] = [
  [/\btrees?\b/, "Tree"],
  [/\bshrubs?\b/, "Shrub"],
  [/\bvines?\b/, "Vine"],
  [/\b(grass|bamboo)/, "Grass/Grass-like"],
  [/\b(succulent|cact)/, "Cactus/Succulent"]
];

function farmingHabit(row: Row): string[] {
  const subcategory = String(row.subcategory ?? "").toLowerCase();
  return SUBCATEGORY_HABITS.filter(([pattern]) => pattern.test(subcategory)).map(([, habit]) => habit);
}

// A life cycle named in the subcategory wins; otherwise warm- and cool-season
// crops are grown as annuals
function farmingLifeCycle(row: Row): string[] {
  const subcategory = String(row.subcategory ?? "").toLowerCase();
  const named = ["Annual", "Biennial", "Perennial"].find((cycle) => subcategory.includes(cycle.toLowerCase()));
  if (named) return [named];
  if (row.season === "perennial") return ["Perennial"];
  return row.season === "warm" || row.season === "cool" ? ["Annual"] : [];
}

// Display order of the filter panel; flower_group options come from the data
const FACET_DEFINITIONS: FacetDefinition[] = [
  {
    farming: {
      column: "category",
      values: {
        "berry": "Berry",
        "cover-crop": "Cover crop",
        "flower": "Flower",
        "fruit": "Fruit",
        "herb": "Herb",
        "vegetable": "Vegetable"
      }
    },
    flowers: flowerCategory,
    key: "category",
    label: "Category",
    options: ["Vegetable", "Fruit", "Berry", "Herb", "Flower", "Cover crop"]
  },
  {
    farming: farmingHabit,
    flowers: { column: "plant_habit" },
    key: "plant_habit",
    label: "Plant type",
    options: ["Herb/Forb", "Shrub", "Tree", "Vine", "Cactus/Succulent", "Grass/Grass-like"]
  },
  { flowers: { column: "flower_group" }, key: "flower_group", label: "Group", options: [] },
  {
    farming: farmingLifeCycle,
    flowers: { column: "life_cycle" },
    key: "life_cycle",
    label: "Life cycle",
    options: ["Annual", "Biennial", "Perennial"]
  },
  {
    farming: { column: "season", values: { cool: "Cool season", warm: "Warm season" } },
    key: "season",
    label: "Growing season",
    options: ["Cool season", "Warm season"]
  },
  {
    farming: {
      column: "sun",
      values: { full: "Full sun", partial: "Part shade", shade: "Full shade" }
    },
    flowers: {
      column: "sun_requirements",
      values: {
        "full shade": "Full shade",
        "full sun": "Full sun",
        "full sun to partial shade": ["Full sun", "Part shade"],
        "partial or dappled shade": "Part shade",
        "partial shade to full shade": ["Part shade", "Full shade"]
      }
    },
    key: "sun",
    label: "Sun",
    options: ["Full sun", "Part shade", "Full shade"]
  },
  {
    farming: { column: "water", values: { high: "High", low: "Low", moderate: "Moderate" } },
    key: "water",
    label: "Water",
    options: ["Low", "Moderate", "High"]
  },
  {
    farming: {
      column: "frost_tolerance",
      values: { "half-hardy": "Half-hardy", "hardy": "Hardy", "tender": "Tender" }
    },
    key: "frost_tolerance",
    label: "Frost tolerance",
    options: ["Hardy", "Half-hardy", "Tender"]
  },
  {
    farming: {
      column: "sow_method",
      values: {
        "bulb": "Bulb",
        "cutting": "Cutting",
        "direct": "Direct sow",
        "division": "Division",
        "indoor-start": "Start indoors",
        "transplant": "Transplant",
        "tuber": "Tuber"
      }
    },
    flowers: {
      column: ["propagation_seeds", "propagation_other_methods"],
      values: {
        "bulbs": "Bulb",
        "cuttings": "Cutting",
        "division": "Division",
        "sow in situ": "Direct sow",
        "start indoors": "Start indoors"
      }
    },
    key: "sow_method",
    label: "Planting method",
    options: ["Direct sow", "Start indoors", "Transplant", "Division", "Cutting", "Bulb", "Tuber"]
  },
  {
    flowers: { column: "flower_time" },
    key: "flower_time",
    label: "Bloom time",
    options: [
      "Late winter or early spring",
      "Spring",
      "Late spring or early summer",
      "Summer",
      "Late summer or early fall",
      "Fall",
      "Late fall or early winter",
      "Winter",
      "Year Round"
    ]
  },
  {
    flowers: { column: "flower_color" },
    key: "flower_color",
    label: "Flower color",
    options: [
      "White",
      "Pink",
      "Red",
      "Orange",
      "Yellow",
      "Green",
      "Blue",
      "Lavender",
      "Purple",
      "Mauve",
      "Brown",
      "Bi-Color",
      "Multi-Color"
    ]
  },
  {
    flowers: { column: "bloom_size" },
    key: "bloom_size",
    label: "Bloom size",
    options: ["Under 1\"", "1\"-2\"", "2\"-3\"", "3\"-4\"", "4\"-5\"", "5\"-6\"", "6\"-12\"", "Over 12\""]
  },
  {
    flowers: { column: "flowers" },
    key: "flowers",
    label: "Flowers",
    options: ["Showy", "Fragrant", "Inconspicuous", "Malodorous", "Blooms on old wood", "Blooms on new wood"]
  },
  {
    flowers: { column: "leaves" },
    key: "leaves",
    label: "Foliage",
    options: [
      "Deciduous",
      "Evergreen",
      "Semi-evergreen",
      "Good fall color",
      "Unusual foliage color",
      "Variegated",
      "Fragrant",
      "Glaucous",
      "Broadleaf",
      "Needled",
      "Spring ephemeral"
    ]
  },
  {
    flowers: { column: "fruit" },
    key: "fruit",
    label: "Fruit",
    options: ["Showy", "Edible to birds", "Dehiscent"]
  },
  {
    flowers: { column: "uses" },
    key: "uses",
    label: "Uses",
    options: [
      "Cut Flower",
      "Dried Flower",
      "Culinary Herb",
      "Medicinal Herb",
      "Salad greens",
      "Cooked greens",
      "Groundcover",
      "Will Naturalize",
      "Suitable as Annual",
      "Provides winter interest",
      "Flowering Tree",
      "Shade Tree",
      "Windbreak or Hedge",
      "Erosion control",
      "Suitable for miniature gardens",
      "Water gardens",
      "Guardian plant",
      "Suitable for forage",
      "Useful for timber production",
      "Dye production"
    ]
  },
  {
    flowers: { column: "wildlife_attractant" },
    key: "wildlife_attractant",
    label: "Attracts",
    options: ["Bees", "Butterflies", "Hummingbirds", "Birds", "Other Beneficial Insects"]
  },
  {
    flowers: { column: "resistances" },
    key: "resistances",
    label: "Resistances",
    options: [
      "Deer Resistant",
      "Rabbit Resistant",
      "Drought tolerant",
      "Humidity tolerant",
      "Salt tolerant",
      "Powdery Mildew",
      "Gophers/Voles",
      "Squirrels",
      "Birds",
      "Tolerates dry shade",
      "Pollution",
      "Flood Resistant",
      "Fire Resistant",
      "Tolerates foot traffic"
    ]
  },
  {
    flowers: { column: "suitable_locations" },
    key: "suitable_locations",
    label: "Suitable for",
    options: [
      "Xeriscapic",
      "Houseplant",
      "Patio/Ornamental/Small Tree",
      "Street Tree",
      "Espalier",
      "Topiary",
      "Beach Front",
      "Alpine Gardening",
      "Bog gardening",
      "Terrariums"
    ]
  },
  {
    flowers: { column: "containers" },
    key: "containers",
    label: "Containers",
    options: [
      "Suitable in 1 gallon",
      "Suitable in 3 gallon or larger",
      "Suitable for hanging baskets",
      "Needs excellent drainage in pots",
      "Needs repotting every 2 to 3 years",
      "Prefers to be under-potted",
      "Not suitable for containers"
    ]
  },
  {
    flowers: { column: "soil_pH_preferences" },
    key: "soil_pH_preferences",
    label: "Soil pH",
    options: [
      "Very strongly acid",
      "Strongly acid",
      "Moderately acid",
      "Slightly acid",
      "Neutral",
      "Slightly alkaline",
      "Moderately alkaline"
    ]
  },
  {
    flowers: { column: "miscellaneous" },
    key: "miscellaneous",
    label: "Traits",
    options: [
      "Tolerates poor soil",
      "Goes Dormant",
      "With thorns/spines/prickles/teeth",
      "Carnivorous",
      "Monocarpic",
      "Monoecious",
      "Dioecious"
    ]
  }
];

// Lowercased raw value -> options, per facet source
const LOOKUPS = new Map<FacetSource, Map<string, string[]>>();
for (const definition of FACET_DEFINITIONS) {
  for (const from of [definition.farming, definition.flowers]) {
    if (!from || typeof from === "function") continue;
    const entries: [string, string | string[]][] = from.values
      ? Object.entries(from.values)
      : definition.options.map((option) => [option.toLowerCase(), option]);
    LOOKUPS.set(from, new Map(entries.map(([raw, options]) => [raw, [options].flat()])));
  }
}

// "Neutral (6.6 – 7.3), Bi-Color: pink/white" -> ["neutral", "bi-color"]
function splitValues(raw: string): string[] {
  return raw
    .split(/,(?![^()]*\))/)
    .map((token) => token.replace(/\([^)]*\)/g, "").split(":")[0].trim().toLowerCase())
    .filter(Boolean);
}

function sourceValues(from: FacetSource, key: FacetKey, row: Row): string[] {
  if (typeof from === "function") return from(row);

  const lookup = LOOKUPS.get(from)!;
  const values = new Set<string>();
  for (const column of [from.column].flat()) {
    const raw = row[column];
    if (typeof raw !== "string" || !raw.trim()) continue;

    if (key === "flower_group") {
      values.add(raw.trim().toLowerCase());
      continue;
    }
    for (const token of splitValues(raw)) {
      lookup.get(token)?.forEach((option) => values.add(option));
    }
  }
  return [...values];
}

export function extractFacets(source: PlantSource, row: Row): PlantFacets {
  const facets: PlantFacets = {};

  for (const definition of FACET_DEFINITIONS) {
    const from = definition[source];
    if (!from) continue;
    const values = sourceValues(from, definition.key, row);
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

  return FACET_DEFINITIONS.map(({ key, label, options }) => {
    const found = present.get(key) ?? new Set<string>();
    return {
      key,
      label,
      options: key === "flower_group" ? [...found].sort() : options.filter((option) => found.has(option))
    };
  }).filter((facet) => facet.options.length > 0);
}

// "morning-glories" -> "Morning glories"
export function formatGroup(group: string): string {
  const words = group.replace(/-/g, " ");
  return words.charAt(0).toUpperCase() + words.slice(1);
}

export function formatOption(key: FacetKey, value: string): string {
  return key === "flower_group" ? formatGroup(value) : value;
}

// "Zone 4a -34.4 °C ..." -> "4a", "Zone 3 -40 °C ..." -> "3"
export function parseZone(value: string): string | null {
  const match = value.trim().match(/^(?:zone\s+)?(\d{1,2})([ab])?/i);
  if (!match) return null;
  return match[1] + (match[2]?.toLowerCase() ?? "");
}

export interface PlantZone {
  // Flowers: minimum cold hardiness, e.g. "4a"
  hardiness_zone: string | null;
  // Farming: whole-number USDA range the plant grows in
  zone_range: [number, number] | null;
}

// Flowers match their zone exactly, and a zone without a/b ("3") matches both
// halves. Farming plants match any zone inside their range.
export function matchesZone(plant: PlantZone, selected: string): boolean {
  if (plant.zone_range) {
    const zone = parseInt(selected, 10);
    return zone >= plant.zone_range[0] && zone <= plant.zone_range[1];
  }
  if (!plant.hardiness_zone) return false;
  return plant.hardiness_zone === selected || plant.hardiness_zone === selected.replace(/[ab]$/, "");
}

export const HARDINESS_ZONES = Array.from({ length: 13 }, (_, i) => [`${i + 1}a`, `${i + 1}b`]).flat();
