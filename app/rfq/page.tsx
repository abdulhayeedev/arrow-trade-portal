import { submitRfq } from "@/app/rfq/actions";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function RfqPage({
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

  return (
    <main className="flex min-h-screen items-center justify-center bg-white px-6 py-12">
      <div className="w-full max-w-lg">
        <div className="mb-8">
          <a href="/" className="text-sm font-semibold text-[#FF4438]">
            ← Back to home
          </a>
        </div>

        <span className="text-[11px] font-bold tracking-[1.4px] text-[#FF4438]">
          ENGINEERING ENQUIRY
        </span>
        <h1 className="font-heading mt-1 text-3xl font-bold text-[#14171F]">Start an RFQ</h1>
        <p className="mt-2 text-sm text-[#6B7280]">
          Describe what you need — a part reference, dimensions, or the problem you&rsquo;re
          solving — and optionally attach a drawing or photo. An engineer will review it and
          come back with a quotation.
        </p>

        {searchParams.error && (
          <div className="mt-4 rounded-lg border border-[#C8102E] bg-[#FFF3F2] px-4 py-3 text-sm text-[#A50D24]">
            {searchParams.error}
          </div>
        )}

        <form action={submitRfq} className="mt-8 flex flex-col gap-5">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="description" className="text-sm font-semibold text-[#14171F]">
              What do you need?
            </label>
            <textarea
              id="description"
              name="description"
              required
              rows={5}
              placeholder="e.g. Torque limiter for a 14mm keyed shaft at around 10 Nm"
              className="rounded-lg border border-[#E5E5E7] px-3.5 py-3 text-sm text-[#14171F] outline-none focus:border-[#14171F]"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="attachment" className="text-sm font-semibold text-[#14171F]">
              Drawing or photo (optional)
            </label>
            <input
              id="attachment"
              name="attachment"
              type="file"
              accept="image/*,.pdf,.dwg,.dxf"
              className="rounded-lg border border-[#E5E5E7] px-3.5 py-3 text-sm text-[#14171F] outline-none file:mr-3 file:rounded-md file:border-0 file:bg-[#14171F] file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-white"
            />
          </div>

          <button
            type="submit"
            className="mt-2 h-11 rounded-lg bg-[#FF4438] text-sm font-bold text-white"
          >
            Submit RFQ
          </button>
        </form>
      </div>
    </main>
  );
}