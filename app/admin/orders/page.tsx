import { createClient } from "@/lib/supabase/server";
import { isStaff, getAllOrders } from "@/lib/admin";
import { updateOrderStatus } from "@/app/admin/orders/actions";
import { redirect } from "next/navigation";
import SiteHeader from "@/components/SiteHeader";
import AccountSidebar from "@/components/AccountSidebar";

const STATUSES = [
  { key: "pending_payment", label: "Pending payment" },
  { key: "processing", label: "Processing" },
  { key: "dispatched", label: "Dispatched" },
  { key: "delivered", label: "Delivered" },
  { key: "cancelled", label: "Cancelled" },
];

const statusStyles: Record<string, string> = {
  pending_payment: "bg-[#FDF1E4] text-[#B15E00]",
  processing: "bg-[#EEF3FF] text-[#16376B]",
  dispatched: "bg-[#EEF3FF] text-[#16376B]",
  delivered: "bg-[#EAF6EC] text-[#1D7A34]",
  cancelled: "bg-[#FFF3F2] text-[#A50D24]",
};

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: { message?: string; error?: string; status?: string };
}) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const staff = await isStaff(user?.id ?? null);
  if (!staff) {
    redirect("/login");
  }

  const orders = await getAllOrders();
  const filter = STATUSES.some((s) => s.key === searchParams.status) ? searchParams.status : "";
  const visible = filter ? orders.filter((o) => o.status === filter) : orders;

  const count = (key: string) => orders.filter((o) => o.status === key).length;

  const tab = (href: string, label: string, n: number, active: boolean) => (
    <a
      key={label}
      href={href}
      className={`rounded-full border px-3.5 py-1.5 text-[12.5px] font-semibold transition-colors ${
        active
          ? "border-[#FF4438] bg-[#FFF3F2] text-[#FF4438]"
          : "border-[#E5E5E7] bg-white text-[#6B7280] hover:border-[#14171F] hover:text-[#14171F]"
      }`}
    >
      {label} <span className="text-[#9AA2B1]">{n}</span>
    </a>
  );

  return (
    <main className="min-h-screen bg-[#FAFAFB] text-[#14171F]">
      <SiteHeader active="Admin" user={user} />
      <div className="mx-auto grid max-w-[1180px] grid-cols-[220px_1fr] gap-10 px-14 py-12">
        <AccountSidebar active="orders" staff={true} />
        <div className="min-w-0">
          <div className="mb-6">
            <span className="text-[11px] font-bold tracking-[1.4px] text-[#FF4438]">
              INTERNAL — STAFF ONLY
            </span>
            <h1 className="font-heading mt-1 text-3xl font-bold">Customer orders</h1>
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

          <div className="mb-6 flex flex-wrap gap-2">
            {tab("/admin/orders", "All", orders.length, filter === "")}
            {STATUSES.map((s) =>
              tab(`/admin/orders?status=${s.key}`, s.label, count(s.key), filter === s.key)
            )}
          </div>

          {visible.length === 0 ? (
            <p className="text-sm text-[#6B7280]">
              {orders.length === 0 ? "No orders have been placed yet." : "No orders with that status."}
            </p>
          ) : (
            <div className="overflow-hidden rounded-xl border border-[#E5E5E7] bg-white shadow-sm">
              {visible.map((order, i) => (
                <div
                  key={order.id}
                  className={`flex items-center gap-4 px-5 py-4 ${
                    i < visible.length - 1 ? "border-b border-[#F1F2F4]" : ""
                  }`}
                >
                  <div className="w-28 shrink-0">
                    <div className="text-sm font-semibold text-[#9AA2B1]">{order.reference}</div>
                    <div className="mt-0.5 text-[11px] text-[#9AA2B1]">
                      {new Date(order.created_at).toLocaleDateString("en-GB", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </div>
                  </div>
                  <div className="w-40 shrink-0 text-sm font-semibold text-[#14171F]">
                    {order.company_name}
                  </div>
                  <div className="min-w-0 grow">
                    <div className="truncate text-sm">{order.description}</div>
                    <div className="mt-0.5 text-[11px] text-[#9AA2B1]">Qty {order.quantity}</div>
                  </div>

                  {order.woo_order_id ? (
                    <div className="flex shrink-0 items-center gap-3">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wide ${
                          statusStyles[order.status] ?? "bg-[#F1F2F4] text-[#6B7280]"
                        }`}
                      >
                        {order.status.replace("_", " ")}
                      </span>
                      <span className="w-24 text-[11px] leading-tight text-[#9AA2B1]">
                        Status synced from WooCommerce
                      </span>
                    </div>
                  ) : (
                    <form action={updateOrderStatus} className="flex shrink-0 items-center gap-2">
                      <input type="hidden" name="id" value={order.id} />
                      <select
                        name="status"
                        defaultValue={order.status}
                        className="h-9 rounded-md border border-[#E5E5E7] px-2.5 text-sm outline-none focus:border-[#14171F]"
                      >
                        {STATUSES.map((s) => (
                          <option key={s.key} value={s.key}>
                            {s.label}
                          </option>
                        ))}
                      </select>
                      <button
                        type="submit"
                        className="h-9 rounded-md bg-[#14171F] px-3 text-xs font-bold text-white"
                      >
                        Save
                      </button>
                    </form>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}