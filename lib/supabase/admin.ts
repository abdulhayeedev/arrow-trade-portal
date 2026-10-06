import { createClient } from "@supabase/supabase-js";

// Server-only client that bypasses row-level security. Never import this from
// a client component, and never expose the key it uses.
export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL as string,
    process.env.SUPABASE_SERVICE_ROLE_KEY as string,
    { auth: { persistSession: false, autoRefreshToken: false } }
  );
}