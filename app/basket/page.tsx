import { createClient } from "@/lib/supabase/server";
import { updateQuantity, removeItem, checkout } from "@/app/basket/actions";
import { redirect } from "next/navigation";

export default async function BasketPage({
  searchParams,
}: {
  searchParams: { error?: string };
}) {
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

  const items = membership
    ? (
        await supabase
          .from("basket_items")
          .select("*")
          .eq("company_id", membership.company_id)
          .order("created_at", { ascending: true })
      ).data ?? []
    : [];

  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <main className="min-h-screen bg-white px-12 py-12 text-[#14171F]">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="font-heading text-3xl font-bold">Basket</h1>
        <a href="/products" className="text-sm font-semibold text-[#FF4438]">
          ← Continue shopping
        </a>
      </div>

      {searchParams.error && (
        <div className="mb-6 rounded-lg border border-[#C8102E] bg-[#FFF3F2] px-4 py-3 text-sm text-[#A50D24]">
          {searchParams.error}
        </div>
      )}

      {items.length === 0 ? (
        <p className="text-sm text-[#6B7280]">Your basket is empty.</p>
      ) : (
        <>
          <div className="overflow-hidden rounded-xl border border-[#E5E5E7]">
            {items.map((item, i) => (
              <div
                key={item.id}
                className={`flex items-center gap-4 px-5 py-4 ${
                  i < items.length - 1 ? "border-b border-[#F1F2F4]" : ""
                }`}
              >
                <span className="grow text-sm font-semibold">{item.product_name}</span>
                <span className="text-sm text-[#6B7280]">£{item.price} each</span>

                <form action={updateQuantity} className="flex items-center gap-2">
                  <input type="hidden" name="itemId" value={item.id} />
                  <input
                    type="number"
                    name="quantity"
                    defaultValue={item.quantity}
                    min={0}
                    className="h-9 w-16 rounded-md border border-[#E5E5E7] px-2 text-center text-sm"
                  />
                  <button
                    type="submit"
                    className="h-9 rounded-md border border-[#E5E5E7] px-3 text-xs font-semibold"
                  >
                    Update
                  </button>
                </form>

                <span className="w-20 text-right text-sm font-bold text-[#FF4438]">
                  £{(item.price * item.quantity).toFixed(2)}
                </span>

                <form action={removeItem}>
                  <input type="hidden" name="itemId" value={item.id} />
                  <button type="submit" className="text-xs font-semibold text-[#9AA2B1]">
                    Remove
                  </button>
                </form>
              </div>
            ))}
          </div>

          <div className="mt-6 flex items-center justify-between">
            <span className="text-lg font-bold">Total: £{total.toFixed(2)}</span>
            <form action={checkout}>
              <button
                type="submit"
                className="h-11 rounded-lg bg-[#FF4438] px-6 text-sm font-bold text-white"
              >
                Checkout
              </button>
            </form>
          </div>
        </>
      )}
    </main>
  );
}