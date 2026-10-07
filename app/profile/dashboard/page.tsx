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
  pending_payment: "bg-[#FDF1E4] text-[#B15E00]",
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

const gbp = (n: number | null | undefined) =>
  n == null ? "—" : new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP" }).format(n);

const shortDate = (iso: string | null | undefined) =>
  iso
    ? new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })
    : "—";

function SectionHeader({ title, count }: { title: string; count?: number }) {
  return (
    <div className="mb-3 flex items-center gap-2.5">
      <h2 className="font-heading text-xl font-bold">{title}</h2>
      {count !== undefined && (
        <span className="rounded-full bg-[#F1F2F4] px-2.5 py-0.5 text-xs font-bold text-[#6B7280]">
          {count}
        </span>
      )}
    </div>
  );
}

function EmptyState({ message, href, label }: { message: string; href?: string; label?: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-[#D9DADF] bg-white px-6 py-8 text-center">
      <p className="text-sm text-[#6B7280]">{message}</p>
      {href && label && (
        <a
          href={href}
          className="mt-3 inline-block rounded-lg border border-[#E5E5E7] px-4 py-2 text-[12.5px] font-bold text-[#14171F] transition-colors hover:border-[#FF4438] hover:text-[#FF4438]"
        >
          {label}
        </a>
      )}
    </div>
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

  const firstName = ((user.user_metadata?.full_name as string) || "").trim().split(" ")[0];
  const openRfqs = rfqs.filter((r) => r.status === "awaiting_quote").length;
  const openQuotes = quotes.filter((q) => q.status === "open");
  const openQuotesValue = openQuotes.reduce((sum, q) => sum + Number(q.value_gbp ?? 0), 0);
  const activeOrders = orders.filter((o) => o.status !== "delivered" && o.status !== "cancelled");
  const awaitingPayment = orders.filter((o) => o.status === "pending_payment");

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

      <div className="mb-8 flex items-end justify-between gap-6">
        <div>
          <span className="text-[11px] font-bold tracking-[1.4px] text-[#FF4438]">DASHBOARD</span>
          <h1 className="font-heading mt-1 text-3xl font-bold">
            {firstName ? `Welcome back, ${firstName}` : "Welcome back"}
          </h1>
          <p className="mt-1 text-sm text-[#6B7280]">{companyName}</p>
        </div>
        <div className="flex shrink-0 gap-3">
          <a
            href="/products"
            className="flex h-10 items-center rounded-lg border border-[#E5E5E7] bg-white px-4 text-[13px] font-bold text-[#14171F] shadow-sm transition-colors hover:border-[#14171F]"
          >
            Browse catalogue
          </a>
          <a
            href="/rfq"
            className="flex h-10 items-center rounded-lg bg-[#FF4438] px-4 text-[13px] font-bold text-white transition-colors hover:bg-[#E63A2F]"
          >
            Start an RFQ
          </a>
        </div>
      </div>

      {(openQuotes.length > 0 || awaitingPayment.length > 0) && (
        <div className="mb-8 rounded-2xl border border-[#F3D9B0] bg-[#FFF8EC] p-5">
          <div className="mb-3 text-[11px] font-bold tracking-[1.4px] text-[#B15E00]">
            NEEDS YOUR ATTENTION
          </div>
          <div className="flex flex-col gap-2">
            {openQuotes.length > 0 && (
              <a
                href="#quotes"
                className="flex items-center justify-between rounded-lg bg-white px-4 py-3 text-sm shadow-sm transition-colors hover:bg-[#FFFDF8]"
              >
                <span>
                  <span className="font-bold">{openQuotes.length}</span>{" "}
                  {openQuotes.length === 1 ? "quote is" : "quotes are"} waiting for your decision
                  {openQuotesValue > 0 && (
                    <span className="text-[#6B7280]"> · {gbp(openQuotesValue)} in total</span>
                  )}
                </span>
                <span className="text-[12.5px] font-bold text-[#FF4438]">Review →</span>
              </a>
            )}
            {awaitingPayment.length > 0 && (
              <a
                href="#orders"
                className="flex items-center justify-between rounded-lg bg-white px-4 py-3 text-sm shadow-sm transition-colors hover:bg-[#FFFDF8]"
              >
                <span>
                  <span className="font-bold">{awaitingPayment.length}</span>{" "}
                  {awaitingPayment.length === 1 ? "order is" : "orders are"} waiting for payment
                </span>
                <span className="text-[12.5px] font-bold text-[#FF4438]">Pay now →</span>
              </a>
            )}
          </div>
        </div>
      )}

      <div className="mb-10 grid grid-cols-4 gap-4">
        <a
          href="#rfqs"
          className="rounded-2xl border border-[#E5E5E7] bg-white p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-[0_14px_32px_rgba(20,23,31,0.10)]"
        >
          <div className="flex items-start justify-between">
            <span className="text-[11px] font-bold tracking-wide text-[#9AA2B1]">OPEN RFQS</span>
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#EEF3FF]">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#16376B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
            </span>
          </div>
          <div className="font-heading mt-3 text-3xl font-bold">{openRfqs}</div>
          <div className="mt-1 text-xs text-[#6B7280]">Awaiting a quote</div>
        </a>
        <a
          href="#quotes"
          className="rounded-2xl border border-[#E5E5E7] bg-white p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-[0_14px_32px_rgba(20,23,31,0.10)]"
        >
          <div className="flex items-start justify-between">
            <span className="text-[11px] font-bold tracking-wide text-[#9AA2B1]">OPEN QUOTES</span>
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#FFF3F2]">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#A50D24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <path d="M14 2v6h6" />
              </svg>
            </span>
          </div>
          <div className="font-heading mt-3 text-3xl font-bold">{openQuotes.length}</div>
          <div className="mt-1 text-xs text-[#6B7280]">
            {openQuotesValue > 0 ? `${gbp(openQuotesValue)} to review` : "Waiting for your decision"}
          </div>
        </a>
        <a
          href="#orders"
          className="rounded-2xl border border-[#E5E5E7] bg-white p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-[0_14px_32px_rgba(20,23,31,0.10)]"
        >
          <div className="flex items-start justify-between">
            <span className="text-[11px] font-bold tracking-wide text-[#9AA2B1]">
              ORDERS IN PROGRESS
            </span>
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#FDF1E4]">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#B15E00" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="1" y="3" width="15" height="13" />
                <path d="M16 8h4l3 3v5h-7V8z" />
                <circle cx="5.5" cy="18.5" r="2.5" />
                <circle cx="18.5" cy="18.5" r="2.5" />
              </svg>
            </span>
          </div>
          <div className="font-heading mt-3 text-3xl font-bold">{activeOrders.length}</div>
          <div className="mt-1 text-xs text-[#6B7280]">
            {awaitingPayment.length > 0 ? `${awaitingPayment.length} awaiting payment` : "Not yet delivered"}
          </div>
        </a>
        <a
          href="#saved"
          className="rounded-2xl border border-[#E5E5E7] bg-white p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-[0_14px_32px_rgba(20,23,31,0.10)]"
        >
          <div className="flex items-start justify-between">
            <span className="text-[11px] font-bold tracking-wide text-[#9AA2B1]">SAVED PARTS</span>
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#EAF6EC]">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#1D7A34" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
              </svg>
            </span>
          </div>
          <div className="font-heading mt-3 text-3xl font-bold">{savedParts.length}</div>
          <div className="mt-1 text-xs text-[#6B7280]">Ready to reorder</div>
        </a>
      </div>

      {/* RFQs */}
      <section id="rfqs" className="mb-10 scroll-mt-6">
        <SectionHeader title="RFQs & Enquiries" count={rfqs.length} />
        {rfqs.length === 0 ? (
          <EmptyState
            message="No RFQs yet. Describe what you need and an engineer will come back with a quotation."
            href="/rfq"
            label="Start an RFQ"
          />
        ) : (
          <div className="overflow-hidden rounded-2xl border border-[#E5E5E7] bg-white shadow-sm">
            <div className="grid grid-cols-[100px_1fr_100px_140px] gap-4 border-b border-[#E5E5E7] bg-[#FAFAFB] px-5 py-2.5 text-[11px] font-bold tracking-wide text-[#9AA2B1]">
              <span>REFERENCE</span>
              <span>DETAILS</span>
              <span>SUBMITTED</span>
              <span>STATUS</span>
            </div>
            {rfqs.map((rfq, i) => (
              <div
                key={rfq.id}
                className={`grid grid-cols-[100px_1fr_100px_140px] items-center gap-4 px-5 py-4 transition-colors hover:bg-[#FAFAFB] ${
                  i < rfqs.length - 1 ? "border-b border-[#F1F2F4]" : ""
                }`}
              >
                <span className="text-sm font-semibold text-[#6B7280]">{rfq.reference}</span>
                <span className="min-w-0 truncate text-sm">{rfq.description}</span>
                <span className="text-[13px] text-[#6B7280]">{shortDate(rfq.created_at)}</span>
                <span>
                  <StatusPill status={rfq.status} />
                </span>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Quotes */}
      <section id="quotes" className="mb-10 scroll-mt-6">
        <SectionHeader title="Quotes" count={quotes.length} />
        {quotes.length === 0 ? (
          <EmptyState message="No quotes yet. They appear here when Arrow replies to an RFQ." />
        ) : (
          <div className="overflow-hidden rounded-2xl border border-[#E5E5E7] bg-white shadow-sm">
            <div className="grid grid-cols-[100px_1fr_100px_90px_110px_80px] gap-4 border-b border-[#E5E5E7] bg-[#FAFAFB] px-5 py-2.5 text-[11px] font-bold tracking-wide text-[#9AA2B1]">
              <span>REFERENCE</span>
              <span>DETAILS</span>
              <span>VALID UNTIL</span>
              <span>VALUE</span>
              <span>STATUS</span>
              <span />
            </div>
            {quotes.map((quote, i) => (
              <div
                key={quote.id}
                className={`grid grid-cols-[100px_1fr_100px_90px_110px_80px] items-center gap-4 px-5 py-4 transition-colors hover:bg-[#FAFAFB] ${
                  i < quotes.length - 1 ? "border-b border-[#F1F2F4]" : ""
                }`}
              >
                <span className="text-sm font-semibold text-[#6B7280]">{quote.reference}</span>
                <span className="min-w-0 truncate text-sm">{quote.description}</span>
                <span className="text-[13px] text-[#6B7280]">{shortDate(quote.valid_until)}</span>
                <span className="text-sm font-bold text-[#14171F]">{gbp(quote.value_gbp)}</span>
                <span>
                  <StatusPill status={quote.status} />
                </span>
                <span className="text-right">
                  {quote.status === "open" && (
                    <form action={acceptQuote}>
                      <input type="hidden" name="quoteId" value={quote.id} />
                      <input type="hidden" name="description" value={quote.description} />
                      <button
                        type="submit"
                        className="h-8 rounded-md bg-[#14171F] px-3 text-xs font-bold text-white transition-colors hover:bg-[#2A2E38]"
                      >
                        Accept
                      </button>
                    </form>
                  )}
                </span>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Orders */}
      <section id="orders" className="mb-10 scroll-mt-6">
        <SectionHeader title="Orders" count={orders.length} />
        {orders.length === 0 ? (
          <EmptyState
            message="No orders yet. Find what you need in the catalogue and check out in a few clicks."
            href="/products"
            label="Browse the catalogue"
          />
        ) : (
          <div className="overflow-hidden rounded-2xl border border-[#E5E5E7] bg-white shadow-sm">
            <div className="grid grid-cols-[100px_1fr_100px_160px_90px] gap-4 border-b border-[#E5E5E7] bg-[#FAFAFB] px-5 py-2.5 text-[11px] font-bold tracking-wide text-[#9AA2B1]">
              <span>REFERENCE</span>
              <span>DETAILS</span>
              <span>DATE</span>
              <span>STATUS</span>
              <span />
            </div>
            {orders.map((order, i) => (
              <div
                key={order.id}
                className={`grid grid-cols-[100px_1fr_100px_160px_90px] items-center gap-4 px-5 py-4 transition-colors hover:bg-[#FAFAFB] ${
                  i < orders.length - 1 ? "border-b border-[#F1F2F4]" : ""
                }`}
              >
                <span className="text-sm font-semibold text-[#6B7280]">{order.reference}</span>
                <span className="min-w-0 truncate text-sm">
                  {order.description} <span className="text-[#9AA2B1]">· qty {order.quantity}</span>
                </span>
                <span className="text-[13px] text-[#6B7280]">{shortDate(order.created_at)}</span>
                <span>
                  <StatusPill status={order.status} />
                </span>
                <span className="text-right">
                  {order.status === "pending_payment" && order.payment_url && (
                    <a
                      href={order.payment_url}
                      className="inline-block h-8 rounded-md bg-[#FF4438] px-3 text-xs font-bold leading-8 text-white transition-colors hover:bg-[#E63A2F]"
                    >
                      Pay now
                    </a>
                  )}
                </span>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Saved parts */}
      <section id="saved" className="scroll-mt-6">
        <SectionHeader title="Saved Parts" count={savedParts.length} />
        {savedParts.length === 0 ? (
          <EmptyState
            message="No saved parts yet. Use the bookmark on any product to keep it here for next time."
            href="/products"
            label="Browse the catalogue"
          />
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