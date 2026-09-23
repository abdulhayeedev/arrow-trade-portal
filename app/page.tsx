const filterChips = ["Bearing reference", "Shaft size", "Torque limiters", "Manufacturer ref"];

const features = [
  { title: "ACCOUNT PRICING", desc: "Contract rates, live" },
  { title: "NEXT-DAY UK DISPATCH", desc: "Order before 4pm" },
  { title: "ENGINEER-CHECKED SPECS", desc: "Before you commit" },
  { title: "ISO 9001 SUPPLY", desc: "Trade accounts since 1974" },
];

const activity = [
  {
    ref: "PO-48213",
    desc: "GR-24 taper bore hub, 42mm",
    meta: "DISPATCHED TODAY · DPD 1–2 DAY",
    value: "qty 12",
    dot: "bg-[#1D7A34]",
  },
  {
    ref: "RFQ-1092",
    desc: "Custom torque limiter, 10 Nm",
    meta: "WITH ENGINEERING · RESPONSE DUE TOMORROW",
    value: "Awaiting",
    dot: "bg-[#2563EB]",
  },
  {
    ref: "Q-3307",
    desc: "Stainless bearing inserts, UCX",
    meta: "VALID 21 DAYS · READY TO ACCEPT",
    value: "£1,284.00",
    dot: "bg-[#FF4438]",
  },
];

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col bg-white text-[#14171F]">
      {/* Top nav */}
      <header className="flex h-[76px] items-center justify-between border-b border-[#E5E5E7] px-12">
        <div className="flex items-center gap-11">
          <div className="flex items-center">
            <img src="/images/logo.png" alt="Arrow Engineering" className="h-14 w-auto" />
          </div>
          <nav className="flex items-center gap-8 text-sm font-semibold">
            <span className="text-[#14171F]">Find products</span>
            <span className="text-[#6B7280]">RFQs &amp; quotes</span>
            <span className="text-[#6B7280]">Orders</span>
            <span className="text-[#6B7280]">Documents</span>
          </nav>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative flex h-9 w-9 items-center justify-center rounded-full border border-[#E5E5E7]">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#6B7280" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
              <path d="M13.73 21a2 2 0 0 1-3.46 0" />
            </svg>
            <div className="absolute right-[5px] top-1 h-[7px] w-[7px] rounded-full border-[1.5px] border-white bg-[#FF4438]" />
          </div>
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#FF4438]">
              <span className="font-heading text-xs font-bold text-white">WB</span>
            </div>
            <span className="text-[13.5px] font-semibold text-[#14171F]">
              J. Smith <span className="text-[#9AA2B1]">·</span> Warburtons Ltd
            </span>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden px-12 pb-14 pt-[72px]">
        <div className="relative mx-auto flex max-w-[780px] flex-col items-center text-center">
          <h1 className="font-heading text-[58px] font-extrabold uppercase leading-[1.05] tracking-tight">
            <span className="block text-[#14171F]">Arrow Engineering Trade</span>
            <span className="block text-[#FF4438]">B2B Procurement, Simplified.</span>
          </h1>
          <p className="mt-[22px] max-w-[540px] text-[15.5px] leading-relaxed text-[#6B7280]">
            Search by part reference, dimensions or the engineering problem you&rsquo;re solving — or
            upload a drawing and let an engineer confirm the right solution.
          </p>

          <div className="mt-8 flex items-center gap-5">
            <form className="flex max-w-[680px] items-center gap-3 rounded-2xl border border-[#E5E5E7] bg-white py-2.5 pl-6 pr-2.5 shadow-sm">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#9AA2B1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
                <circle cx="11" cy="11" r="8" />
                <path d="M21 21l-4.35-4.35" />
              </svg>
              <input
                type="text"
                placeholder="e.g. torque limiter for a 14mm keyed shaft at 10 Nm"
                className="h-14 grow bg-transparent text-base text-[#14171F] outline-none placeholder:text-[#9AA2B1]"
              />
              <button
                type="button"
                className="flex h-[52px] shrink-0 items-center gap-2 rounded-xl bg-[#14171F] px-6 text-sm font-bold tracking-wide text-white"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <path d="M17 8l-5-5-5 5" />
                  <path d="M12 3v12" />
                </svg>
                UPLOAD
              </button>
            </form>
            <img
              src="/images/assistant.gif"
              alt="Ask Arrow"
              className="h-[92px] w-[92px] shrink-0 rounded-full border border-[#E5E5E7] object-cover shadow-sm"
            />
          </div>
        </div>
      </section>

      {/* Account status panel */}
      <section className="px-12 pb-14 pt-2">
        <div className="flex flex-col gap-7 border-t border-[#E5E5E7] pt-10">
          <div className="flex items-end justify-between">
            <div>
              <span className="text-[11px] font-bold tracking-[1.4px] text-[#FF4438]">
                LIVE ACCOUNT STATUS
              </span>
              <div className="font-heading mt-1 text-[26px] font-bold text-[#14171F]">Warburtons Ltd</div>
            </div>
            <div className="text-right">
              <div className="text-[10.5px] font-bold tracking-wide text-[#9AA2B1]">LAST SYNC</div>
              <div className="mt-0.5 text-[13px] text-[#374151]">09:24 BST</div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="rounded-xl border border-[#E5E5E7] bg-white p-5 shadow-sm">
              <span className="text-[11px] font-bold tracking-wide text-[#9AA2B1]">OPEN QUOTES</span>
              <div className="font-heading mt-1.5 text-[30px] font-bold text-[#14171F]">04</div>
            </div>
            <div className="rounded-xl border border-[#E5E5E7] bg-white p-5 shadow-sm">
              <span className="text-[11px] font-bold tracking-wide text-[#9AA2B1]">ORDERS IN PROGRESS</span>
              <div className="font-heading mt-1.5 text-[30px] font-bold text-[#14171F]">07</div>
            </div>
            <div className="rounded-xl border border-[#E5E5E7] bg-white p-5 shadow-sm">
              <span className="text-[11px] font-bold tracking-wide text-[#9AA2B1]">SAVED PARTS</span>
              <div className="font-heading mt-1.5 text-[30px] font-bold text-[#FF4438]">23</div>
            </div>
          </div>

          <div className="overflow-hidden rounded-xl border border-[#E5E5E7] bg-white shadow-sm">
            <div className="flex items-center justify-between border-b border-[#E5E5E7] px-[22px] py-4">
              <span className="text-[11px] font-bold tracking-wide text-[#374151]">RECENT ACTIVITY</span>
              <a href="#" className="text-xs font-bold tracking-wide text-[#FF4438]">
                VIEW ALL
              </a>
            </div>
            {activity.map((row, i) => (
              <div
                key={row.ref}
                className={`flex items-center gap-3.5 px-[22px] py-4 transition-colors hover:bg-[#FAFAFB] ${
                  i < activity.length - 1 ? "border-b border-[#F1F1F3]" : ""
                }`}
              >
                <div className={`h-[7px] w-[7px] shrink-0 rounded-full ${row.dot}`} />
                <div className="grow">
                  <div className="text-sm font-semibold text-[#14171F]">
                    {row.ref} <span className="font-normal text-[#9AA2B1]">·</span> {row.desc}
                  </div>
                  <div className="mt-0.5 text-[11.5px] tracking-wide text-[#9AA2B1]">{row.meta}</div>
                </div>
                <span className="shrink-0 text-[13px] font-semibold text-[#374151]">{row.value}</span>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="cursor-pointer rounded-xl border border-[#FF4438] bg-[#FFF3F2] p-[22px] transition-transform hover:-translate-y-0.5">
              <span className="text-[10.5px] font-bold tracking-wide text-[#A50D24]">
                STRAIGHTFORWARD PRODUCTS
              </span>
              <div className="font-heading mt-1.5 text-xl font-bold text-[#14171F]">Browse catalogue</div>
              <div className="mt-2.5 text-[12.5px] font-semibold text-[#FF4438]">
                Find · Configure · Checkout →
              </div>
            </div>
            <div className="cursor-pointer rounded-xl border border-[#E5E5E7] bg-white p-[22px] shadow-sm transition-transform hover:-translate-y-0.5">
              <span className="text-[10.5px] font-bold tracking-wide text-[#6B7280]">
                ENGINEERING ENQUIRY
              </span>
              <div className="font-heading mt-1.5 text-xl font-bold text-[#14171F]">Start an RFQ</div>
              <div className="mt-2.5 text-[12.5px] font-semibold text-[#374151]">
                Drawing · Review · Quotation →
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#1D7A34" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <path d="M22 4L12 14.01l-3-3" />
            </svg>
            <span className="text-[12.5px] text-[#6B7280]">
              ISO 9001 certified supply · Trade accounts since 1974
            </span>
          </div>
        </div>
      </section>
    </main>
  );
}