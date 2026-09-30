"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export async function acceptQuote(formData: FormData) {
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
    redirect("/dashboard?error=Could not find your company account");
  }

  const companyId = membership.company_id;
  const quoteId = formData.get("quoteId") as string;
  const description = formData.get("description") as string;

  const { error: updateError } = await supabase
    .from("quotes")
    .update({ status: "accepted" })
    .eq("id", quoteId)
    .eq("company_id", companyId);

  if (updateError) {
    redirect(`/dashboard?error=${encodeURIComponent(updateError.message)}`);
  }

  const reference = `PO-${Date.now().toString().slice(-6)}`;

  const { error: orderError } = await supabase.from("orders").insert({
    company_id: companyId,
    quote_id: quoteId,
    reference,
    description,
    quantity: 1,
    status: "processing",
  });

  if (orderError) {
    redirect(`/dashboard?error=${encodeURIComponent(orderError.message)}`);
  }

  redirect(`/dashboard?message=${encodeURIComponent("Quote accepted — order created")}`);
}