"use server";

import { revalidatePath } from "next/cache";
import { getScopedDb } from "@/lib/db/scoped";
import type { Customer, CustomerInput } from "@/lib/types";

export type ActionResult = { error: string | null };
export type CreateCustomerResult = { error: string | null; customer?: Customer };

function clean(values: CustomerInput) {
  return {
    name: values.name.trim(),
    phone: values.phone.trim() || null,
    description: values.description.trim() || null,
  };
}

export async function createCustomer(
  workspaceId: string,
  values: CustomerInput
): Promise<CreateCustomerResult> {
  const db = await getScopedDb(workspaceId);
  const row = clean(values);
  if (!row.name) return { error: "Nama pelanggan wajib diisi." };

  // workspace_id is injected by the scoped client — cannot be spoofed.
  const { data, error } = await db
    .insert("customers", row)
    .select()
    .single();
  if (error) return { error: error.message };

  revalidatePath(`/dashboard/${workspaceId}/customers`);
  return { error: null, customer: data as unknown as Customer };
}

export async function updateCustomer(
  workspaceId: string,
  customerId: string,
  values: CustomerInput
): Promise<ActionResult> {
  const db = await getScopedDb(workspaceId);
  const row = clean(values);
  if (!row.name) return { error: "Nama pelanggan wajib diisi." };

  const { error } = await db
    .update("customers", { ...row, updated_at: new Date().toISOString() })
    .eq("id", customerId);
  if (error) return { error: error.message };

  revalidatePath(`/dashboard/${workspaceId}/customers`);
  return { error: null };
}

export async function deleteCustomer(
  workspaceId: string,
  customerId: string
): Promise<ActionResult> {
  const db = await getScopedDb(workspaceId);

  // Sales reference customers with ON DELETE SET NULL, so existing invoices
  // keep their customer_name snapshot after the customer is removed.
  const { error } = await db.delete("customers").eq("id", customerId);
  if (error) return { error: error.message };

  revalidatePath(`/dashboard/${workspaceId}/customers`);
  return { error: null };
}
