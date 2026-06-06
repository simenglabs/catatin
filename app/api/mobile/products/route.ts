import { NextRequest, NextResponse } from "next/server";
import { getMobileAuth, err } from "@/lib/mobile-auth";

/** GET /api/mobile/products */
export async function GET(req: NextRequest) {
  const auth = await getMobileAuth(req);
  if (!auth.ok) return auth.response;

  const { data, error } = await auth.db.select("products").order("name");
  if (error) return err(error.message);
  return NextResponse.json({ products: data });
}

/** POST /api/mobile/products */
export async function POST(req: NextRequest) {
  const auth = await getMobileAuth(req);
  if (!auth.ok) return auth.response;

  const body = await req.json().catch(() => null);
  if (!body?.name?.trim()) return err("Nama produk wajib diisi.", 400);

  const price = Number(body.price);
  const stock = Number(body.stock);
  if (isNaN(price) || price < 0) return err("Harga tidak valid.", 400);
  if (isNaN(stock) || stock < 0) return err("Stok tidak valid.", 400);

  const { data, error } = await auth.db
    .insert("products", {
      name: body.name.trim(),
      price,
      stock,
    })
    .select()
    .single();

  if (error) return err(error.message);
  return NextResponse.json({ product: data }, { status: 201 });
}
