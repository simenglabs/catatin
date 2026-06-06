import { NextRequest, NextResponse } from "next/server";
import { getMobileAuth, err } from "@/lib/mobile-auth";

/** PATCH /api/mobile/products/[id] */
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await getMobileAuth(req);
  if (!auth.ok) return auth.response;

  const { id } = await params;
  const body = await req.json().catch(() => null);
  if (!body?.name?.trim()) return err("Nama produk wajib diisi.", 400);

  const price = Number(body.price);
  const stock = Number(body.stock);
  if (isNaN(price) || price < 0) return err("Harga tidak valid.", 400);
  if (isNaN(stock) || stock < 0) return err("Stok tidak valid.", 400);

  const { data, error } = await auth.db
    .update("products", {
      name: body.name.trim(),
      price,
      stock,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select()
    .single();

  if (error) return err(error.message);
  return NextResponse.json({ product: data });
}

/** DELETE /api/mobile/products/[id] */
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await getMobileAuth(req);
  if (!auth.ok) return auth.response;

  const { id } = await params;
  const { error } = await auth.db.delete("products").eq("id", id);
  if (error) return err(error.message);
  return NextResponse.json({ ok: true });
}
