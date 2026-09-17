import { createServerClient } from "@/src/lib/supabase/client";
import { revalidationTime } from "@/src/constants/supabase";
import { unstable_cache } from "next/cache";

const databaseName = "flowers";

// Adjust to only the columns your UI actually needs
// const FLOWER_COLUMNS = "uuid, name, flower_group, price, image_url";

const getAllFlowers = unstable_cache(
  async () => {
    const supabase = createServerClient();
    const { data, error } = await supabase.from(databaseName).select();
    if (error) throw new Error(error.message);
    return data;
  },
  ["flowers-all"],
  { revalidate: revalidationTime, tags: [databaseName] }
);

const selectFlower = unstable_cache(
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
  ["flower-by-id"],
  { revalidate: revalidationTime, tags: [databaseName] }
);

const organizeFlowerGroup = unstable_cache(
  async (columnName: string, group: string) => {
    const supabase = createServerClient();
    const { data, error } = await supabase
      .from(databaseName)
      .select()
      .eq(columnName, group.toLowerCase());
    if (error) throw new Error(error.message);
    return data;
  },
  ["flowers-by-group"],
  { revalidate: revalidationTime, tags: [databaseName] }
);

export { getAllFlowers, selectFlower, organizeFlowerGroup };