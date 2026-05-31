"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type OnboardingState = { error: string | null };

export async function createWorkspace(
  _prev: OnboardingState,
  formData: FormData
): Promise<OnboardingState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const companyName = String(formData.get("company_name") ?? "").trim();
  if (!companyName) return { error: "Nama perusahaan wajib diisi." };

  // Guard against creating a second workspace for the same owner.
  const { data: existing } = await supabase
    .from("workspaces")
    .select("id")
    .eq("owner_id", user.id)
    .maybeSingle();
  if (existing) redirect(`/dashboard/${existing.id}`);

  // Logo is uploaded to Supabase Storage on the client (avoids the Server Action
  // body-size limit); here we only persist the resulting public URL.
  const logoField = String(formData.get("logo_url") ?? "").trim();
  const logoUrl: string | null = logoField.length > 0 ? logoField : null;

  const { data: workspace, error } = await supabase
    .from("workspaces")
    .insert({
      owner_id: user.id,
      company_name: companyName,
      logo_url: logoUrl,
    })
    .select("id")
    .single();

  if (error || !workspace) {
    return { error: error?.message ?? "Gagal membuat workspace." };
  }

  redirect(`/dashboard/${workspace.id}`);
}
