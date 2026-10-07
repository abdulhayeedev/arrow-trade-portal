export default function AccountSidebar({
  active,
  staff,
}: {
  active: "dashboard" | "profile" | "admin" | "orders";
  staff: boolean;
}) {
  const items = staff
    ? [
        { key: "profile", href: "/profile", label: "Profile" },
        { key: "admin", href: "/admin/rfqs", label: "RFQs & quotes" },
        { key: "orders", href: "/admin/orders", label: "Orders" },
      ]
    : [
        { key: "dashboard", href: "/profile/dashboard", label: "Dashboard" },
        { key: "profile", href: "/profile", label: "Profile" },
      ];

  return (
    <aside className="self-start rounded-2xl border border-[#E5E5E7] bg-white p-3 shadow-sm">
      <span className="mb-2 block px-3 pt-2 text-[11px] font-bold tracking-[1.4px] text-[#9AA2B1]">
        MY ACCOUNT
      </span>
      <nav className="flex flex-col gap-1">
        {items.map((item) => (
          <a
            key={item.key}
            href={item.href}
            className={`rounded-lg px-3 py-2.5 text-sm font-semibold transition-colors ${
              active === item.key
                ? "bg-[#FFF3F2] text-[#FF4438]"
                : "text-[#374151] hover:bg-[#FAFAFB]"
            }`}
          >
            {item.label}
          </a>
        ))}
      </nav>
    </aside>
  );
}