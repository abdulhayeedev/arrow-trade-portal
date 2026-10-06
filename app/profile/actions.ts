"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export async function updateName(formData: FormData) {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const fullName = ((formData.get("fullName") as string) ?? "").trim();

  const { error } = await supabase.auth.updateUser({ data: { full_name: fullName } });

  if (error) {
    redirect(`/profile?error=${encodeURIComponent(error.message)}`);
  }

  redirect(`/profile?message=${encodeURIComponent("Your name has been updated")}`);
}

export async function changePassword(formData: FormData) {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const newPassword = (formData.get("newPassword") as string) ?? "";
  const confirmPassword = (formData.get("confirmPassword") as string) ?? "";

  if (newPassword.length < 8) {
    redirect(`/profile?error=${encodeURIComponent("Password must be at least 8 characters")}`);
  }

  if (newPassword !== confirmPassword) {
    redirect(`/profile?error=${encodeURIComponent("Passwords do not match")}`);
  }

  const { error } = await supabase.auth.updateUser({ password: newPassword });

  if (error) {
    redirect(`/profile?error=${encodeURIComponent(error.message)}`);
  }

  redirect(`/profile?message=${encodeURIComponent("Your password has been changed")}`);
}