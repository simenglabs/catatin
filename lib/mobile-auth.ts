/**
 * Mobile API authentication helper.
 *
 * Mobile apps send a Supabase access-token as `Authorization: Bearer <jwt>`.
 * We validate it with the admin (service-role) client, then build a ScopedDb
 * scoped to that user's workspace — exactly the same isolation guarantee used
 * by the server actions.
 */
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { createAdminClient } from "@/lib/supabase/admin";
import { ScopedDb } from "@/lib/db/scoped";
import type { Workspace } from "@/lib/types";

// ── Helpers ───────────────────────────────────────────────────────────────

/** Extract Bearer token from request header. Returns null if absent/malformed. */
export function getBearerToken(req: NextRequest): string | null {
  const auth = req.headers.get("authorization");
  if (!auth?.startsWith("Bearer ")) return null;
  return auth.slice(7);
}

/** Validate JWT and return the Supabase user. Returns null on invalid token. */
export async function validateToken(token: string) {
  const admin = createAdminClient();
  const { data, error } = await admin.auth.getUser(token);
  if (error || !data.user) return null;
  return data.user;
}

/**
 * Create a Supabase client that acts *as the authenticated user*.
 * Use this for RPCs that call auth.uid() internally (e.g. create_sale).
 */
export function createUserClient(accessToken: string) {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { global: { headers: { Authorization: `Bearer ${accessToken}` } } }
  );
}

// ── Auth results ──────────────────────────────────────────────────────────

export type MobileUser = {
  ok: true;
  userId: string;
  token: string;
};

export type MobileAuth = {
  ok: true;
  userId: string;
  token: string;
  workspace: Workspace;
  db: ScopedDb;
};

type AuthFail = { ok: false; response: NextResponse };

/** Validate JWT only — no workspace required (use for workspace creation). */
export async function getMobileUser(
  req: NextRequest
): Promise<MobileUser | AuthFail> {
  const token = getBearerToken(req);
  if (!token) return fail(401, "Token tidak ditemukan.");

  const user = await validateToken(token);
  if (!user) return fail(401, "Token tidak valid atau sudah expired.");

  return { ok: true, userId: user.id, token };
}

/** Validate JWT + require an existing workspace. Use for all data routes. */
export async function getMobileAuth(
  req: NextRequest
): Promise<MobileAuth | AuthFail> {
  const token = getBearerToken(req);
  if (!token) return fail(401, "Token tidak ditemukan.");

  const user = await validateToken(token);
  if (!user) return fail(401, "Token tidak valid atau sudah expired.");

  const admin = createAdminClient();
  const { data: workspace } = await admin
    .from("workspaces")
    .select("*")
    .eq("owner_id", user.id)
    .maybeSingle();

  if (!workspace) return fail(404, "Workspace tidak ditemukan.");

  const db = new ScopedDb(admin, workspace as Workspace);
  return { ok: true, userId: user.id, token, workspace: workspace as Workspace, db };
}

// ── Utility ───────────────────────────────────────────────────────────────

function fail(status: number, error: string): AuthFail {
  return { ok: false, response: NextResponse.json({ error }, { status }) };
}

export function err(message: string, status = 500): NextResponse {
  return NextResponse.json({ error: message }, { status });
}
