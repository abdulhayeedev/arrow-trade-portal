const filterChips = [
  "Bearing reference",
  "Shaft size",
  "Dimensions",
  "Application",
  "Drive type",
  "Torque",
  "Manufacturer ref",
];

const activity = [
  {
    ref: "PO-48213",
    desc: "GR-24 taper bore hub, 42mm — qty 12",
    status: "Shipped",
    tone: "bg-green-100 text-green-700",
  },
  {
    ref: "RFQ-1092",
    desc: "Custom torque limiter — 14mm keyed shaft, 10 Nm",
    status: "Awaiting quote",
    tone: "bg-orange-100 text-orange-700",
  },
  {
    ref: "Q-3307",
    desc: "Stainless bearing inserts, UCX series — qty 40",
    status: "Ready to accept",
    tone: "bg-blue-100 text-navy",
  },
];

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col bg-surface">
      {/* Top nav */}
      <header className="flex h-[84px] items-center justify-between border-b border-line bg-white px-12">
        <div className="flex items-center gap-10">
          <div className="flex items-baseline gap-1.5 font-heading">
            <span className="text-2xl font-bold tracking-wide text-navy">ARROW</span>
            <span className="text-2xl font-bold tracking-wide text-red">TRADE</span>
          </div>
          <nav className="flex items-center gap-8 text-sm font-semibold">
            <a href="#" className="text-ink">Find products</a>
            <a href="#" className="text-muted hover:text-ink">RFQs &amp; quotes</a>
            <a href="#" className="text-muted hover:text-ink">Orders</a>
            <a href="#" className="text-muted hover:text-ink">Documents</a>
          </nav>
        </div>
        <div className="flex items-center gap-6">
          <button
            aria-label="Notifications"
            className="flex h-10 w-10 items-center justify-center rounded-full border border-line bg-white"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#5B6472" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
              <path d="M13.73 21a2 2 0 0 1-3.46 0" />
            </svg>
          </button>
          <div className="h-7 w-px bg-line" />
          <button className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-navy">
              <span className="text-sm font-bold text-white">WB</span>
            </div>
            <div className="flex flex-col text-left leading-tight">
              <span className="text-sm font-semibold text-ink">Warburtons Ltd</span>
              <span className="text-xs text-muted">Trade account · J. Smith</span>
            </div>
          </button>
        </div>
      </header>

      {/* Hero / finder */}
      <section className="flex flex-col items-center bg-navy px-12 py-14">
        <div className="flex w-full max-w-3xl flex-col items-center gap-4 text-center">
          <span className="font-heading text-xs font-bold uppercase tracking-[2px] text-red-200">
            Product &amp; problem finder
          </span>
          <h1 className="font-heading text-4xl font-bold leading-tight text-white">
            Tell us what you need. We&rsquo;ll find the solution.
          </h1>
          <p className="max-w-xl text-base text-slate-300">
            Search by part reference, dimensions or the engineering problem you&rsquo;re solving — or upload a
            drawing or photo.
          </p>

          <form className="mt-3 flex w-full items-center gap-3 rounded-2xl bg-white p-2 pl-5 shadow-xl">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#5B6472" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
              <circle cx="11" cy="11" r="8" />
              <path d="M21 21l-4.35-4.35" />
            </svg>
            <input
              type="text"
              placeholder="e.g. torque limiter for a 14mm keyed shaft at 10 Nm"
              aria-label="Describe what you need"
              className="h-12 grow border-none text-sm text-ink outline-none"
            />
            <button
              type="button"
              aria-label="Upload a drawing or photo"
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-line bg-surface"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#5B6472" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <path d="M17 8l-5-5-5 5" />
                <path d="M12 3v12" />
              </svg>
            </button>
            <button
              type="submit"
              className="h-11 shrink-0 rounded-lg bg-red px-6 text-sm font-bold text-white"
            >
              Search
            </button>
          </form>

          <div className="mt-2 flex flex-wrap justify-center gap-2.5">
            {filterChips.map((chip) => (
              <button
                key={chip}
                className="rounded-full border border-navy-light px-4 py-2 text-sm font-semibold text-slate-200"
              >
                {chip}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Two paths */}
      <section className="px-12 pb-2 pt-12">
        <h2 className="font-heading text-xl font-bold text-ink">Two ways to get what you need</h2>
        <p className="mb-6 mt-1 text-sm text-muted">
          Straightforward parts checkout instantly. Anything needing engineering input goes to a quote.
        </p>

        <div className="grid grid-cols-2 gap-6">
          <div className="flex flex-col gap-5 rounded-2xl border border-line bg-white p-8">
            <div className="flex items-center gap-3.5">
              <div className="flex h-11 w-11 items-center justify-center rounded-[10px] bg-blue-50">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#0F1E3D" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="9" cy="21" r="1" />
                  <circle cx="20" cy="21" r="1" />
                  <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
                </svg>
              </div>
              <h3 className="font-heading text-lg font-bold text-ink">Straightforward products</h3>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {["Find", "Configure", "Price", "Basket", "Checkout"].map((step, i, arr) => (
                <span key={step} className="flex items-center gap-2">
                  <span className="rounded-full bg-blue-50 px-3 py-1.5 text-xs font-semibold text-navy">
                    {step}
                  </span>
                  {i < arr.length - 1 && <span className="text-line">→</span>}
                </span>
              ))}
            </div>
            <p className="text-sm leading-relaxed text-muted">
              Search the full catalogue with your account pricing already applied, and check out in minutes.
            </p>
            <a href="#" className="mt-auto text-sm font-bold text-red">
              Browse catalogue →
            </a>
          </div>
          
          <div className="flex flex-col gap-5 rounded-2xl border border-line bg-white p-8">
            <div className="flex items-center gap-3.5">
              <div className="flex h-11 w-11 items-center justify-center rounded-[10px] bg-red-50">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#C8102E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <path d="M14 2v6h6" />
                  <path d="M9 15l2 2 4-4" />
                </svg>
              </div>
              <h3 className="font-heading text-lg font-bold text-ink">Engineering enquiry</h3>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {["Enquiry", "Drawing / spec", "Arrow review", "Quotation"].map((step, i, arr) => (
                <span key={step} className="flex items-center gap-2">
                  <span className="rounded-full bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-dark">
                    {step}
                  </span>
                  {i < arr.length - 1 && <span className="text-line">→</span>}
                </span>
              ))}
            </div>
            <p className="text-sm leading-relaxed text-muted">
              Upload drawings or specs and an engineer will confirm the right solution before you commit.
            </p>
            <a href="#" className="mt-auto text-sm font-bold text-red">
              Start an RFQ →
            </a>
          </div>
        </div>
      </section>

      {/* Account summary */}
      <section className="flex flex-col gap-5 px-12 pb-12 pt-8">
        <h2 className="font-heading text-xl font-bold text-ink">Your account</h2>

        <div className="grid grid-cols-3 gap-5">
          {[
            { label: "Open quotes", value: 4 },
            { label: "Orders in progress", value: 7 },
            { label: "Saved parts", value: 23 },
          ].map((stat) => (
            <div key={stat.label} className="rounded-2xl border border-line bg-white p-6">
              <span className="text-sm font-semibold text-muted">{stat.label}</span>
              <div className="mt-2 font-heading text-3xl font-bold text-ink">{stat.value}</div>
            </div>
          ))}
        </div>

        <div className="rounded-2xl border border-line bg-white">
          <div className="flex items-center justify-between border-b border-line px-6 py-4">
            <span className="text-sm font-bold text-ink">Recent activity</span>
            <a href="#" className="text-sm font-bold text-red">
              View all
            </a>
          </div>
          {activity.map((row, i) => (
            <div
              key={row.ref}
              className={`flex items-center gap-4 px-6 py-4 ${
                i < activity.length - 1 ? "border-b border-line/60" : ""
              }`}
            >
              <span className="w-32 shrink-0 text-sm text-muted">{row.ref}</span>
              <span className="grow text-sm text-ink">{row.desc}</span>
              <span className={`rounded-full px-3 py-1 text-xs font-bold ${row.tone}`}>
                {row.status}
              </span>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
