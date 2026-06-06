import { NextRequest, NextResponse } from "next/server";
import { getMobileAuth, err } from "@/lib/mobile-auth";

/** PATCH /api/mobile/customers/[id] */
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await getMobileAuth(req);
  if (!auth.ok) return auth.response;

  const { id } = await params;
  const body = await req.json().catch(() => null);
  if (!body?.name?.trim()) return err("Nama pelanggan wajib diisi.", 400);

  const { data, error } = await auth.db
    .update("customers", {
      name: body.name.trim(),
      phone: body.phone?.trim() || null,
      description: body.description?.trim() || null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select()
    .single();

  if (error) return err(error.message);
  return NextResponse.json({ customer: data });
}

/** DELETE /api/mobile/customers/[id] */
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await getMobileAuth(req);
  if (!auth.ok) return auth.response;

  const { id } = await params;
  const { error } = await auth.db.delete("customers").eq("id", id);
  if (error) return err(error.message);
  return NextResponse.json({ ok: true });
}
