"use server";

import { createClient } from "@/lib/supabase/server";
import { isStaff } from "@/lib/admin";
import { redirect } from "next/navigation";

const ALLOWED_STATUSES = ["pending_payment", "processing", "dispatched", "delivered", "cancelled"];

export async function updateOrderStatus(formData: FormData) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!(await isStaff(user?.id ?? null))) {
    redirect("/login");
  }

  const id = formData.get("id") as string;
  const status = formData.get("status") as string;

  if (!ALLOWED_STATUSES.includes(status)) {
    redirect(`/admin/orders?error=${encodeURIComponent("That isn't a valid status")}`);
  }

  // Orders that came through WooCommerce get their status from WordPress,
  // so only orders without a WooCommerce ID can be changed here.
  const { data, error } = await supabase
    .from("orders")
    .update({ status })
    .eq("id", id)
    .is("woo_order_id", null)
    .select("id");

  if (error) {
    redirect(`/admin/orders?error=${encodeURIComponent(error.message)}`);
  }

  if (!data || data.length === 0) {
    redirect(
      `/admin/orders?error=${encodeURIComponent(
        "That order is managed in WooCommerce. Change its status in WordPress instead."
      )}`
    );
  }

  redirect(`/admin/orders?message=${encodeURIComponent("Order status updated")}`);
}