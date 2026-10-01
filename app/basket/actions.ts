"use server";

import { createClient } from "@/lib/supabase/server";
import { createOrder } from "@/lib/woocommerce";
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

export async function checkout() {
  const { companyId, userEmail } = await getCompanyId();
  const supabase = createClient();

  const { data: items } = await supabase
    .from("basket_items")
    .select("*")
    .eq("company_id", companyId);

  if (!items || items.length === 0) {
    redirect("/basket?error=Your basket is empty");
  }

  const { data: company } = await supabase
    .from("companies")
    .select("name")
    .eq("id", companyId)
    .single();

  const companyName = company?.name ?? "Trade Account";

  let wooOrder;
  try {
    wooOrder = await createOrder({
      email: userEmail,
      companyName,
      lineItems: items.map((item) => ({
        product_id: item.woo_product_id,
        quantity: item.quantity,
      })),
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Checkout failed";
    redirect(`/basket?error=${encodeURIComponent(message)}`);
  }

  // Mirror the order locally so it shows up in the dashboard immediately.
  const description = items.map((item) => `${item.product_name} (x${item.quantity})`).join(", ");

  await supabase.from("orders").insert({
    company_id: companyId,
    reference: `WOO-${wooOrder.number}`,
    description,
    quantity: items.reduce((sum, item) => sum + item.quantity, 0),
    status: "processing",
  });

  await supabase.from("basket_items").delete().eq("company_id", companyId);

  redirect("/dashboard?message=Order placed successfully");
}