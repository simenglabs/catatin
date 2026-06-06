import { NextRequest, NextResponse } from "next/server";
import { getMobileAuth, err } from "@/lib/mobile-auth";

/** POST /api/mobile/sales/[id]/payments */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await getMobileAuth(req);
  if (!auth.ok) return auth.response;

  const { id } = await params;
  const sale = await auth.db.requireSale(id);
  if (!sale) return err("Penjualan tidak ditemukan.", 404);

  const body = await req.json().catch(() => null);
  const amount = Number(body?.amount_paid);
  if (isNaN(amount) || amount <= 0) return err("Jumlah pembayaran tidak valid.", 400);

  const { error } = await auth.db.admin.from("payment_history").insert({
    sale_id: id,
    amount_paid: amount,
    payment_method: body?.payment_method ?? "Tunai",
    payment_date: body?.payment_date ?? new Date().toISOString(),
  });

  if (error) return err(error.message);

  // Return refreshed sale (trigger has recalculated status)
  const { data: updatedSale } = await auth.db.admin
    .from("sales")
    .select("*")
    .eq("id", id)
    .single();

  return NextResponse.json({ sale: updatedSale }, { status: 201 });
}
