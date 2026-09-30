import { getDashboardData } from "@/lib/dashboard";
import { redirect } from "next/navigation";

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
  const data = await getDashboardData();

  if (!data) {
    redirect("/login");
  }

  const { companyName, rfqs, quotes, orders, savedParts } = data;

  return (
    <main className="min-h-screen bg-white px-12 py-12 text-[#14171F]">
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
            {orders.filter((o) => o.status !== "delivered").length}
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
          <div className="grid grid-cols-4 gap-4">
            {savedParts.map((part) => (
              <a
                key={part.id}
                href={`/products?q=${encodeURIComponent(part.product_name)}`}
                className="rounded-xl border border-[#E5E5E7] p-4 text-sm shadow-sm"
              >
                {part.product_name}
              </a>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}