"use server";

import { createClient } from "@/lib/supabase/server";
import { isStaff } from "@/lib/admin";
import { redirect } from "next/navigation";

export async function verifyCode(formData: FormData) {
  const supabase = createClient();

  const email = (formData.get("email") as string).trim();
  const token = (formData.get("token") as string).trim();

  const { data, error } = await supabase.auth.verifyOtp({
    email,
    token,
    type: "signup",
  });

  if (error) {
    redirect(
      `/verify?email=${encodeURIComponent(email)}&error=${encodeURIComponent(error.message)}`
    );
  }

  // Verification also signs the user in, so send them where they belong.
  if (await isStaff(data.user?.id ?? null)) {
    redirect("/admin/rfqs");
  }

  redirect("/");
}

export async function resendCode(formData: FormData) {
  const supabase = createClient();
  const email = (formData.get("email") as string).trim();

  const { error } = await supabase.auth.resend({ type: "signup", email });

  if (error) {
    redirect(
      `/verify?email=${encodeURIComponent(email)}&error=${encodeURIComponent(error.message)}`
    );
  }

  redirect(
    `/verify?email=${encodeURIComponent(email)}&message=${encodeURIComponent("A new code has been sent")}`
  );
}