import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import SiteHeader from "@/components/SiteHeader";

export default async function Home() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <main className="flex min-h-screen flex-col bg-white text-[#14171F]">
      <SiteHeader active="Find products" user={user} />

      {/* USP bar */}
      <section className="border-b border-[#E5E5E7] bg-[#FAFAFB] px-14 py-6">
        <div className="mx-auto grid max-w-[1180px] grid-cols-5 gap-6">
          {[
            {
              title: "Established 1981",
              desc: "Providing excellent service for over 40 years",
              icon: (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#FF4438" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="4" width="18" height="18" rx="2" />
                  <path d="M16 2v4M8 2v4M3 10h18" />
                </svg>
              ),
            },
            {
              title: "24/7 Engineering Support",
              desc: "Keep on running",
              icon: (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#FF4438" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <path d="M12 6v6l4 2" />
                </svg>
              ),
            },
            {
              title: "Same Day Dispatch",
              desc: "Fast processing on stocked items",
              icon: (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#FF4438" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="1" y="3" width="15" height="13" />
                  <path d="M16 8h4l3 3v5h-7V8z" />
                  <circle cx="5.5" cy="18.5" r="2.5" />
                  <circle cx="18.5" cy="18.5" r="2.5" />
                </svg>
              ),
            },
            {
              title: "In-House Engineering",
              desc: "Our engineers keep your business running",
              icon: (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#FF4438" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
                </svg>
              ),
            },
            {
              title: "Global Shipping",
              desc: "Next-day shipping on selected UK items",
              icon: (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#FF4438" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                </svg>
              ),
            },
          ].map((item) => (
            <div key={item.title} className="flex items-start gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#FFF3F2]">
                {item.icon}
              </div>
              <div>
                <div className="text-[13px] font-bold leading-tight text-[#14171F]">
                  {item.title}
                </div>
                <div className="mt-0.5 text-[11.5px] leading-snug text-[#6B7280]">{item.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Hero */}
      <section
        className="relative overflow-hidden px-14 py-16"
        style={{
          backgroundImage:
            "linear-gradient(to right, rgba(255,255,255,0.98) 0%, rgba(255,255,255,0.96) 4%, rgba(255,255,255,0.55) 30%, rgba(255,255,255,0.15) 40%), url('https://arrowengineering.com/wp-content/uploads/2026/10/trade-banner-scaled.jpeg')",
          backgroundSize: "cover",
          backgroundPosition: "right center",
        }}
      >
        <div className="relative mx-auto max-w-[1180px]">
        <div className="max-w-[620px]">
          <h1 className="font-heading text-[52px] font-extrabold uppercase leading-[1.08] tracking-tight">
            <span className="block text-[#14171F]">Arrow Engineering Trade</span>
            <span className="block text-[#FF4438]">B2B Procurement, Simplified.</span>
          </h1>
          <p className="mt-4 inline-block max-w-[480px] rounded-xl bg-white/75 px-3.5 py-2.5 text-base leading-relaxed text-[#374151] backdrop-blur-sm">
            Search by part reference, dimensions or the engineering problem you&rsquo;re solving —
            or upload a drawing and let an engineer confirm the right solution.
          </p>

          <form
            action="/products"
            method="GET"
            className="mt-7 flex max-w-[560px] items-center gap-3 rounded-2xl border border-[#E5E5E7] bg-white py-2 pl-5 pr-2 shadow-[0_10px_28px_rgba(20,23,31,0.08)]"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#9AA2B1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
              <circle cx="11" cy="11" r="8" />
              <path d="M21 21l-4.35-4.35" />
            </svg>
            <input
              type="text"
              name="q"
              placeholder="e.g. torque limiter for a 14mm keyed shaft"
              className="h-11 grow bg-transparent text-sm text-[#14171F] outline-none placeholder:text-[#9AA2B1]"
            />
            <button
              type="submit"
              className="h-11 shrink-0 rounded-xl bg-[#14171F] px-6 text-[13px] font-bold text-white"
            >
              Search
            </button>
          </form>

          <div className="mt-4 flex flex-wrap gap-2.5">
            {["Bearing reference", "Shaft size", "Torque limiters"].map((chip) => (
              <span
                key={chip}
                className="rounded-full border border-[#E5E5E7] bg-white/80 px-4 py-1.5 text-[12.5px] font-semibold text-[#6B7280] backdrop-blur-sm"
              >
                {chip}
              </span>
            ))}
          </div>
        </div>
        </div>
      </section>

      {/* Quick actions */}
      <section className="px-14 py-14">
        <div className="mx-auto max-w-[1180px]">
          <h2 className="font-heading mb-5 text-2xl font-bold text-[#14171F]">
            Two ways to get what you need
          </h2>
          <div className="grid grid-cols-2 gap-5">
            <a
              href="/products"
              className="rounded-2xl border border-[#FF4438] bg-[#FFF3F2] p-6 transition-all hover:-translate-y-0.5 hover:shadow-[0_14px_32px_rgba(255,68,56,0.14)]"
            >
              <span className="text-[10.5px] font-bold text-[#A50D24]">
                STRAIGHTFORWARD PRODUCTS
              </span>
              <div className="font-heading mt-1 text-xl font-bold text-[#14171F]">
                Browse catalogue
              </div>
              <p className="mt-2 text-sm text-[#6B7280]">
                Find a product, add it to your basket, and check out with your account pricing
                already applied.
              </p>
              <div className="group mt-3 flex items-center gap-1.5 text-[12.5px] font-semibold text-[#FF4438]">
                Find · Configure · Checkout
                <span className="transition-transform group-hover:translate-x-1">→</span>
              </div>
            </a>
            <a
              href="/rfq"
              className="rounded-2xl border border-[#E5E5E7] bg-white p-6 shadow-sm transition-all hover:-translate-y-0.5 hover:border-[#FF4438] hover:shadow-[0_14px_32px_rgba(255,68,56,0.14)]"
            >
              <span className="text-[10.5px] font-bold text-[#6B7280]">ENGINEERING ENQUIRY</span>
              <div className="font-heading mt-1 text-xl font-bold text-[#14171F]">
                Start an RFQ
              </div>
              <p className="mt-2 text-sm text-[#6B7280]">
                Describe your problem or upload a drawing, and an engineer will come back with a
                quotation.
              </p>
              <div className="group mt-3 flex items-center gap-1.5 text-[12.5px] font-semibold text-[#374151]">
                Drawing · Review · Quotation
                <span className="transition-transform group-hover:translate-x-1">→</span>
              </div>
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}