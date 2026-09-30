import { createClient } from "@/lib/supabase/server";

export async function isStaff(): Promise<boolean> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return false;

  const { data, error } = await supabase
    .from("staff")
    .select("user_id")
    .eq("user_id", user.id)
    .single();

  if (error) {
    console.error("isStaff check failed for user", user.id, error);
  }

  return !!data;
}

export type AdminRfq = {
  id: string;
  company_id: string;
  company_name: string;
  reference: string;
  description: string;
  status: string;
  attachment_path: string | null;
  attachment_url: string | null;
  created_at: string;
};

export async function getAllRfqs(): Promise<AdminRfq[]> {
  const supabase = createClient();

  const { data: rfqs } = await supabase
    .from("rfqs")
    .select("*")
    .order("created_at", { ascending: false });

  if (!rfqs || rfqs.length === 0) return [];

  const companyIds = [...new Set(rfqs.map((r) => r.company_id))];
  const { data: companies } = await supabase
    .from("companies")
    .select("id, name")
    .in("id", companyIds);

  const companyNameById = new Map((companies ?? []).map((c) => [c.id, c.name]));

  const results: AdminRfq[] = [];
  for (const rfq of rfqs) {
    let attachmentUrl: string | null = null;
    if (rfq.attachment_path) {
      const { data: signed } = await supabase.storage
        .from("rfq-attachments")
        .createSignedUrl(rfq.attachment_path, 60 * 10); // 10 minute link
      attachmentUrl = signed?.signedUrl ?? null;
    }

    results.push({
      id: rfq.id,
      company_id: rfq.company_id,
      company_name: companyNameById.get(rfq.company_id) ?? "Unknown company",
      reference: rfq.reference,
      description: rfq.description,
      status: rfq.status,
      attachment_path: rfq.attachment_path,
      attachment_url: attachmentUrl,
      created_at: rfq.created_at,
    });
  }

  return results;
}