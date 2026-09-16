import { createServerClient } from "@/src/lib/supabase/client";

const supabase = createServerClient();

async function getAllFlowers() {
  const { data, error } = await supabase.from('flowers').select();
  if (error) throw new Error(error.message);
  return data;
}

export { getAllFlowers };