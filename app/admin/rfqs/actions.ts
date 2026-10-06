"use server";

import { createClient } from "@/lib/supabase/server";
import { isStaff } from "@/lib/admin";
import { redirect } from "next/navigation";

export async function respondToRfq(formData: FormData) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!(await isStaff(user?.id ?? null))) {
    redirect("/login");
  }

  const rfqId = formData.get("rfqId") as string;
  const companyId = formData.get("companyId") as string;
  const description = formData.get("quoteDescription") as string;
  const valueRaw = formData.get("value") as string;
  const validUntil = formData.get("validUntil") as string;

  const value = valueRaw ? parseFloat(valueRaw) : null;
  const reference = `Q-${Date.now().toString().slice(-6)}`;

  const { error: quoteError } = await supabase.from("quotes").insert({
    company_id: companyId,
    rfq_id: rfqId,
    reference,
    description,
    value_gbp: value,
    status: "open",
    valid_until: validUntil || null,
  });

  if (quoteError) {
    redirect(`/admin/rfqs?error=${encodeURIComponent(quoteError.message)}`);
  }

  const { error: updateError } = await supabase
    .from("rfqs")
    .update({ status: "quoted" })
    .eq("id", rfqId);

  if (updateError) {
    redirect(`/admin/rfqs?error=${encodeURIComponent(updateError.message)}`);
  }

  redirect("/admin/rfqs?message=Quote sent");
}

export async function createQuote(formData: FormData) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!(await isStaff(user?.id ?? null))) {
    redirect("/login");
  }

  const companyId = formData.get("companyId") as string;
  const description = formData.get("description") as string;
  const valueRaw = formData.get("value") as string;
  const validUntil = formData.get("validUntil") as string;

  const value = valueRaw ? parseFloat(valueRaw) : null;
  const reference = `Q-${Date.now().toString().slice(-6)}`;

  const { error } = await supabase.from("quotes").insert({
    company_id: companyId,
    rfq_id: null,
    reference,
    description,
    value_gbp: value,
    status: "open",
    valid_until: validUntil || null,
  });

  if (error) {
    redirect(`/admin/rfqs?error=${encodeURIComponent(error.message)}`);
  }

  redirect("/admin/rfqs?message=Quote created");
}

export async function createOrder(formData: FormData) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!(await isStaff(user?.id ?? null))) {
    redirect("/login");
  }

  const companyId = formData.get("companyId") as string;
  const description = formData.get("description") as string;
  const quantityRaw = formData.get("quantity") as string;
  const status = (formData.get("status") as string) || "processing";

  const quantity = quantityRaw ? parseInt(quantityRaw, 10) : 1;
  const reference = `PO-${Date.now().toString().slice(-6)}`;

  const { error } = await supabase.from("orders").insert({
    company_id: companyId,
    quote_id: null,
    reference,
    description,
    quantity,
    status,
  });

  if (error) {
    redirect(`/admin/rfqs?error=${encodeURIComponent(error.message)}`);
  }

  redirect("/admin/rfqs?message=Order created");
}