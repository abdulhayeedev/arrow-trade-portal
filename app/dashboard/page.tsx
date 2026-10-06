import { redirect } from "next/navigation";

export default function DashboardRedirect({
  searchParams,
}: {
  searchParams: { message?: string };
}) {
  redirect(
    searchParams.message
      ? `/profile/dashboard?message=${encodeURIComponent(searchParams.message)}`
      : "/profile/dashboard"
  );
}