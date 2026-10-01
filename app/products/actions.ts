"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export async function addToBasket(formData: FormData) {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: membership } = await supabase
    .from("company_members")
    .select("company_id")
    .eq("user_id", user.id)
    .single();

  if (!membership) {
    redirect("/products?error=Could not find your company account");
  }

  const companyId = membership.company_id;
  const wooProductId = parseInt(formData.get("wooProductId") as string, 10);
  const productName = formData.get("productName") as string;
  const price = parseFloat(formData.get("price") as string);
  const returnQuery = formData.get("returnQuery") as string;

  // If this product is already in the basket, bump its quantity instead of erroring.
  const { data: existing } = await supabase
    .from("basket_items")
    .select("id, quantity")
    .eq("company_id", companyId)
    .eq("woo_product_id", wooProductId)
    .single();

  if (existing) {
    await supabase
      .from("basket_items")
      .update({ quantity: existing.quantity + 1 })
      .eq("id", existing.id);
  } else {
    await supabase.from("basket_items").insert({
      company_id: companyId,
      woo_product_id: wooProductId,
      product_name: productName,
      price,
      quantity: 1,
    });
  }

  redirect(`/products?q=${encodeURIComponent(returnQuery)}&message=${encodeURIComponent("Added to basket")}`);
}