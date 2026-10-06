import { createClient } from "@/lib/supabase/server";
import { isStaff, getAllRfqs, getAllCompanies } from "@/lib/admin";
import { respondToRfq, createQuote, createOrder } from "@/app/admin/rfqs/actions";
import { redirect } from "next/navigation";
import SiteHeader from "@/components/SiteHeader";

export default async function AdminRfqsPage({
  searchParams,
}: {
  searchParams: { message?: string; error?: string };
}) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const staff = await isStaff(user?.id ?? null);
  if (!staff) {
    redirect("/login");
  }

  const rfqs = await getAllRfqs();
  const companies = await getAllCompanies();
  const awaiting = rfqs.filter((r) => r.status === "awaiting_quote");
  const responded = rfqs.filter((r) => r.status !== "awaiting_quote");

  return (
    <main className="min-h-screen bg-[#FAFAFB] text-[#14171F]">
      <SiteHeader active="Admin" user={user} />
      <div className="mx-auto max-w-[1180px] px-14 py-12">
      <div className="mb-8">
        <span className="text-[11px] font-bold tracking-[1.4px] text-[#FF4438]">
          INTERNAL — STAFF ONLY
        </span>
        <h1 className="font-heading mt-1 text-3xl font-bold">Incoming RFQs</h1>
      </div>

      {searchParams.message && (
        <div className="mb-6 rounded-lg border border-[#1D7A34] bg-[#EAF6EC] px-4 py-3 text-sm text-[#1D7A34]">
          {searchParams.message}
        </div>
      )}
      {searchParams.error && (
        <div className="mb-6 rounded-lg border border-[#C8102E] bg-[#FFF3F2] px-4 py-3 text-sm text-[#A50D24]">
          {searchParams.error}
        </div>
      )}

      <section className="mb-12">
        <h2 className="font-heading mb-4 text-xl font-bold">
          Awaiting a quote ({awaiting.length})
        </h2>
        {awaiting.length === 0 ? (
          <p className="text-sm text-[#6B7280]">Nothing waiting on you right now.</p>
        ) : (
          <div className="flex flex-col gap-4">
            {awaiting.map((rfq) => (
              <div key={rfq.id} className="rounded-xl border border-[#E5E5E7] p-5 shadow-sm">
                <div className="mb-3 flex items-center justify-between">
                  <div>
                    <span className="text-xs font-semibold text-[#9AA2B1]">
                      {rfq.reference} · {rfq.company_name}
                    </span>
                    <p className="mt-1 text-sm text-[#14171F]">{rfq.description}</p>
                  </div>
                  {rfq.attachment_url && (
                    <a
                      href={rfq.attachment_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="shrink-0 text-xs font-semibold text-[#FF4438]"
                    >
                      View attachment →
                    </a>
                  )}
                </div>

                <form
                  action={respondToRfq}
                  className="grid grid-cols-[1fr_140px_140px_auto] items-end gap-3 border-t border-[#F1F2F4] pt-4"
                >
                  <input type="hidden" name="rfqId" value={rfq.id} />
                  <input type="hidden" name="companyId" value={rfq.company_id} />

                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-semibold text-[#6B7280]">Quote details</label>
                    <input
                      name="quoteDescription"
                      required
                      defaultValue={rfq.description}
                      className="h-9 rounded-md border border-[#E5E5E7] px-2.5 text-sm outline-none focus:border-[#14171F]"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-semibold text-[#6B7280]">Value (£)</label>
                    <input
                      name="value"
                      type="number"
                      step="0.01"
                      className="h-9 rounded-md border border-[#E5E5E7] px-2.5 text-sm outline-none focus:border-[#14171F]"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-semibold text-[#6B7280]">Valid until</label>
                    <input
                      name="validUntil"
                      type="date"
                      className="h-9 rounded-md border border-[#E5E5E7] px-2.5 text-sm outline-none focus:border-[#14171F]"
                    />
                  </div>
                  <button
                    type="submit"
                    className="h-9 rounded-md bg-[#FF4438] px-4 text-xs font-bold text-white"
                  >
                    Send quote
                  </button>
                </form>
              </div>
            ))}
          </div>
        )}
      </section>

      <section>
        <h2 className="font-heading mb-4 text-xl font-bold">Already responded to</h2>
        {responded.length === 0 ? (
          <p className="text-sm text-[#6B7280]">Nothing here yet.</p>
        ) : (
          <div className="overflow-hidden rounded-xl border border-[#E5E5E7]">
            {responded.map((rfq, i) => (
              <div
                key={rfq.id}
                className={`flex items-center gap-4 px-5 py-4 ${
                  i < responded.length - 1 ? "border-b border-[#F1F2F4]" : ""
                }`}
              >
                <span className="w-28 shrink-0 text-sm font-semibold text-[#9AA2B1]">
                  {rfq.reference}
                </span>
                <span className="w-40 shrink-0 text-sm text-[#6B7280]">{rfq.company_name}</span>
                <span className="grow text-sm">{rfq.description}</span>
                <span className="text-xs font-bold uppercase tracking-wide text-[#1D7A34]">
                  {rfq.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </section>

      <div className="mt-12 grid grid-cols-2 gap-6">
        <section className="rounded-xl border border-[#E5E5E7] bg-white p-5 shadow-sm">
          <h2 className="font-heading mb-4 text-lg font-bold">Create a quote</h2>
          <form action={createQuote} className="flex flex-col gap-3">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-[#6B7280]">Company</label>
              <select
                name="companyId"
                required
                className="h-9 rounded-md border border-[#E5E5E7] px-2.5 text-sm outline-none focus:border-[#14171F]"
              >
                <option value="">Select a company…</option>
                {companies.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-[#6B7280]">Description</label>
              <input
                name="description"
                required
                className="h-9 rounded-md border border-[#E5E5E7] px-2.5 text-sm outline-none focus:border-[#14171F]"
              />
            </div>
            <div className="flex gap-3">
              <div className="flex flex-1 flex-col gap-1">
                <label className="text-xs font-semibold text-[#6B7280]">Value (£)</label>
                <input
                  name="value"
                  type="number"
                  step="0.01"
                  className="h-9 w-full rounded-md border border-[#E5E5E7] px-2.5 text-sm outline-none focus:border-[#14171F]"
                />
              </div>
              <div className="flex flex-1 flex-col gap-1">
                <label className="text-xs font-semibold text-[#6B7280]">Valid until</label>
                <input
                  name="validUntil"
                  type="date"
                  className="h-9 w-full rounded-md border border-[#E5E5E7] px-2.5 text-sm outline-none focus:border-[#14171F]"
                />
              </div>
            </div>
            <button
              type="submit"
              className="mt-1 h-9 rounded-md bg-[#FF4438] text-xs font-bold text-white"
            >
              Create quote
            </button>
          </form>
        </section>

        <section className="rounded-xl border border-[#E5E5E7] bg-white p-5 shadow-sm">
          <h2 className="font-heading mb-4 text-lg font-bold">Create an order</h2>
          <form action={createOrder} className="flex flex-col gap-3">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-[#6B7280]">Company</label>
              <select
                name="companyId"
                required
                className="h-9 rounded-md border border-[#E5E5E7] px-2.5 text-sm outline-none focus:border-[#14171F]"
              >
                <option value="">Select a company…</option>
                {companies.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-[#6B7280]">Description</label>
              <input
                name="description"
                required
                className="h-9 rounded-md border border-[#E5E5E7] px-2.5 text-sm outline-none focus:border-[#14171F]"
              />
            </div>
            <div className="flex gap-3">
              <div className="flex flex-1 flex-col gap-1">
                <label className="text-xs font-semibold text-[#6B7280]">Quantity</label>
                <input
                  name="quantity"
                  type="number"
                  min={1}
                  defaultValue={1}
                  className="h-9 w-full rounded-md border border-[#E5E5E7] px-2.5 text-sm outline-none focus:border-[#14171F]"
                />
              </div>
              <div className="flex flex-1 flex-col gap-1">
                <label className="text-xs font-semibold text-[#6B7280]">Status</label>
                <select
                  name="status"
                  defaultValue="processing"
                  className="h-9 w-full rounded-md border border-[#E5E5E7] px-2.5 text-sm outline-none focus:border-[#14171F]"
                >
                  <option value="processing">Processing</option>
                  <option value="dispatched">Dispatched</option>
                  <option value="delivered">Delivered</option>
                </select>
              </div>
            </div>
            <button
              type="submit"
              className="mt-1 h-9 rounded-md bg-[#14171F] text-xs font-bold text-white"
            >
              Create order
            </button>
          </form>
        </section>
      </div>
      </div>
    </main>
  );
}