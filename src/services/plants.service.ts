import { createServerClient } from "@/src/lib/supabase/client";
import { revalidationTime } from "@/src/constants/supabase";
import { unstable_cache } from "next/cache";

const databaseName = "plants";

// Columns the plant list needs; the full rows are too large to cache in bulk
const LIST_COLUMNS = [
  "uuid",
  "common_name",
  "scientific_name",
  "wikipedia_url",
  "category",
  "subcategory",
  "habit",
  "life_cycle",
  "foliage",
  "season",
  "frost_tolerance",
  "usda_zone_min",
  "usda_zone_max",
  "sun",
  "water",
  "soil_types",
  "height_in_min",
  "height_in_max",
  "maturity_days_min",
  "maturity_days_max",
  "sow_methods",
  "bloom_seasons",
  "flower_colors",
  "ornamental_features",
  "edible_parts",
  "uses",
  "wildlife",
  "resistances",
  "container_suitable",
  "indoor_suitable"
].join(", ");

// Supabase returns at most 1000 rows per select by default
const LIST_PAGE_SIZE = 1000;

// Cached per page so each cache entry stays under Next's 2MB limit
const getPlantListPage = unstable_cache(
  async (page: number) => {
    const supabase = createServerClient();
    const { data, error } = await supabase
      .from(databaseName)
      .select(LIST_COLUMNS)
      .order("uuid")
      .range(page * LIST_PAGE_SIZE, (page + 1) * LIST_PAGE_SIZE - 1);
    if (error) throw new Error(error.message);
    return data as unknown as Record<string, unknown>[];
  },
  ["plants-list-page"],
  { revalidate: revalidationTime, tags: [databaseName] }
);

async function getPlantList() {
  const rows: Record<string, unknown>[] = [];
  for (let page = 0; ; page++) {
    const batch = await getPlantListPage(page);
    rows.push(...batch);
    if (batch.length < LIST_PAGE_SIZE) return rows;
  }
}

export { getPlantList };
