import { createServerClient } from "@/src/lib/supabase/client";
import { revalidationTime } from "@/src/constants/supabase";
import { unstable_cache } from "next/cache";

const databaseName = "farming";

const getAllFood = unstable_cache(
  async () => {
    const supabase = createServerClient();
    const { data, error } = await supabase.from(databaseName).select();
    if (error) throw new Error(error.message);
    return data;
  },
  ["farming-all"],
  { revalidate: revalidationTime, tags: [databaseName] }
);

// Columns the plant list needs; the full rows are too large to cache in bulk
const LIST_COLUMNS = [
  "uuid",
  "common_name",
  "scientific_name",
  "category",
  "subcategory",
  "sow_method",
  "season",
  "frost_tolerance",
  "usda_zone_min",
  "usda_zone_max",
  "height_in_min",
  "height_in_max",
  "sun",
  "water",
  "maturity_days_min",
  "maturity_days_max"
].join(", ");

// Supabase returns at most 1000 rows per select by default
const LIST_PAGE_SIZE = 1000;

// Cached per page so each cache entry stays under Next's 2MB limit
const getFoodListPage = unstable_cache(
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
  ["farming-list-page"],
  { revalidate: revalidationTime, tags: [databaseName] }
);

async function getFoodList() {
  const rows: Record<string, unknown>[] = [];
  for (let page = 0; ; page++) {
    const batch = await getFoodListPage(page);
    rows.push(...batch);
    if (batch.length < LIST_PAGE_SIZE) return rows;
  }
}

const selectFood = unstable_cache(
  async (id: string) => {
    const supabase = createServerClient();
    const { data, error } = await supabase
      .from(databaseName)
      .select()
      .eq("uuid", id)
      .single();
    if (error) throw new Error(error.message);
    return data;
  },
  ["farmable-by-id"],
  { revalidate: revalidationTime, tags: [databaseName] }
);

const selectFarmingGroup = unstable_cache(
  async (columnName: string, group: string) => {
    const supabase = createServerClient();
    const { data, error } = await supabase
      .from(databaseName)
      .select()
      .eq(columnName, group.toLowerCase());
    if (error) throw new Error(error.message);
    return data;
  },
  ["food-by-group"],
  { revalidate: revalidationTime, tags: [databaseName] }
);

const selectFarmingRange = unstable_cache(
  async (columnMinName: string, columnMaxName: string, min: number, max: number) => {
    const supabase = createServerClient();
    const { data, error } = await supabase
      .from(databaseName)
      .select()
      .gte(columnMinName, min)
      .lte(columnMaxName, max);
    if (error) throw new Error(error.message);
    return data;
  },
  ["food-by-range"],
  { revalidate: revalidationTime, tags: [databaseName] }
);

export { getAllFood, getFoodList, selectFarmingGroup, selectFood, selectFarmingRange };