// Filterable categories of the flowers table. Most columns hold comma-joined
// garden.org vocabulary mixed with free text ("Other: ..."), so each facet lists
// its known values and anything outside that list is ignored.

export type FacetKey =
  | "bloom_size"
  | "containers"
  | "flower_color"
  | "flower_group"
  | "flower_time"
  | "flowers"
  | "fruit"
  | "leaves"
  | "life_cycle"
  | "miscellaneous"
  | "plant_habit"
  | "resistances"
  | "soil_pH_preferences"
  | "suitable_locations"
  | "sun_requirements"
  | "uses"
  | "wildlife_attractant";

export type FlowerFacets = Partial<Record<FacetKey, string[]>>;

export interface Facet {
  key: FacetKey;
  label: string;
  options: string[];
}

// Display order of the filter panel; flower_group options come from the data
const FACET_VOCABULARY: Facet[] = [
  {
    key: "plant_habit",
    label: "Plant type",
    options: ["Herb/Forb", "Shrub", "Tree", "Vine", "Cactus/Succulent", "Grass/Grass-like"]
  },
  { key: "flower_group", label: "Group", options: [] },
  { key: "life_cycle", label: "Life cycle", options: ["Annual", "Biennial", "Perennial"] },
  {
    key: "sun_requirements",
    label: "Sun",
    options: [
      "Full Sun",
      "Full Sun to Partial Shade",
      "Partial or Dappled Shade",
      "Partial Shade to Full Shade",
      "Full Shade"
    ]
  },
  {
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
    key: "bloom_size",
    label: "Bloom size",
    options: ["Under 1\"", "1\"-2\"", "2\"-3\"", "3\"-4\"", "4\"-5\"", "5\"-6\"", "6\"-12\"", "Over 12\""]
  },
  {
    key: "flowers",
    label: "Flowers",
    options: ["Showy", "Fragrant", "Inconspicuous", "Malodorous", "Blooms on old wood", "Blooms on new wood"]
  },
  {
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
  { key: "fruit", label: "Fruit", options: ["Showy", "Edible to birds", "Dehiscent"] },
  {
    key: "uses",
    label: "Uses",
    options: [
      "Cut Flower",
      "Dried Flower",
      "Vegetable",
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
      "Good as a cover crop",
      "Suitable for forage",
      "Useful for timber production",
      "Dye production"
    ]
  },
  {
    key: "wildlife_attractant",
    label: "Attracts",
    options: ["Bees", "Butterflies", "Hummingbirds", "Birds", "Other Beneficial Insects"]
  },
  {
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

// Lowercased value -> canonical option, per facet
const LOOKUP = new Map(
  FACET_VOCABULARY.map(({ key, options }) => [
    key,
    new Map(options.map((option) => [option.toLowerCase(), option]))
  ])
);

// "Neutral (6.6 – 7.3), Bi-Color: pink/white" -> ["neutral", "bi-color"]
function splitValues(raw: string): string[] {
  return raw
    .split(/,(?![^()]*\))/)
    .map((token) => token.replace(/\([^)]*\)/g, "").split(":")[0].trim().toLowerCase())
    .filter(Boolean);
}

export function extractFacets(row: Record<string, unknown>): FlowerFacets {
  const facets: FlowerFacets = {};

  for (const [key, lookup] of LOOKUP) {
    const raw = row[key];
    if (typeof raw !== "string" || !raw.trim()) continue;

    if (key === "flower_group") {
      facets[key] = [raw.trim().toLowerCase()];
      continue;
    }

    const values = new Set<string>();
    for (const token of splitValues(raw)) {
      const option = lookup.get(token);
      if (option) values.add(option);
    }
    if (values.size) facets[key] = [...values];
  }

  return facets;
}

// Facets with only the options that occur in the data
export function buildFacets(flowers: { facets: FlowerFacets }[]): Facet[] {
  const present = new Map<FacetKey, Set<string>>();
  for (const { facets } of flowers) {
    for (const [key, values] of Object.entries(facets) as [FacetKey, string[]][]) {
      const set = present.get(key) ?? new Set<string>();
      values.forEach((value) => set.add(value));
      present.set(key, set);
    }
  }

  return FACET_VOCABULARY.map((facet) => {
    const found = present.get(facet.key) ?? new Set<string>();
    const options = facet.key === "flower_group"
      ? [...found].sort()
      : facet.options.filter((option) => found.has(option));
    return { ...facet, options };
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

// Exact match; a zone without a/b ("3") matches both halves of that zone
export function matchesZone(plantZone: string | null, selected: string): boolean {
  if (!plantZone) return false;
  return plantZone === selected || plantZone === selected.replace(/[ab]$/, "");
}

export const HARDINESS_ZONES = Array.from({ length: 13 }, (_, i) => [`${i + 1}a`, `${i + 1}b`]).flat();
