import { createClient } from "@/lib/supabase/server";

export type Rfq = {
  id: string;
  reference: string;
  description: string;
  status: string;
  created_at: string;
};

export type Quote = {
  id: string;
  reference: string;
  description: string;
  value_gbp: number | null;
  status: string;
  valid_until: string | null;
  created_at: string;
};

export type Order = {
  id: string;
  reference: string;
  description: string;
  quantity: number;
  status: string;
  created_at: string;
  payment_url: string | null;
};

export type SavedPart = {
  id: string;
  woo_product_id: number;
  product_name: string;
  created_at: string;
};

export type DashboardData = {
  companyName: string;
  rfqs: Rfq[];
  quotes: Quote[];
  orders: Order[];
  savedParts: SavedPart[];
};

export async function getDashboardData(userId: string | null): Promise<DashboardData | null> {
  if (!userId) return null;
  const supabase = createClient();

  const { data: membership, error: membershipError } = await supabase
    .from("company_members")
    .select("company_id")
    .eq("user_id", userId)
    .single();

  if (membershipError || !membership) {
    console.error("getDashboardData: no company_members row for user", userId, membershipError);
    return null;
  }

  const companyId = membership.company_id;

  const { data: company, error: companyError } = await supabase
    .from("companies")
    .select("name")
    .eq("id", companyId)
    .single();

  if (companyError) {
    console.error("getDashboardData: failed to load company", companyId, companyError);
  }

  const companyName = company?.name ?? "Trade Account";

  const [rfqsRes, quotesRes, ordersRes, savedRes] = await Promise.all([
    supabase
      .from("rfqs")
      .select("*")
      .eq("company_id", companyId)
      .order("created_at", { ascending: false }),
    supabase
      .from("quotes")
      .select("*")
      .eq("company_id", companyId)
      .order("created_at", { ascending: false }),
    supabase
      .from("orders")
      .select("*")
      .eq("company_id", companyId)
      .order("created_at", { ascending: false }),
    supabase
      .from("saved_parts")
      .select("*")
      .eq("company_id", companyId)
      .order("created_at", { ascending: false }),
  ]);

  return {
    companyName,
    rfqs: (rfqsRes.data as Rfq[]) ?? [],
    quotes: (quotesRes.data as Quote[]) ?? [],
    orders: (ordersRes.data as Order[]) ?? [],
    savedParts: (savedRes.data as SavedPart[]) ?? [],
  };
}