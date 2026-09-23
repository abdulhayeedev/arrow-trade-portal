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
    dot: "bg-[#FF4438]",
  },
  {
    ref: "RFQ-1092",
    desc: "Custom torque limiter, 10 Nm",
    meta: "WITH ENGINEERING · RESPONSE DUE TOMORROW",
    value: "Awaiting",
    dot: "bg-[#4A90FF]",
  },
  {
    ref: "Q-3307",
    desc: "Stainless bearing inserts, UCX",
    meta: "VALID 21 DAYS · READY TO ACCEPT",
    value: "£1,284.00",
    dot: "bg-[#34C759]",
  },
];

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col bg-[#0A0A0C] text-[#EDEDEF]">
      {/* Top nav */}
      <header className="flex h-[76px] items-center justify-between border-b border-[#1C1C20] px-12">
        <div className="flex items-center gap-11">
          <div className="flex items-center gap-2">
            <img src="/images/logo.png" alt="Arrow Engineering" className="h-8 w-auto" />
            <span className="font-heading text-[22px] font-extrabold tracking-wide text-[#FF4438]">TRADE</span>
          </div>
          <nav className="flex items-center gap-8 text-sm font-semibold">
            <span className="text-white">Find products</span>
            <span className="text-[#8C8C93]">RFQs &amp; quotes</span>
            <span className="text-[#8C8C93]">Orders</span>
            <span className="text-[#8C8C93]">Documents</span>
          </nav>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative flex h-9 w-9 items-center justify-center rounded-full border border-[#232327]">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#B4B4BA" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
              <path d="M13.73 21a2 2 0 0 1-3.46 0" />
            </svg>
            <div className="absolute right-[5px] top-1 h-[7px] w-[7px] rounded-full border-[1.5px] border-[#0A0A0C] bg-[#FF4438]" />
          </div>
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#FF4438]">
              <span className="font-heading text-xs font-bold text-white">WB</span>
            </div>
            <span className="text-[13.5px] font-semibold">
              J. Smith <span className="text-[#6B6B72]">·</span> Warburtons Ltd
            </span>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section
        className="relative overflow-hidden px-12 pb-14 pt-[72px]"
        style={{
          background:
            "radial-gradient(ellipse 900px 500px at 15% 0%, rgba(255,68,56,0.10) 0%, rgba(255,68,56,0) 60%)",
        }}
      >
        <div className="relative max-w-[780px]">
          <h1 className="font-heading text-[76px] font-extrabold uppercase leading-[0.98] tracking-tight">
            <span className="text-white">Precision</span>
            <br />
            <span className="text-white">Procurement</span>
            <br />
            <span className="text-[#FF4438]">At scale.</span>
          </h1>
          <p className="mt-[22px] max-w-[540px] text-[15.5px] leading-relaxed text-[#9C9CA3]">
            Search by part reference, dimensions or the engineering problem you&rsquo;re solving — or
            upload a drawing and let an engineer confirm the right solution.
          </p>

          <form className="mt-8 flex max-w-[560px] items-center gap-3 rounded-xl border border-[#232327] bg-[#141416] py-1.5 pl-[18px] pr-1.5">
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#6B6B72" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
              <circle cx="11" cy="11" r="8" />
              <path d="M21 21l-4.35-4.35" />
            </svg>
            <input
              type="text"
              placeholder="e.g. torque limiter for a 14mm keyed shaft at 10 Nm"
              className="h-10 grow bg-transparent text-sm text-[#EDEDEF] outline-none placeholder:text-[#6B6B72]"
            />
            <button
              type="button"
              className="flex h-[38px] shrink-0 items-center gap-1.5 rounded-lg bg-white px-4 text-[12.5px] font-bold tracking-wide text-[#0A0A0C]"
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#0A0A0C" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <path d="M17 8l-5-5-5 5" />
                <path d="M12 3v12" />
              </svg>
              UPLOAD
            </button>
          </form>

          <div className="mt-5 flex flex-wrap items-center gap-3">
            <span className="text-[11px] font-bold tracking-[1.2px] text-[#6B6B72]">POPULAR:</span>
            {filterChips.map((chip) => (
              <button
                key={chip}
                className="rounded-lg border border-[#232327] px-3.5 py-[7px] text-[12.5px] font-semibold text-[#B4B4BA] transition-colors hover:border-[#4A4A52] hover:text-white"
              >
                {chip}
              </button>
            ))}
          </div>

          <div className="mt-11 grid max-w-[620px] grid-cols-2 gap-x-12 gap-y-6">
            {features.map((f) => (
              <div key={f.title} className="border-l-2 border-[#FF4438] pl-3.5">
                <div className="text-xs font-bold tracking-wide text-[#EDEDEF]">{f.title}</div>
                <div className="mt-1 text-[12.5px] text-[#6B6B72]">{f.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Account status panel */}
      <section className="px-12 pb-14 pt-2">
        <div className="flex flex-col gap-7 border-t border-[#1C1C20] pt-10">
          <div className="flex items-end justify-between">
            <div>
              <span className="text-[11px] font-bold tracking-[1.4px] text-[#FF4438]">
                LIVE ACCOUNT STATUS
              </span>
              <div className="font-heading mt-1 text-[26px] font-bold text-white">Warburtons Ltd</div>
            </div>
            <div className="text-right">
              <div className="text-[10.5px] font-bold tracking-wide text-[#6B6B72]">LAST SYNC</div>
              <div className="mt-0.5 text-[13px] text-[#B4B4BA]">09:24 BST</div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="rounded-xl border border-[#232327] bg-[#131316] p-5">
              <span className="text-[11px] font-bold tracking-wide text-[#6B6B72]">OPEN QUOTES</span>
              <div className="font-heading mt-1.5 text-[30px] font-bold text-white">04</div>
            </div>
            <div className="rounded-xl border border-[#232327] bg-[#131316] p-5">
              <span className="text-[11px] font-bold tracking-wide text-[#6B6B72]">ORDERS IN PROGRESS</span>
              <div className="font-heading mt-1.5 text-[30px] font-bold text-white">07</div>
            </div>
            <div className="rounded-xl border border-[#232327] bg-[#131316] p-5">
              <span className="text-[11px] font-bold tracking-wide text-[#6B6B72]">SAVED PARTS</span>
              <div className="font-heading mt-1.5 text-[30px] font-bold text-[#FF4438]">23</div>
            </div>
          </div>

          <div className="overflow-hidden rounded-xl border border-[#232327] bg-[#131316]">
            <div className="flex items-center justify-between border-b border-[#232327] px-[22px] py-4">
              <span className="text-[11px] font-bold tracking-wide text-[#B4B4BA]">RECENT ACTIVITY</span>
              <a href="#" className="text-xs font-bold tracking-wide">
                VIEW ALL
              </a>
            </div>
            {activity.map((row, i) => (
              <div
                key={row.ref}
                className={`flex items-center gap-3.5 px-[22px] py-4 transition-colors hover:bg-[#17171A] ${
                  i < activity.length - 1 ? "border-b border-[#1C1C20]" : ""
                }`}
              >
                <div className={`h-[7px] w-[7px] shrink-0 rounded-full ${row.dot}`} />
                <div className="grow">
                  <div className="text-sm font-semibold text-[#EDEDEF]">
                    {row.ref} <span className="font-normal text-[#6B6B72]">·</span> {row.desc}
                  </div>
                  <div className="mt-0.5 text-[11.5px] tracking-wide text-[#6B6B72]">{row.meta}</div>
                </div>
                <span className="shrink-0 text-[13px] font-semibold text-[#B4B4BA]">{row.value}</span>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="cursor-pointer rounded-xl border border-[#FF4438] bg-[#17110F] p-[22px] transition-transform hover:-translate-y-0.5">
              <span className="text-[10.5px] font-bold tracking-wide text-[#FF9A8F]">
                STRAIGHTFORWARD PRODUCTS
              </span>
              <div className="font-heading mt-1.5 text-xl font-bold text-white">Browse catalogue</div>
              <div className="mt-2.5 text-[12.5px] font-semibold text-[#FF4438]">
                Find · Configure · Checkout →
              </div>
            </div>
            <div className="cursor-pointer rounded-xl border border-[#232327] bg-[#131316] p-[22px] transition-transform hover:-translate-y-0.5">
              <span className="text-[10.5px] font-bold tracking-wide text-[#6B6B72]">
                ENGINEERING ENQUIRY
              </span>
              <div className="font-heading mt-1.5 text-xl font-bold text-white">Start an RFQ</div>
              <div className="mt-2.5 text-[12.5px] font-semibold text-[#B4B4BA]">
                Drawing · Review · Quotation →
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#34C759" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <path d="M22 4L12 14.01l-3-3" />
            </svg>
            <span className="text-[12.5px] text-[#6B6B72]">
              ISO 9001 certified supply · Trade accounts since 1974
            </span>
          </div>
        </div>
      </section>
    </main>
  );
}