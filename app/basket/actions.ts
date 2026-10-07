"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

async function getCompanyId(): Promise<{ companyId: string; userEmail: string }> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: membership } = await supabase
    .from("company_members")
    .select("company_id")
    .eq("user_id", user.id)
    .single();

  if (!membership) redirect("/basket?error=Could not find your company account");

  return { companyId: membership.company_id, userEmail: user.email as string };
}

export async function updateQuantity(formData: FormData) {
  const { companyId } = await getCompanyId();
  const supabase = createClient();

  const itemId = formData.get("itemId") as string;
  const quantity = parseInt(formData.get("quantity") as string, 10);

  if (quantity <= 0) {
    await supabase.from("basket_items").delete().eq("id", itemId).eq("company_id", companyId);
  } else {
    await supabase
      .from("basket_items")
      .update({ quantity })
      .eq("id", itemId)
      .eq("company_id", companyId);
  }

  redirect("/basket");
}

export async function removeItem(formData: FormData) {
  const { companyId } = await getCompanyId();
  const supabase = createClient();

  const itemId = formData.get("itemId") as string;

  await supabase.from("basket_items").delete().eq("id", itemId).eq("company_id", companyId);

  redirect("/basket");
}

