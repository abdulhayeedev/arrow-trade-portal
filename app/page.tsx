import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import SiteHeader from "@/components/SiteHeader";
import SearchBar from "@/components/SearchBar";
import { isStaff } from "@/lib/admin";
import { chatEnabledFor } from "@/lib/chat/enabled";

export default async function Home() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const chatEnabled = chatEnabledFor(true, await isStaff(user.id));

  // The three most recent chats, shown under the search bar.
  const { data: recentChats } = chatEnabled
    ? await supabase
        .from("chat_conversations")
        .select("id, title")
        .eq("user_id", user.id)
        .order("updated_at", { ascending: false })
        .limit(3)
    : { data: null };

  return (
    <main className="flex min-h-screen flex-col bg-white text-[#14171F]">
      <SiteHeader active="Find products" user={user} hideChatLauncher />

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
          "radial-gradient(ellipse 50% 75% at 50% 50%, rgba(255,255,255,0.62) 0%, rgba(255,255,255,0.55) 62%, rgba(255,255,255,0.3) 80%, rgba(255,255,255,0.05) 100%), url('https://arrowengineering.com/wp-content/uploads/2026/10/trade-banner-scaled.jpeg')",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="relative mx-auto max-w-[1180px]">
        <div className="mx-auto max-w-[880px] text-center">
          <h1 className="font-heading text-[52px] font-extrabold uppercase leading-[1.08] tracking-tight">
            <span className="block text-[#14171F]">Arrow Engineering Trade</span>
            <span className="block text-[#FF4438]">B2B Procurement, Simplified.</span>
          </h1>
          <p className="bold mt-4 inline-block max-w-[555px] px-3.5 py-2.5 text-base leading-relaxed backdrop-blur-sm">
            Search by part reference, dimensions or the engineering problem you&rsquo;re solving 
            or upload a drawing and let an engineer confirm the right solution.
          </p>

          <SearchBar
            placeholder="e.g. torque limiter for a 14mm keyed shaft"
            chatEnabled={chatEnabled}
            className="mx-auto mt-7 max-w-[640px]"
          />

          <div className="mt-4 flex flex-wrap justify-center gap-2.5">
            {["Bearing reference", "Shaft size", "Torque limiters"].map((chip) => (
              <span
                key={chip}
                className="rounded-full border border-[#E5E5E7] bg-white/80 px-4 py-1.5 text-[12.5px] font-semibold text-[#6B7280] backdrop-blur-sm"
              >
                {chip}
              </span>
            ))}
          </div>

          {chatEnabled && recentChats && recentChats.length > 0 && (
            <div className="mx-auto mt-4 flex max-w-[640px] items-center gap-3 rounded-xl border border-white/60 bg-white/65 px-4 py-2 text-[12.5px] shadow-[0_6px_18px_rgba(60,70,120,0.10)] backdrop-blur-md">
              <span className="flex shrink-0 items-center gap-1.5 font-semibold text-[#374151]">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="9" />
                  <path d="M12 7v5l3 2" />
                </svg>
                Recent chats
              </span>
              <div className="flex min-w-0 flex-1 items-center">
                {recentChats.map((c) => (
                  <a
                    key={c.id}
                    href={`/assistant?c=${c.id}`}
                    title={c.title}
                    className="flex min-w-0 flex-1 items-center gap-1.5 rounded-md px-2 py-1.5 text-left text-[#4B5563] transition-colors hover:bg-white/80 hover:text-[#14171F]"
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 text-[#9AA2B1]">
                      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                    </svg>
                    <span className="truncate">{c.title}</span>
                  </a>
                ))}
              </div>
              <a href="/assistant" className="shrink-0 font-semibold text-[#FF4438] hover:underline">
                View all
              </a>
            </div>
          )}
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
              className="group flex min-h-[260px] flex-col justify-between rounded-md bg-[#FF4438] p-8 text-white shadow-[0_8px_24px_rgba(255,68,56,0.18)] transition-all hover:-translate-y-0.5 hover:shadow-[0_14px_32px_rgba(255,68,56,0.30)]"
            >
              <span className="text-[11px] font-bold tracking-[1.6px] text-white/90">01 / 02</span>
              <div>
                <div className="font-heading text-[30px] font-bold leading-tight">Browse the catalogue</div>
                <p className="mt-3 max-w-[310px] text-[14px] font-medium leading-relaxed text-white">
                  Find a product, add it to your basket, and check out with your account pricing already
                  applied.
                </p>
                <div className="mt-6 flex items-end justify-between">
                  <span className="flex items-center gap-1.5 text-[13px] font-bold">
                    Explore products <span aria-hidden="true">↗</span>
                  </span>
                  <svg
                    width="26"
                    height="26"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                    className="transition-transform group-hover:-translate-y-1 group-hover:translate-x-1"
                  >
                    <path d="M7 17L17 7M8 7h9v9" />
                  </svg>
                </div>
              </div>
            </a>
            <a
              href="/rfq"
              className="group flex min-h-[260px] flex-col justify-between rounded-md bg-[#E3E7E3] p-8 text-[#14171F] shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-[0_14px_32px_rgba(20,23,31,0.10)]"
            >
              <span className="text-[11px] font-bold tracking-[1.6px] text-[#14171F]/70">02 / 02</span>
              <div>
                <div className="font-heading text-[30px] font-bold leading-tight">Start an RFQ</div>
                <p className="mt-3 max-w-[310px] text-[14px] leading-relaxed text-[#4B5563]">
                  Describe your problem or upload a drawing, and an engineer will come back with a
                  quotation.
                </p>
                <div className="mt-6 flex items-end justify-between">
                  <span className="flex items-center gap-1.5 text-[13px] font-bold">
                    Start an enquiry <span aria-hidden="true">↗</span>
                  </span>
                  <svg
                    width="26"
                    height="26"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                    className="transition-transform group-hover:-translate-y-1 group-hover:translate-x-1"
                  >
                    <path d="M7 17L17 7M8 7h9v9" />
                  </svg>
                </div>
              </div>
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}