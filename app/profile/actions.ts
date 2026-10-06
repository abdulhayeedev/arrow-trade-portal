"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export async function updateName(formData: FormData) {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const fullName = ((formData.get("fullName") as string) ?? "").trim();

  const { error } = await supabase.auth.updateUser({ data: { full_name: fullName } });

  if (error) {
    redirect(`/profile?error=${encodeURIComponent(error.message)}`);
  }

  redirect(`/profile?message=${encodeURIComponent("Your name has been updated")}`);
}

export async function changePassword(formData: FormData) {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const newPassword = (formData.get("newPassword") as string) ?? "";
  const confirmPassword = (formData.get("confirmPassword") as string) ?? "";

  if (newPassword.length < 8) {
    redirect(`/profile?error=${encodeURIComponent("Password must be at least 8 characters")}`);
  }

  if (newPassword !== confirmPassword) {
    redirect(`/profile?error=${encodeURIComponent("Passwords do not match")}`);
  }

  const { error } = await supabase.auth.updateUser({ password: newPassword });

  if (error) {
    redirect(`/profile?error=${encodeURIComponent(error.message)}`);
  }

  redirect(`/profile?message=${encodeURIComponent("Your password has been changed")}`);
}
export async function saveAddress(formData: FormData) {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const val = (name: string) => ((formData.get(name) as string) ?? "").trim();

  if (!val("billing_address_1") || !val("billing_city") || !val("billing_postcode")) {
    redirect(
      `/profile?error=${encodeURIComponent("Please enter your address line 1, town and postcode")}`
    );
  }

  const shippingProvided = val("shipping_address_1") !== "";

  if (shippingProvided && (!val("shipping_city") || !val("shipping_postcode"))) {
    redirect(
      `/profile?error=${encodeURIComponent("Please complete the delivery address (town and postcode)")}`
    );
  }

  const { error } = await supabase.from("profile_addresses").upsert(
    {
      user_id: user.id,
      phone: val("phone") || null,
      billing_address_1: val("billing_address_1"),
      billing_address_2: val("billing_address_2") || null,
      billing_city: val("billing_city"),
      billing_postcode: val("billing_postcode"),
      billing_country: val("billing_country") || "GB",
      shipping_address_1: shippingProvided ? val("shipping_address_1") : null,
      shipping_address_2: shippingProvided ? val("shipping_address_2") || null : null,
      shipping_city: shippingProvided ? val("shipping_city") : null,
      shipping_postcode: shippingProvided ? val("shipping_postcode") : null,
      shipping_country: shippingProvided ? val("shipping_country") || "GB" : null,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id" }
  );

  if (error) {
    redirect(`/profile?error=${encodeURIComponent(error.message)}`);
  }

  redirect(`/profile?message=${encodeURIComponent("Your address has been saved")}`);
}