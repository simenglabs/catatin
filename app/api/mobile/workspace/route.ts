import { NextRequest, NextResponse } from "next/server";
import { getMobileAuth, getMobileUser, err } from "@/lib/mobile-auth";
import { createAdminClient } from "@/lib/supabase/admin";

/** GET /api/mobile/workspace — returns the user's workspace or 404 */
export async function GET(req: NextRequest) {
  const auth = await getMobileUser(req);
  if (!auth.ok) return auth.response;

  const admin = createAdminClient();
  const { data: workspace } = await admin
    .from("workspaces")
    .select("*")
    .eq("owner_id", auth.userId)
    .maybeSingle();

  if (!workspace) return NextResponse.json({ workspace: null }, { status: 200 });
  return NextResponse.json({ workspace });
}

/** POST /api/mobile/workspace — create a new workspace (onboarding) */
export async function POST(req: NextRequest) {
  const auth = await getMobileUser(req);
  if (!auth.ok) return auth.response;

  const body = await req.json().catch(() => null);
  const companyName = body?.company_name as string | undefined;
  if (!companyName?.trim()) return err("Nama perusahaan wajib diisi.", 400);

  const admin = createAdminClient();

  // Ensure user doesn't already have a workspace
  const { data: existing } = await admin
    .from("workspaces")
    .select("id")
    .eq("owner_id", auth.userId)
    .maybeSingle();
  if (existing) return err("Workspace sudah ada.", 409);

  const { data: workspace, error } = await admin
    .from("workspaces")
    .insert({ owner_id: auth.userId, company_name: companyName.trim() })
    .select("*")
    .single();

  if (error) return err(error.message);
  return NextResponse.json({ workspace }, { status: 201 });
}

/** PATCH /api/mobile/workspace — update workspace settings */
export async function PATCH(req: NextRequest) {
  const auth = await getMobileAuth(req);
  if (!auth.ok) return auth.response;

  const body = await req.json().catch(() => ({}));
  const allowed = [
    "company_name",
    "logo_url",
    "invoice_template",
    "invoice_accent",
    "business_address",
    "business_phone",
    "business_email",
    "business_tax_id",
    "invoice_footer",
    "payment_instructions",
  ];

  // Only pick allowed fields
  const updates = Object.fromEntries(
    Object.entries(body).filter(([k]) => allowed.includes(k))
  );

  if (
    "invoice_template" in updates &&
    !["modern", "classic", "minimal"].includes(updates.invoice_template as string)
  ) {
    return err("Template tidak valid.", 400);
  }

  const { data: workspace, error } = await auth.db.admin
    .from("workspaces")
    .update(updates)
    .eq("id", auth.workspace.id)
    .select("*")
    .single();

  if (error) return err(error.message);
  return NextResponse.json({ workspace });
}
