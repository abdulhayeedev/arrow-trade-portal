import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import SiteHeader from "@/components/SiteHeader";
import { placeOrder } from "@/app/checkout/actions";

const inputClass =
  "h-11 w-full rounded-lg border border-[#E5E5E7] px-3.5 text-sm text-[#14171F] outline-none focus:border-[#14171F]";

function Field({
  label,
  name,
  defaultValue,
  required,
  type = "text",
}: {
  label: string;
  name: string;
  defaultValue?: string | null;
  required?: boolean;
  type?: string;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={name} className="text-sm font-semibold text-[#14171F]">
        {label}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        required={required}
        defaultValue={defaultValue ?? ""}
        className={inputClass}
      />
    </div>
  );
}

function CountrySelect({ name, defaultValue }: { name: string; defaultValue?: string | null }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={name} className="text-sm font-semibold text-[#14171F]">
        Country
      </label>
      <select id={name} name={name} defaultValue={defaultValue || "GB"} className={inputClass}>
        <option value="GB">United Kingdom</option>
        <option value="IE">Ireland</option>
        <option value="FR">France</option>
        <option value="DE">Germany</option>
        <option value="NL">Netherlands</option>
        <option value="US">United States</option>
      </select>
    </div>
  );
}

export default async function CheckoutPage({
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
    .maybeSingle();

  if (!membership) {
    redirect("/basket");
  }

  const { data: items } = await supabase
    .from("basket_items")
    .select("*")
    .eq("company_id", membership.company_id)
    .order("created_at", { ascending: true });

  if (!items || items.length === 0) {
    redirect("/basket");
  }

  const { data: details } = await supabase
    .from("company_checkout_details")
    .select("*")
    .eq("company_id", membership.company_id)
    .maybeSingle();

  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <main className="min-h-screen bg-[#FAFAFB] text-[#14171F]">
      <SiteHeader user={user} />

      <div className="mx-auto max-w-[1180px] px-14 py-12">
        <div className="mb-8 flex items-center justify-between">
          <h1 className="font-heading text-3xl font-bold">Checkout</h1>
          <a href="/basket" className="text-sm font-semibold text-[#FF4438]">
            ← Back to basket
          </a>
        </div>

        {searchParams.error && (
          <div className="mb-6 rounded-lg border border-[#C8102E] bg-[#FFF3F2] px-4 py-3 text-sm text-[#A50D24]">
            {searchParams.error}
          </div>
        )}

        <form action={placeOrder} className="grid grid-cols-[1fr_340px] items-start gap-8">
          <div className="flex flex-col gap-6">
            <section className="rounded-2xl border border-[#E5E5E7] bg-white p-6 shadow-sm">
              <h2 className="font-heading mb-4 text-lg font-bold">Contact</h2>
              <div className="grid grid-cols-2 gap-4">
                <Field label="Full name" name="contactName" defaultValue={details?.contact_name} required />
                <Field label="Phone" name="phone" type="tel" defaultValue={details?.phone} required />
              </div>
            </section>

            <section className="rounded-2xl border border-[#E5E5E7] bg-white p-6 shadow-sm">
              <h2 className="font-heading mb-4 text-lg font-bold">Billing address</h2>
              <div className="flex flex-col gap-4">
                <Field label="Address line 1" name="billing_address_1" defaultValue={details?.billing_address_1} required />
                <Field label="Address line 2 (optional)" name="billing_address_2" defaultValue={details?.billing_address_2} />
                <div className="grid grid-cols-2 gap-4">
                  <Field label="Town / city" name="billing_city" defaultValue={details?.billing_city} required />
                  <Field label="Postcode" name="billing_postcode" defaultValue={details?.billing_postcode} required />
                </div>
                <CountrySelect name="billing_country" defaultValue={details?.billing_country} />
              </div>
            </section>

            <section className="rounded-2xl border border-[#E5E5E7] bg-white p-6 shadow-sm">
              <h2 className="font-heading mb-1 text-lg font-bold">Delivery address</h2>
              <p className="mb-4 text-sm text-[#6B7280]">
                Leave this blank to deliver to your billing address.
              </p>
              <div className="flex flex-col gap-4">
                <Field label="Address line 1" name="shipping_address_1" defaultValue={details?.shipping_address_1} />
                <Field label="Address line 2 (optional)" name="shipping_address_2" defaultValue={details?.shipping_address_2} />
                <div className="grid grid-cols-2 gap-4">
                  <Field label="Town / city" name="shipping_city" defaultValue={details?.shipping_city} />
                  <Field label="Postcode" name="shipping_postcode" defaultValue={details?.shipping_postcode} />
                </div>
                <CountrySelect name="shipping_country" defaultValue={details?.shipping_country} />
              </div>
            </section>

            <section className="rounded-2xl border border-[#E5E5E7] bg-white p-6 shadow-sm">
              <h2 className="font-heading mb-4 text-lg font-bold">Order details</h2>
              <div className="flex flex-col gap-4">
                <Field label="Your PO number (optional)" name="poNumber" />
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="note" className="text-sm font-semibold text-[#14171F]">
                    Notes for Arrow (optional)
                  </label>
                  <textarea
                    id="note"
                    name="note"
                    rows={3}
                    className="rounded-lg border border-[#E5E5E7] px-3.5 py-3 text-sm text-[#14171F] outline-none focus:border-[#14171F]"
                  />
                </div>
              </div>
            </section>
          </div>

          <aside className="sticky top-6 rounded-2xl border border-[#E5E5E7] bg-white p-6 shadow-sm">
            <h2 className="font-heading mb-4 text-lg font-bold">Order summary</h2>
            <div className="flex flex-col gap-3">
              {items.map((item) => (
                <div key={item.id} className="flex justify-between gap-3 text-sm">
                  <span className="text-[#374151]">
                    {item.product_name} <span className="text-[#9AA2B1]">× {item.quantity}</span>
                  </span>
                  <span className="shrink-0 font-semibold">
                    £{(item.price * item.quantity).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
            <div className="mt-4 flex justify-between border-t border-[#F1F2F4] pt-4 text-base font-bold">
              <span>Total</span>
              <span>£{total.toFixed(2)}</span>
            </div>
            <p className="mt-3 text-xs text-[#9AA2B1]">Payment method: Trade account</p>
            <button
              type="submit"
              className="mt-5 h-11 w-full rounded-lg bg-[#FF4438] text-sm font-bold text-white"
            >
              Place order
            </button>
          </aside>
        </form>
      </div>
    </main>
  );
}