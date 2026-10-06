import { saveAddress } from "@/app/profile/actions";

type Address = Record<string, string | null> | null;

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

export default function ProfileAddressForm({ address }: { address: Address }) {
  return (
    <section className="mb-6 rounded-2xl border border-[#E5E5E7] bg-white p-6 shadow-sm">
      <h2 className="font-heading mb-1 text-lg font-bold">Address</h2>
      <p className="mb-5 text-sm text-[#6B7280]">
        Saved to your profile and used to prefill checkout.
      </p>

      <form action={saveAddress} className="flex flex-col gap-6">
        <div className="flex flex-col gap-4">
          <h3 className="text-sm font-bold text-[#14171F]">Phone</h3>
          <Field label="Phone number" name="phone" type="tel" defaultValue={address?.phone} />
        </div>

        <div className="flex flex-col gap-4">
          <h3 className="text-sm font-bold text-[#14171F]">Billing address</h3>
          <Field label="Address line 1" name="billing_address_1" defaultValue={address?.billing_address_1} required />
          <Field label="Address line 2 (optional)" name="billing_address_2" defaultValue={address?.billing_address_2} />
          <div className="grid grid-cols-2 gap-4">
            <Field label="Town / city" name="billing_city" defaultValue={address?.billing_city} required />
            <Field label="Postcode" name="billing_postcode" defaultValue={address?.billing_postcode} required />
          </div>
          <CountrySelect name="billing_country" defaultValue={address?.billing_country} />
        </div>

        <div className="flex flex-col gap-4">
          <div>
            <h3 className="text-sm font-bold text-[#14171F]">Delivery address</h3>
            <p className="mt-0.5 text-xs text-[#9AA2B1]">
              Leave this blank to deliver to your billing address.
            </p>
          </div>
          <Field label="Address line 1" name="shipping_address_1" defaultValue={address?.shipping_address_1} />
          <Field label="Address line 2 (optional)" name="shipping_address_2" defaultValue={address?.shipping_address_2} />
          <div className="grid grid-cols-2 gap-4">
            <Field label="Town / city" name="shipping_city" defaultValue={address?.shipping_city} />
            <Field label="Postcode" name="shipping_postcode" defaultValue={address?.shipping_postcode} />
          </div>
          <CountrySelect name="shipping_country" defaultValue={address?.shipping_country} />
        </div>

        <button
          type="submit"
          className="h-11 self-start rounded-lg bg-[#14171F] px-5 text-sm font-bold text-white"
        >
          Save address
        </button>
      </form>
    </section>
  );
}