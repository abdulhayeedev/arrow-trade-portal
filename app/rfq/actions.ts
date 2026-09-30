"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export async function submitRfq(formData: FormData) {
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
    redirect("/rfq?error=Could not find your company account");
  }

  const companyId = membership.company_id;
  const description = formData.get("description") as string;
  const file = formData.get("attachment") as File | null;

  let attachmentPath: string | null = null;

  if (file && file.size > 0) {
    const safeName = file.name.replace(/[^a-zA-Z0-9.\-_]/g, "_");
    const path = `${companyId}/${Date.now()}-${safeName}`;

    const { error: uploadError } = await supabase.storage
      .from("rfq-attachments")
      .upload(path, file);

    if (uploadError) {
      redirect(`/rfq?error=${encodeURIComponent("Upload failed: " + uploadError.message)}`);
    }

    attachmentPath = path;
  }

  const reference = `RFQ-${Date.now().toString().slice(-6)}`;

  const { error: insertError } = await supabase.from("rfqs").insert({
    company_id: companyId,
    reference,
    description,
    status: "awaiting_quote",
    attachment_path: attachmentPath,
  });

  if (insertError) {
    redirect(`/rfq?error=${encodeURIComponent(insertError.message)}`);
  }

  redirect("/dashboard?message=Your RFQ has been submitted");
}