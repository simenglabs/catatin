"use server";

import { revalidatePath } from "next/cache";
import { getScopedDb } from "@/lib/db/scoped";

export type ActionResult = { error: string | null };

export async function createProduct(
  workspaceId: string,
  values: { name: string; price: number; stock: number }
): Promise<ActionResult> {
  const db = await getScopedDb(workspaceId);

  // workspace_id is injected by the scoped client — cannot be spoofed.
  const { error } = await db.insert("products", {
    name: values.name.trim(),
    price: values.price,
    stock: values.stock,
  });
  if (error) return { error: error.message };

  revalidatePath(`/dashboard/${workspaceId}/products`);
  return { error: null };
}

export async function updateProduct(
  workspaceId: string,
  productId: string,
  values: { name: string; price: number; stock: number }
): Promise<ActionResult> {
  const db = await getScopedDb(workspaceId);

  const { error } = await db
    .update("products", {
      name: values.name.trim(),
      price: values.price,
      stock: values.stock,
    })
    .eq("id", productId);
  if (error) return { error: error.message };

  revalidatePath(`/dashboard/${workspaceId}/products`);
  return { error: null };
}

export async function deleteProduct(
  workspaceId: string,
  productId: string
): Promise<ActionResult> {
  const db = await getScopedDb(workspaceId);

  const { error } = await db.delete("products").eq("id", productId);
  if (error) return { error: error.message };

  revalidatePath(`/dashboard/${workspaceId}/products`);
  return { error: null };
}
