import { NextRequest, NextResponse } from "next/server";
import { getMobileAuth, err } from "@/lib/mobile-auth";

/** GET /api/mobile/customers */
export async function GET(req: NextRequest) {
  const auth = await getMobileAuth(req);
  if (!auth.ok) return auth.response;

  const { data, error } = await auth.db.select("customers").order("name");
  if (error) return err(error.message);
  return NextResponse.json({ customers: data });
}

/** POST /api/mobile/customers */
export async function POST(req: NextRequest) {
  const auth = await getMobileAuth(req);
  if (!auth.ok) return auth.response;

  const body = await req.json().catch(() => null);
  if (!body?.name?.trim()) return err("Nama pelanggan wajib diisi.", 400);

  const { data, error } = await auth.db
    .insert("customers", {
      name: body.name.trim(),
      phone: body.phone?.trim() || null,
      description: body.description?.trim() || null,
    })
    .select()
    .single();

  if (error) return err(error.message);
  return NextResponse.json({ customer: data }, { status: 201 });
}
