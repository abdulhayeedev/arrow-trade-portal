import { createClient } from "@/lib/supabase/server";

export async function getBasketCount(userId: string | null): Promise<number> {
  if (!userId) return 0;
  const supabase = createClient();

  const { data: membership } = await supabase
    .from("company_members")
    .select("company_id")
    .eq("user_id", userId)
    .single();

  if (!membership) return 0;

  const { data: items } = await supabase
    .from("basket_items")
    .select("quantity")
    .eq("company_id", membership.company_id);

  return (items ?? []).reduce((sum, item) => sum + item.quantity, 0);
}