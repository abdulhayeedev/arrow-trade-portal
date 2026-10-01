import { createClient } from "@/lib/supabase/server";
import { getBasketCount } from "@/lib/basket";
import UserMenu from "@/components/UserMenu";

export default async function SiteHeader({ active }: { active?: string }) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const companyName = (user?.user_metadata?.company_name as string) || "Trade Account";
  const displayName = user?.email
    ? user.email
        .split("@")[0]
        .split(/[._-]/)[0]
        .replace(/^\w/, (c) => c.toUpperCase())
    : "";
  const initials = companyName
    .split(" ")
    .map((word) => word[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const basketCount = user ? await getBasketCount() : 0;

  const navLink = (href: string, label: string) => (
    <a
      href={href}
      className={
        active === label
          ? "text-[#14171F]"
          : "text-[#6B7280] transition-colors hover:text-[#14171F]"
      }
    >
      {label}
    </a>
  );

  return (
    <header className="relative z-50 flex h-[76px] items-center border-b border-[#E5E5E7] bg-white px-12">
      <div className="mx-auto grid w-full max-w-[1180px] grid-cols-3 items-center">
      <nav className="flex items-center gap-8 text-sm font-semibold">
        {navLink("/", "Find products")}
        {navLink("/dashboard", "RFQs & quotes")}
        {navLink("/dashboard", "Orders")}
      </nav>
      <a href="/" className="flex items-center justify-center">
        <img src="/images/logo.png" alt="Arrow Engineering" className="h-14 w-auto" />
      </a>
      <div className="flex items-center justify-end gap-5">
        <a href="/basket" className="relative flex h-9 w-9 items-center justify-center rounded-full border border-[#E5E5E7]">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6B7280" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="9" cy="21" r="1" />
            <circle cx="20" cy="21" r="1" />
            <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
          </svg>
          {basketCount > 0 && (
            <span className="absolute -right-1.5 -top-1.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-[#FF4438] px-1 text-[10px] font-bold text-white">
              {basketCount}
            </span>
          )}
        </a>
        {user && (
          <>
            <div className="h-7 w-px bg-[#E5E5E7]" />
            <UserMenu displayName={displayName} companyName={companyName} initials={initials} />
          </>
        )}
      </div>
      </div>
    </header>
  );
}