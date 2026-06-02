"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getScopedDb } from "@/lib/db/scoped";
import type { CreateSaleItemInput } from "@/lib/types";

export type CreateSaleResult = { error: string | null; saleId?: string };
export type ActionResult = { error: string | null };

export async function createSale(
  workspaceId: string,
  input: {
    customerId: string | null;
    customerName: string;
    items: CreateSaleItemInput[];
    initialPayment: number;
    paymentMethod: string;
    isDelivered: boolean;
    dueDate: string | null;
  }
): Promise<CreateSaleResult> {
  // create_sale is SECURITY DEFINER and self-authorizes via auth.uid(), so it
  // MUST be called with the user's session client — the service-role client has
  // no auth.uid() and the RPC would reject it. The RPC verifies workspace
  // ownership and does stock/invoice/status atomically under definer rights.
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Tidak diizinkan." };

  if (!input.customerName.trim())
    return { error: "Nama pelanggan wajib diisi." };
  if (input.items.length === 0)
    return { error: "Pilih minimal satu produk." };

  const { data, error } = await supabase.rpc("create_sale", {
    p_workspace_id: workspaceId,
    p_customer_id: input.customerId,
    p_customer_name: input.customerName.trim(),
    p_items: input.items,
    p_initial_payment: input.initialPayment,
    p_payment_method: input.paymentMethod,
    p_is_delivered: input.isDelivered,
  });

  if (error) return { error: error.message };

  const saleId = data as string;

  // due_date is plain metadata; set it on the freshly-created sale via the
  // workspace-scoped client (the create_sale RPC handles the atomic parts).
  if (input.dueDate) {
    const db = await getScopedDb(workspaceId);
    await db.update("sales", { due_date: input.dueDate }).eq("id", saleId);
  }

  revalidatePath(`/dashboard/${workspaceId}/sales`);
  revalidatePath(`/dashboard/${workspaceId}`);
  revalidatePath(`/dashboard/${workspaceId}/products`);
  return { error: null, saleId };
}

export async function updateDueDate(
  workspaceId: string,
  saleId: string,
  dueDate: string | null
): Promise<ActionResult> {
  const db = await getScopedDb(workspaceId);

  // workspace_id filter is baked in — only this workspace's sale can match.
  const { error } = await db
    .update("sales", { due_date: dueDate || null })
    .eq("id", saleId);
  if (error) return { error: error.message };

  revalidatePath(`/dashboard/${workspaceId}/sales/${saleId}`);
  revalidatePath(`/dashboard/${workspaceId}/sales`);
  return { error: null };
}

export async function addPayment(
  workspaceId: string,
  saleId: string,
  input: { amount: number; method: string }
): Promise<ActionResult> {
  const db = await getScopedDb(workspaceId);
  if (!(input.amount > 0)) return { error: "Jumlah pembayaran tidak valid." };

  // CRITICAL: payment_history has no workspace_id, so RLS no longer guards it.
  // Verify the sale belongs to this workspace before inserting a payment.
  const sale = await db.requireSale(saleId);
  if (!sale) return { error: "Transaksi tidak ditemukan." };

  const { error } = await db.admin.from("payment_history").insert({
    sale_id: sale.id,
    amount_paid: input.amount,
    payment_method: input.method,
  });
  if (error) return { error: error.message };

  revalidatePath(`/dashboard/${workspaceId}/sales/${saleId}`);
  revalidatePath(`/dashboard/${workspaceId}/sales`);
  revalidatePath(`/dashboard/${workspaceId}`);
  return { error: null };
}

export async function toggleDelivered(
  workspaceId: string,
  saleId: string,
  isDelivered: boolean
): Promise<ActionResult> {
  const db = await getScopedDb(workspaceId);

  // workspace_id filter is baked in — only this workspace's sale can match.
  const { error } = await db
    .update("sales", { is_delivered: isDelivered })
    .eq("id", saleId);
  if (error) return { error: error.message };

  revalidatePath(`/dashboard/${workspaceId}/sales/${saleId}`);
  revalidatePath(`/dashboard/${workspaceId}/sales`);
  revalidatePath(`/dashboard/${workspaceId}`);
  return { error: null };
}
