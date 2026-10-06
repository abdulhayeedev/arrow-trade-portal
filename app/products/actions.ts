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
export async function toggleSavedPart(formData: FormData) {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const returnQuery = (formData.get("returnQuery") as string) ?? "";
  const returnPage = (formData.get("returnPage") as string) || "1";
  const back = `/products?q=${encodeURIComponent(returnQuery)}&page=${encodeURIComponent(returnPage)}`;

  const { data: membership } = await supabase
    .from("company_members")
    .select("company_id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!membership) {
    redirect(
      `${back}&message=${encodeURIComponent("Saving parts is only available on trade customer accounts")}`
    );
  }

  const wooProductId = parseInt(formData.get("wooProductId") as string, 10);
  const productName = formData.get("productName") as string;

  const { data: existing } = await supabase
    .from("saved_parts")
    .select("id")
    .eq("company_id", membership.company_id)
    .eq("woo_product_id", wooProductId)
    .maybeSingle();

  if (existing) {
    await supabase.from("saved_parts").delete().eq("id", existing.id);
    redirect(`${back}&message=${encodeURIComponent("Removed from saved parts")}`);
  }

  const { error } = await supabase.from("saved_parts").insert({
    company_id: membership.company_id,
    woo_product_id: wooProductId,
    product_name: productName,
  });

  if (error) {
    redirect(`${back}&message=${encodeURIComponent(error.message)}`);
  }

  redirect(`${back}&message=${encodeURIComponent("Saved to your parts")}`);
}