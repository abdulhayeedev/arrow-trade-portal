import type { User } from "@supabase/supabase-js";
import { getBasketCount } from "@/lib/basket";
import { isStaff } from "@/lib/admin";
import UserMenu from "@/components/UserMenu";

import { chatEnabledFor } from "@/lib/chat/enabled";

export default async function SiteHeader({
  active,
  user,
  hideChatLauncher = false,
}: {
  active?: string;
  user: User | null;
  hideChatLauncher?: boolean;
}) {
  const staff = await isStaff(user?.id ?? null);

  const chatEnabled = chatEnabledFor(!!user, staff);

  const fullName = ((user?.user_metadata?.full_name as string) || "").trim();
  const companyName = staff
    ? "Arrow Staff"
    : (user?.user_metadata?.company_name as string) || "Trade Account";
  const displayName = fullName
    ? fullName.split(" ")[0]
    : user?.email
      ? user.email
          .split("@")[0]
          .split(/[._-]/)[0]
          .replace(/^\w/, (c) => c.toUpperCase())
      : "";
  const initials = (fullName || companyName)
    .split(" ")
    .map((word) => word[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const basketCount = await getBasketCount(user?.id ?? null);

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
        {!staff && navLink("/profile/dashboard", "RFQs & quotes")}
        {!staff && navLink("/profile/dashboard", "Orders")}
        {staff && navLink("/admin/rfqs", "Admin")}
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
            <UserMenu
              displayName={displayName}
              companyName={companyName}
              initials={initials}
              profileHref="/profile"
              extraHref={staff ? "/admin/rfqs" : "/profile/dashboard"}
              extraLabel={staff ? "Admin" : "My dashboard"}
            />
          </>
        )}
      </div>
      </div>
    {chatEnabled && !hideChatLauncher && (
        <a
          href="/assistant"
          aria-label="Open the assistant"
          className="fixed bottom-6 right-6 z-[60] flex h-14 w-14 items-center justify-center rounded-full bg-[#14171F] text-white shadow-[0_10px_28px_rgba(20,23,31,0.35)] transition-colors hover:bg-[#2A2E38]"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
        </a>
      )}
    </header>
  );
}