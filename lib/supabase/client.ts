import { createBrowserClient } from "@supabase/ssr";

// Use this in Client Components ("use client" files) — e.g. the login/signup forms.
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL as string,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string
  );
}