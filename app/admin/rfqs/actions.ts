"use server";

import { createClient } from "@/lib/supabase/server";
import { isStaff } from "@/lib/admin";
import { redirect } from "next/navigation";

export async function respondToRfq(formData: FormData) {
  const staff = await isStaff();
  if (!staff) {
    redirect("/login");
  }

  const supabase = createClient();

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