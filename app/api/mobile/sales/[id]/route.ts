import { NextRequest, NextResponse } from "next/server";
import { getMobileAuth, err } from "@/lib/mobile-auth";

/** GET /api/mobile/sales/[id] — sale detail with items and payments */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await getMobileAuth(req);
  if (!auth.ok) return auth.response;

  const { id } = await params;
  const sale = await auth.db.requireSale(id);
  if (!sale) return err("Penjualan tidak ditemukan.", 404);

  const [itemsRes, paymentsRes] = await Promise.all([
    auth.db.admin
      .from("sales_items")
      .select("*, products(name)")
      .eq("sale_id", id),
    auth.db.admin
      .from("payment_history")
      .select("*")
      .eq("sale_id", id)
      .order("payment_date"),
  ]);

  return NextResponse.json({
    sale,
    items: itemsRes.data ?? [],
    payments: paymentsRes.data ?? [],
  });
}
