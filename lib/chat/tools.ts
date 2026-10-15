import type { SupabaseClient } from "@supabase/supabase-js";
import { getProducts, getProduct } from "@/lib/woocommerce";

export type ToolContext = { supabase: SupabaseClient };

export type ToolDeclaration = {
  name: string;
  description: string;
  parameters?: Record<string, unknown>;
};

function stripHtml(s: string | undefined, max: number): string {
  return (s ?? "")
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&#8217;|&rsquo;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, max);
}

function listedSpecs(attrs: { name: string; options: string[] }[] | undefined, limit: number): string[] {
  return (attrs ?? []).slice(0, limit).map((a) => `${a.name}: ${(a.options ?? []).join(", ")}`);
}

export const toolDeclarations: ToolDeclaration[] = [
  {
    name: "search_products",
    description:
      "Keyword search of Arrow's live catalogue. Returns up to 8 products with price, stock, link and the specifications exactly as listed. Use short keywords (product type, series, part number), not whole sentences. Try a second, different query if the first finds nothing.",
    parameters: {
      type: "object",
      properties: { query: { type: "string", description: "Short search keywords" } },
      required: ["query"],
    },
  },
  {
    name: "get_product_details",
    description:
      "Full details for one product: description, all listed specifications, price, stock and link. Use it when the customer asks about a specific product or a technical question involves one.",
    parameters: {
      type: "object",
      properties: { product_id: { type: "integer", description: "The product id from search_products" } },
      required: ["product_id"],
    },
  },
  {
    name: "get_my_orders",
    description: "The signed-in customer's most recent orders (up to 10), newest first, with status.",
  },
  {
    name: "get_my_quotes",
    description: "The signed-in customer's most recent quotes (up to 10), newest first, with value, status and expiry.",
  },
  {
    name: "get_my_rfqs",
    description: "The signed-in customer's most recent RFQs (up to 10), newest first, with status.",
  },
  {
    name: "create_rfq_link",
    description:
      "Creates a link to the RFQ form with the description pre-filled so an Arrow engineer can pick it up. Use it when nothing in the catalogue fits, when the question is technical, or when the customer asks for an engineer.",
    parameters: {
      type: "object",
      properties: {
        summary: {
          type: "string",
          description: "Clear summary of what the customer needs or the problem, including what has been established so far",
        },
      },
      required: ["summary"],
    },
  },
];

export async function runTool(
  name: string,
  args: Record<string, unknown>,
  ctx: ToolContext
): Promise<Record<string, unknown>> {
  try {
    switch (name) {
      case "search_products": {
        const query = String(args.query ?? "").trim().slice(0, 150);
        if (!query) return { error: "No search query was given." };
        const products = await getProducts({ search: query, per_page: 8 });
        return {
          query,
          count: products.length,
          products: products.map((p) => ({
            id: p.id,
            name: p.name,
            sku: p.sku || null,
            price: p.price ? `£${p.price}` : null,
            in_stock: p.stock_status === "instock",
            url: p.permalink,
            listed_specs: listedSpecs(p.attributes, 8),
          })),
          note: products.length === 0 ? "No products matched. Try different keywords or offer an RFQ." : undefined,
        };
      }

      case "get_product_details": {
        const id = Number(args.product_id);
        if (!Number.isInteger(id) || id <= 0) return { error: "A valid product id is required." };
        const p = await getProduct(id);
        return {
          id: p.id,
          name: p.name,
          sku: p.sku || null,
          price: p.price ? `£${p.price}` : null,
          in_stock: p.stock_status === "instock",
          url: p.permalink,
          short_description: stripHtml(p.short_description, 800),
          description: stripHtml(p.description, 3000),
          listed_specs: listedSpecs(p.attributes, 30),
        };
      }

      case "get_my_orders": {
        const { data, error } = await ctx.supabase
          .from("orders")
          .select("reference, description, quantity, status, created_at")
          .order("created_at", { ascending: false })
          .limit(10);
        if (error) return { error: "Could not load orders." };
        return {
          orders: (data ?? []).map((o) => ({
            reference: o.reference,
            details: o.description,
            quantity: o.quantity,
            status: o.status,
            placed: String(o.created_at ?? "").slice(0, 10),
            awaiting_payment: o.status === "pending_payment",
          })),
          note: data && data.length > 0 ? undefined : "No orders found on this account.",
        };
      }

      case "get_my_quotes": {
        const { data, error } = await ctx.supabase
          .from("quotes")
          .select("reference, description, value_gbp, status, valid_until, created_at")
          .order("created_at", { ascending: false })
          .limit(10);
        if (error) return { error: "Could not load quotes." };
        return {
          quotes: (data ?? []).map((q) => ({
            reference: q.reference,
            details: q.description,
            value: q.value_gbp != null ? `£${q.value_gbp}` : null,
            status: q.status,
            valid_until: q.valid_until,
            received: String(q.created_at ?? "").slice(0, 10),
          })),
          note: data && data.length > 0 ? undefined : "No quotes found on this account.",
        };
      }

      case "get_my_rfqs": {
        const { data, error } = await ctx.supabase
          .from("rfqs")
          .select("reference, description, status, created_at")
          .order("created_at", { ascending: false })
          .limit(10);
        if (error) return { error: "Could not load RFQs." };
        return {
          rfqs: (data ?? []).map((r) => ({
            reference: r.reference,
            details: r.description,
            status: r.status,
            submitted: String(r.created_at ?? "").slice(0, 10),
          })),
          note: data && data.length > 0 ? undefined : "No RFQs found on this account.",
        };
      }

      case "create_rfq_link": {
        const summary = String(args.summary ?? "").trim().slice(0, 1500);
        if (!summary) return { error: "A summary is required." };
        return {
          url: `/rfq?description=${encodeURIComponent(summary)}`,
          note: "Give the customer this link. The RFQ form opens with the summary filled in for them to review and submit.",
        };
      }

      default:
        return { error: `Unknown tool: ${name}` };
    }
  } catch (err) {
    console.error("chat tool error", name, err);
    return { error: "That lookup failed. Please say so and offer an RFQ instead." };
  }
}