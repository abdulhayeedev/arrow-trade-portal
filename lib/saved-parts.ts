import { createClient } from "@/lib/supabase/server";

export async function getSavedProductIds(userId: string | null): Promise<Set<number>> {
  if (!userId) return new Set();
  const supabase = createClient();

  const { data: membership } = await supabase
    .from("company_members")
    .select("company_id")
    .eq("user_id", userId)
    .maybeSingle();

  if (!membership) return new Set();

  const { data } = await supabase
    .from("saved_parts")
    .select("woo_product_id")
    .eq("company_id", membership.company_id);

  return new Set((data ?? []).map((row) => row.woo_product_id as number));
}