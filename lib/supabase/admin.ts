import { createClient as createSupabaseClient } from "@supabase/supabase-js";

/**
 * Service-role Supabase client. This client **bypasses Row Level Security** —
 * it can read and write every workspace's data. Treat it like a root password.
 *
 * RULES:
 *  - SERVER ONLY. Never import this from a "use client" component.
 *  - The key lives in SUPABASE_SERVICE_ROLE_KEY (no NEXT_PUBLIC_ prefix), so it
 *    is never bundled for the browser.
 *  - Because RLS is off, the CALLER is responsible for tenant isolation. Do not
 *    use this client directly for tenant data — go through `getScopedDb()` in
 *    `lib/db/scoped.ts`, which forces a `workspace_id` filter on every query.
 */
export function createAdminClient() {
  // Defence in depth: if this ever runs in a browser bundle, fail loudly
  // instead of leaking a privileged client.
  if (typeof window !== "undefined") {
    throw new Error("createAdminClient() must never run in the browser.");
  }

  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!key) {
    throw new Error(
      "SUPABASE_SERVICE_ROLE_KEY is not set. Add it to .env.local (server-only)."
    );
  }

  return createSupabaseClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}
