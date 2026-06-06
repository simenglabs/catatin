import { NextRequest, NextResponse } from "next/server";
import { getMobileAuth, createUserClient, err } from "@/lib/mobile-auth";

/** GET /api/mobile/sales — list all sales for the workspace */
export async function GET(req: NextRequest) {
  const auth = await getMobileAuth(req);
  if (!auth.ok) return auth.response;

  const { data, error } = await auth.db
    .select("sales")
    .order("created_at", { ascending: false });

  if (error) return err(error.message);
  return NextResponse.json({ sales: data });
}

/**
 * POST /api/mobile/sales — create a sale via the existing create_sale RPC.
 * The RPC uses auth.uid() internally, so we call it with a user-scoped client
 * (anon key + Bearer token) rather than the service-role client.
 */
export async function POST(req: NextRequest) {
  const auth = await getMobileAuth(req);
  if (!auth.ok) return auth.response;

  const body = await req.json().catch(() => null);
  if (!body?.customer_name?.trim()) return err("Nama pelanggan wajib diisi.", 400);
  if (!Array.isArray(body?.items) || body.items.length === 0)
    return err("Produk wajib diisi.", 400);

  // Call RPC with user-scoped client so auth.uid() resolves correctly
  const userClient = createUserClient(auth.token);
  const { data: saleId, error: rpcError } = await userClient.rpc("create_sale", {
    p_workspace_id: auth.workspace.id,
    p_customer_id: body.customer_id ?? null,
    p_customer_name: body.customer_name.trim(),
    p_items: body.items,
    p_initial_payment: Number(body.initial_payment ?? 0),
    p_payment_method: body.payment_method ?? "Tunai",
    p_is_delivered: Boolean(body.is_delivered ?? false),
  });

  if (rpcError) return err(rpcError.message);

  // Set due_date separately (RPC doesn't handle it)
  if (body.due_date) {
    await auth.db.admin
      .from("sales")
      .update({ due_date: body.due_date })
      .eq("id", saleId as string);
  }

  return NextResponse.json({ sale_id: saleId }, { status: 201 });
}
