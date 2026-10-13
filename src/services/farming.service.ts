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

export { getAllFood, selectFarmingGroup, selectFood, selectFarmingRange };