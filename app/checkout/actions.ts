"use server";

import { createClient } from "@/lib/supabase/server";
import { createOrderWithDetails } from "@/lib/woocommerce";
import { mapWooStatus } from "@/lib/order-status";
import { redirect } from "next/navigation";

export async function placeOrder(formData: FormData) {
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
    .maybeSingle();

  if (!membership) {
    redirect(`/basket?error=${encodeURIComponent("Could not find your company account")}`);
  }

  const companyId = membership.company_id;
  const val = (name: string) => ((formData.get(name) as string) ?? "").trim();

  const contactName = val("contactName");
  const phone = val("phone");
  const poNumber = val("poNumber");
  const note = val("note");

  const billing = {
    address_1: val("billing_address_1"),
    address_2: val("billing_address_2"),
    city: val("billing_city"),
    postcode: val("billing_postcode"),
    country: val("billing_country") || "GB",
  };

  // If no delivery address is entered, delivery goes to the billing address.
  const shippingProvided = val("shipping_address_1") !== "";
  const shipping = shippingProvided
    ? {
        address_1: val("shipping_address_1"),
        address_2: val("shipping_address_2"),
        city: val("shipping_city"),
        postcode: val("shipping_postcode"),
        country: val("shipping_country") || "GB",
      }
    : billing;

  if (!contactName || !phone || !billing.address_1 || !billing.city || !billing.postcode) {
    redirect(
      `/checkout?error=${encodeURIComponent(
        "Please fill in your name, phone number and billing address"
      )}`
    );
  }

  if (shippingProvided && (!shipping.city || !shipping.postcode)) {
    redirect(
      `/checkout?error=${encodeURIComponent("Please complete the delivery address (town and postcode)")}`
    );
  }

  const { data: items } = await supabase
    .from("basket_items")
    .select("*")
    .eq("company_id", companyId);

  if (!items || items.length === 0) {
    redirect(`/basket?error=${encodeURIComponent("Your basket is empty")}`);
  }

  const { data: company } = await supabase
    .from("companies")
    .select("name")
    .eq("id", companyId)
    .maybeSingle();

  const companyName = company?.name ?? "Trade Account";
  const [firstName, ...rest] = contactName.split(" ");
  const base = { first_name: firstName, last_name: rest.join(" "), company: companyName };

  let wooOrder;
  try {
    wooOrder = await createOrderWithDetails({
      email: user.email as string,
      phone,
      companyId,
      billing: { ...base, ...billing },
      shipping: { ...base, ...shipping },
      lineItems: items.map((item) => ({
        product_id: item.woo_product_id,
        quantity: item.quantity,
      })),
      note,
      poNumber,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Checkout failed";
    redirect(`/checkout?error=${encodeURIComponent(message)}`);
  }

  // Remember these details for next time.
  await supabase.from("company_checkout_details").upsert(
    {
      company_id: companyId,
      contact_name: contactName,
      phone,
      billing_address_1: billing.address_1,
      billing_address_2: billing.address_2,
      billing_city: billing.city,
      billing_postcode: billing.postcode,
      billing_country: billing.country,
      shipping_address_1: shippingProvided ? shipping.address_1 : null,
      shipping_address_2: shippingProvided ? shipping.address_2 : null,
      shipping_city: shippingProvided ? shipping.city : null,
      shipping_postcode: shippingProvided ? shipping.postcode : null,
      shipping_country: shippingProvided ? shipping.country : null,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "company_id" }
  );

  // Mirror the order locally so it shows on the dashboard straight away.
  await supabase.from("orders").insert({
    company_id: companyId,
    reference: `WOO-${wooOrder.number}`,
    description: items.map((item) => `${item.product_name} (x${item.quantity})`).join(", "),
    quantity: items.reduce((sum, item) => sum + item.quantity, 0),
    status: mapWooStatus(wooOrder.status),
    woo_order_id: wooOrder.id,
  });

  await supabase.from("basket_items").delete().eq("company_id", companyId);

  redirect(`/profile/dashboard?message=${encodeURIComponent("Order placed successfully")}`);
}