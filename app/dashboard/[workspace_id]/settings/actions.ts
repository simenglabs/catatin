"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { InvoiceTemplateId } from "@/lib/types";

export type SettingsState = { error: string | null; ok?: boolean };

const TEMPLATES: InvoiceTemplateId[] = ["modern", "classic", "minimal"];
const HEX = /^#[0-9a-fA-F]{6}$/;

/** Trims and converts empty strings to null for nullable text columns. */
function nullable(v: FormDataEntryValue | null): string | null {
  const s = typeof v === "string" ? v.trim() : "";
  return s.length > 0 ? s : null;
}

export async function updateWorkspaceSettings(
  workspaceId: string,
  _prev: SettingsState,
  formData: FormData
): Promise<SettingsState> {
  // Workspace-level identity write → session client + RLS (mirrors onboarding),
  // not the service-role scoped client.
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Sesi berakhir. Silakan masuk kembali." };

  const companyName = String(formData.get("company_name") ?? "").trim();
  if (!companyName) return { error: "Nama perusahaan wajib diisi." };

  const template = String(formData.get("invoice_template") ?? "modern");
  if (!TEMPLATES.includes(template as InvoiceTemplateId))
    return { error: "Template tidak valid." };

  const accent = String(formData.get("invoice_accent") ?? "").trim();
  if (!HEX.test(accent))
    return { error: "Warna aksen harus berformat hex, mis. #4f46e5." };

  // The logo is uploaded to Supabase Storage on the client (avoids the Server
  // Action body-size limit); here we only persist the resulting public URL.
  // Empty/absent → keep the existing logo unchanged.
  const newLogoUrl = nullable(formData.get("logo_url"));

  const { error } = await supabase
    .from("workspaces")
    .update({
      company_name: companyName,
      invoice_template: template,
      invoice_accent: accent,
      business_address: nullable(formData.get("business_address")),
      business_phone: nullable(formData.get("business_phone")),
      business_email: nullable(formData.get("business_email")),
      business_tax_id: nullable(formData.get("business_tax_id")),
      invoice_footer: nullable(formData.get("invoice_footer")),
      payment_instructions: nullable(formData.get("payment_instructions")),
      ...(newLogoUrl ? { logo_url: newLogoUrl } : {}),
    })
    .eq("id", workspaceId)
    .eq("owner_id", user.id);

  if (error) return { error: error.message };

  revalidatePath(`/dashboard/${workspaceId}/settings`);
  revalidatePath(`/dashboard/${workspaceId}`, "layout");
  return { error: null, ok: true };
}
