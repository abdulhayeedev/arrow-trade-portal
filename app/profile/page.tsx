import { createClient } from "@/lib/supabase/server";
import { isStaff } from "@/lib/admin";
import { updateName, changePassword } from "@/app/profile/actions";
import { redirect } from "next/navigation";
import SiteHeader from "@/components/SiteHeader";
import AccountSidebar from "@/components/AccountSidebar";

export default async function ProfilePage({
  searchParams,
}: {
  searchParams: { message?: string; error?: string };
}) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const staff = await isStaff(user.id);

  let companyName: string | null = null;
  let companyRole: string | null = null;

  if (!staff) {
    const { data: membership } = await supabase
      .from("company_members")
      .select("company_id, role")
      .eq("user_id", user.id)
      .maybeSingle();

    if (membership) {
      companyRole = membership.role;
      const { data: company } = await supabase
        .from("companies")
        .select("name")
        .eq("id", membership.company_id)
        .maybeSingle();
      companyName = company?.name ?? null;
    }
  }

  const fullName = (user.user_metadata?.full_name as string) || "";
  const memberSince = new Date(user.created_at).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const detailRow = (label: string, value: string) => (
    <div className="flex items-center justify-between border-b border-[#F1F2F4] py-3 last:border-b-0">
      <span className="text-sm text-[#6B7280]">{label}</span>
      <span className="text-sm font-semibold text-[#14171F]">{value}</span>
    </div>
  );

  return (
    <main className="min-h-screen bg-[#FAFAFB] text-[#14171F]">
      <SiteHeader user={user} />

      <div className="mx-auto grid max-w-[1180px] grid-cols-[220px_1fr] gap-10 px-14 py-12">
        <AccountSidebar active="profile" staff={staff} />
        <div className="min-w-0 max-w-[720px]">
        <span className="text-[11px] font-bold tracking-[1.4px] text-[#FF4438]">ACCOUNT</span>
        <h1 className="font-heading mb-8 mt-1 text-3xl font-bold">My profile</h1>

        {searchParams.message && (
          <div className="mb-6 rounded-lg border border-[#1D7A34] bg-[#EAF6EC] px-4 py-3 text-sm text-[#1D7A34]">
            {searchParams.message}
          </div>
        )}
        {searchParams.error && (
          <div className="mb-6 rounded-lg border border-[#C8102E] bg-[#FFF3F2] px-4 py-3 text-sm text-[#A50D24]">
            {searchParams.error}
          </div>
        )}

        <section className="mb-6 rounded-2xl border border-[#E5E5E7] bg-white p-6 shadow-sm">
          <h2 className="font-heading mb-2 text-lg font-bold">Your details</h2>
          <div className="mb-5">
            {detailRow("Email", user.email ?? "—")}
            {detailRow("Account type", staff ? "Arrow staff" : "Trade customer")}
            {!staff && companyName && detailRow("Company", companyName)}
            {!staff &&
              companyRole &&
              detailRow("Your role", companyRole.charAt(0).toUpperCase() + companyRole.slice(1))}
            {detailRow("Member since", memberSince)}
          </div>

          <form action={updateName} className="flex items-end gap-3">
            <div className="flex grow flex-col gap-1.5">
              <label htmlFor="fullName" className="text-sm font-semibold text-[#14171F]">
                Your name
              </label>
              <input
                id="fullName"
                name="fullName"
                type="text"
                defaultValue={fullName}
                placeholder="e.g. Abdul Hayee"
                className="h-11 rounded-lg border border-[#E5E5E7] px-3.5 text-sm text-[#14171F] outline-none focus:border-[#14171F]"
              />
            </div>
            <button
              type="submit"
              className="h-11 rounded-lg bg-[#14171F] px-5 text-sm font-bold text-white"
            >
              Save name
            </button>
          </form>
        </section>

        <section className="rounded-2xl border border-[#E5E5E7] bg-white p-6 shadow-sm">
          <h2 className="font-heading mb-4 text-lg font-bold">Change password</h2>
          <form action={changePassword} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="newPassword" className="text-sm font-semibold text-[#14171F]">
                New password
              </label>
              <input
                id="newPassword"
                name="newPassword"
                type="password"
                required
                minLength={8}
                autoComplete="new-password"
                className="h-11 rounded-lg border border-[#E5E5E7] px-3.5 text-sm text-[#14171F] outline-none focus:border-[#14171F]"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label htmlFor="confirmPassword" className="text-sm font-semibold text-[#14171F]">
                Confirm new password
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                required
                minLength={8}
                autoComplete="new-password"
                className="h-11 rounded-lg border border-[#E5E5E7] px-3.5 text-sm text-[#14171F] outline-none focus:border-[#14171F]"
              />
            </div>
            <button
              type="submit"
              className="h-11 self-start rounded-lg bg-[#FF4438] px-5 text-sm font-bold text-white"
            >
              Update password
            </button>
          </form>
        </section>
        </div>
      </div>
    </main>
  );
}