import { createClient } from "@/lib/supabase/server";
import { getDashboardData } from "@/lib/dashboard";
import { isStaff } from "@/lib/admin";
import { acceptQuote, removeSavedPart, addSavedPartToBasket } from "@/app/dashboard/actions";
import { getProductsByIds } from "@/lib/woocommerce";
import { redirect } from "next/navigation";
import SiteHeader from "@/components/SiteHeader";
import AccountSidebar from "@/components/AccountSidebar";

const statusStyles: Record<string, string> = {
  awaiting_quote: "bg-[#FDF1E4] text-[#B15E00]",
  quoted: "bg-[#EEF3FF] text-[#16376B]",
  closed: "bg-[#F1F2F4] text-[#6B7280]",
  open: "bg-[#EEF3FF] text-[#16376B]",
  accepted: "bg-[#EAF6EC] text-[#1D7A34]",
  expired: "bg-[#F1F2F4] text-[#6B7280]",
  processing: "bg-[#FDF1E4] text-[#B15E00]",
  dispatched: "bg-[#EEF3FF] text-[#16376B]",
  delivered: "bg-[#EAF6EC] text-[#1D7A34]",
  cancelled: "bg-[#FFF3F2] text-[#A50D24]",
};

function StatusPill({ status }: { status: string }) {
  return (
    <span
      className={`rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wide ${
        statusStyles[status] ?? "bg-[#F1F2F4] text-[#6B7280]"
      }`}
    >
      {status.replace("_", " ")}
    </span>
  );
}

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: { message?: string };
}) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  if (await isStaff(user.id)) {
    redirect("/admin/rfqs");
  }

  const data = await getDashboardData(user.id);

  if (!data) {
    redirect("/login");
  }

  const { companyName, rfqs, quotes, orders, savedParts } = data;

  const savedProducts = await getProductsByIds(savedParts.map((p) => p.woo_product_id));
  const savedProductsById = new Map(savedProducts.map((p) => [p.id, p]));

  return (
    <main className="min-h-screen bg-[#FAFAFB] text-[#14171F]">
      <SiteHeader active="RFQs & quotes" user={user} />
      <div className="mx-auto grid max-w-[1180px] grid-cols-[220px_1fr] gap-10 px-14 py-12">
        <AccountSidebar active="dashboard" staff={false} />
        <div className="min-w-0">
      {searchParams.message && (
        <div className="mb-6 rounded-lg border border-[#1D7A34] bg-[#EAF6EC] px-4 py-3 text-sm text-[#1D7A34]">
          {searchParams.message}
        </div>
      )}
      <div className="mb-10 flex items-center justify-between">
        <div>
          <span className="text-[11px] font-bold tracking-[1.4px] text-[#FF4438]">
            DASHBOARD
          </span>
          <h1 className="font-heading mt-1 text-3xl font-bold">{companyName}</h1>
        </div>
        <a href="/" className="text-sm font-semibold text-[#FF4438]">
          ← Back to home
        </a>
      </div>

      <div className="mb-10 grid grid-cols-4 gap-4">
        <div className="rounded-xl border border-[#E5E5E7] p-5 shadow-sm">
          <span className="text-[11px] font-bold tracking-wide text-[#9AA2B1]">OPEN RFQS</span>
          <div className="font-heading mt-1.5 text-3xl font-bold">
            {rfqs.filter((r) => r.status === "awaiting_quote").length}
          </div>
        </div>
        <div className="rounded-xl border border-[#E5E5E7] p-5 shadow-sm">
          <span className="text-[11px] font-bold tracking-wide text-[#9AA2B1]">OPEN QUOTES</span>
          <div className="font-heading mt-1.5 text-3xl font-bold">
            {quotes.filter((q) => q.status === "open").length}
          </div>
        </div>
        <div className="rounded-xl border border-[#E5E5E7] p-5 shadow-sm">
          <span className="text-[11px] font-bold tracking-wide text-[#9AA2B1]">
            ORDERS IN PROGRESS
          </span>
          <div className="font-heading mt-1.5 text-3xl font-bold">
            {orders.filter((o) => o.status !== "delivered" && o.status !== "cancelled").length}
          </div>
        </div>
        <div className="rounded-xl border border-[#E5E5E7] p-5 shadow-sm">
          <span className="text-[11px] font-bold tracking-wide text-[#9AA2B1]">SAVED PARTS</span>
          <div className="font-heading mt-1.5 text-3xl font-bold text-[#FF4438]">
            {savedParts.length}
          </div>
        </div>
      </div>

      {/* RFQs */}
      <section className="mb-10">
        <h2 className="font-heading mb-3 text-xl font-bold">RFQs &amp; Enquiries</h2>
        {rfqs.length === 0 ? (
          <p className="text-sm text-[#6B7280]">
            No RFQs yet. Use &ldquo;Start an RFQ&rdquo; on the homepage to submit one.
          </p>
        ) : (
          <div className="overflow-hidden rounded-xl border border-[#E5E5E7]">
            {rfqs.map((rfq, i) => (
              <div
                key={rfq.id}
                className={`flex items-center gap-4 px-5 py-4 ${
                  i < rfqs.length - 1 ? "border-b border-[#F1F2F4]" : ""
                }`}
              >
                <span className="w-28 shrink-0 text-sm font-semibold text-[#9AA2B1]">
                  {rfq.reference}
                </span>
                <span className="grow text-sm">{rfq.description}</span>
                <StatusPill status={rfq.status} />
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Quotes */}
      <section className="mb-10">
        <h2 className="font-heading mb-3 text-xl font-bold">Quotes</h2>
        {quotes.length === 0 ? (
          <p className="text-sm text-[#6B7280]">No quotes yet.</p>
        ) : (
          <div className="overflow-hidden rounded-xl border border-[#E5E5E7]">
            {quotes.map((quote, i) => (
              <div
                key={quote.id}
                className={`flex items-center gap-4 px-5 py-4 ${
                  i < quotes.length - 1 ? "border-b border-[#F1F2F4]" : ""
                }`}
              >
                <span className="w-28 shrink-0 text-sm font-semibold text-[#9AA2B1]">
                  {quote.reference}
                </span>
                <span className="grow text-sm">{quote.description}</span>
                {quote.value_gbp && (
                  <span className="text-sm font-bold text-[#FF4438]">£{quote.value_gbp}</span>
                )}
                <StatusPill status={quote.status} />
                {quote.status === "open" && (
                  <form action={acceptQuote}>
                    <input type="hidden" name="quoteId" value={quote.id} />
                    <input type="hidden" name="description" value={quote.description} />
                    <button
                      type="submit"
                      className="h-8 shrink-0 rounded-md bg-[#14171F] px-3 text-xs font-bold text-white"
                    >
                      Accept
                    </button>
                  </form>
                )}
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Orders */}
      <section className="mb-10">
        <h2 className="font-heading mb-3 text-xl font-bold">Orders</h2>
        {orders.length === 0 ? (
          <p className="text-sm text-[#6B7280]">No orders yet.</p>
        ) : (
          <div className="overflow-hidden rounded-xl border border-[#E5E5E7]">
            {orders.map((order, i) => (
              <div
                key={order.id}
                className={`flex items-center gap-4 px-5 py-4 ${
                  i < orders.length - 1 ? "border-b border-[#F1F2F4]" : ""
                }`}
              >
                <span className="w-28 shrink-0 text-sm font-semibold text-[#9AA2B1]">
                  {order.reference}
                </span>
                <span className="grow text-sm">
                  {order.description} — qty {order.quantity}
                </span>
                <StatusPill status={order.status} />
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Saved parts */}
      <section>
        <h2 className="font-heading mb-3 text-xl font-bold">Saved Parts</h2>
        {savedParts.length === 0 ? (
          <p className="text-sm text-[#6B7280]">
            No saved parts yet. Save products while browsing the catalogue.
          </p>
        ) : (
          <div className="grid grid-cols-3 gap-5">
            {savedParts.map((part) => {
              const product = savedProductsById.get(part.woo_product_id);
              return (
                <div
                  key={part.id}
                  className="flex flex-col overflow-hidden rounded-2xl border border-[#E5E5E7] bg-white shadow-sm"
                >
                  <div className="block aspect-square bg-[#FAFAFB] p-8">
                    {product?.images?.[0]?.src ? (
                      <img
                        src={product.images[0].src}
                        alt={product.images[0].alt || product.name}
                        className="h-full w-full object-contain"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center">
                        <span className="text-xs text-[#9AA2B1]">No image</span>
                      </div>
                    )}
                  </div>
                  <div className="flex grow flex-col gap-1.5 border-t border-[#F1F2F4] p-4">
                    {product ? (
                      <a
                        href={product.permalink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="line-clamp-2 text-[13.5px] font-semibold leading-snug text-[#14171F] hover:text-[#FF4438]"
                      >
                        {product.name}
                      </a>
                    ) : (
                      <span className="line-clamp-2 text-[13.5px] font-semibold leading-snug text-[#14171F]">
                        {part.product_name}
                      </span>
                    )}
                    {product ? (
                      <>
                        <span className="text-[11px] text-[#9AA2B1]">SKU: {product.sku || "—"}</span>
                        <div className="mt-1 flex items-center justify-between">
                          <span className="font-heading text-lg font-bold text-[#FF4438]">
                            £{product.price}
                          </span>
                          <span
                            className={`text-[11px] font-semibold ${
                              product.stock_status === "instock" ? "text-[#1D7A34]" : "text-[#9AA2B1]"
                            }`}
                          >
                            {product.stock_status === "instock" ? "In stock" : "Out of stock"}
                          </span>
                        </div>
                      </>
                    ) : (
                      <span className="text-[11px] text-[#9AA2B1]">
                        This product is no longer available.
                      </span>
                    )}
                    <div className="mt-2 flex gap-2">
                      {product && product.stock_status === "instock" && (
                        <form action={addSavedPartToBasket} className="grow">
                          <input type="hidden" name="wooProductId" value={product.id} />
                          <input type="hidden" name="productName" value={product.name} />
                          <input type="hidden" name="price" value={product.price} />
                          <button
                            type="submit"
                            className="h-10 w-full rounded-xl bg-[#14171F] text-[12.5px] font-bold text-white transition-colors hover:bg-[#2A2E38]"
                          >
                            Add to basket
                          </button>
                        </form>
                      )}
                      <form action={removeSavedPart} className={product ? "" : "grow"}>
                        <input type="hidden" name="id" value={part.id} />
                        <button
                          type="submit"
                          className="h-10 w-full rounded-xl border border-[#E5E5E7] px-3 text-[12.5px] font-semibold text-[#6B7280] transition-colors hover:border-[#FF4438] hover:text-[#FF4438]"
                        >
                          Remove
                        </button>
                      </form>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
        </div>
      </div>
    </main>
  );
}