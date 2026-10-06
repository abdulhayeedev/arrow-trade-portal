"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { isStaff } from "@/lib/admin";

export async function login(formData: FormData) {
  const supabase = createClient();

  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  const { data, error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    redirect(`/login?error=${encodeURIComponent(error.message)}`);
  }

  // Staff and customers land in different places after login.
  if (await isStaff(data.user?.id ?? null)) {
    redirect("/admin/rfqs");
  }

  redirect("/");
}

export async function signup(formData: FormData) {
  const supabase = createClient();

  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const companyName = formData.get("companyName") as string;
  const role = (formData.get("role") as string) || "customer";

  if (role === "staff" && !email.toLowerCase().endsWith("@arrowengineering.com")) {
    redirect(
      `/signup?error=${encodeURIComponent(
        "Staff accounts must use an @arrowengineering.com email address"
      )}`
    );
  }

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        role,
        ...(role === "customer" ? { company_name: companyName } : {}),
      },
    },
  });

  if (error) {
    redirect(`/signup?error=${encodeURIComponent(error.message)}`);
  }

  redirect(`/verify?email=${encodeURIComponent(email)}`);
}

export async function logout() {
  const supabase = createClient();
  await supabase.auth.signOut();
  redirect("/login");
}