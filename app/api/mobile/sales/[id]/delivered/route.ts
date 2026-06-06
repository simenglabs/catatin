import { NextRequest, NextResponse } from "next/server";
import { getMobileAuth, err } from "@/lib/mobile-auth";

/** PATCH /api/mobile/sales/[id]/delivered */
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await getMobileAuth(req);
  if (!auth.ok) return auth.response;

  const { id } = await params;
  const sale = await auth.db.requireSale(id);
  if (!sale) return err("Penjualan tidak ditemukan.", 404);

  const body = await req.json().catch(() => null);
  if (typeof body?.is_delivered !== "boolean")
    return err("is_delivered harus boolean.", 400);

  const { data: updatedSale, error } = await auth.db.admin
    .from("sales")
    .update({ is_delivered: body.is_delivered })
    .eq("id", id)
    .select("*")
    .single();

  if (error) return err(error.message);
  return NextResponse.json({ sale: updatedSale });
}
