import { NextRequest, NextResponse } from "next/server";
import { getMobileAuth, err } from "@/lib/mobile-auth";
import { createAdminClient } from "@/lib/supabase/admin";

const MAX_BYTES = 5 * 1024 * 1024; // 5 MB

/** POST /api/mobile/workspace/logo — upload logo, returns { url } */
export async function POST(req: NextRequest) {
  const auth = await getMobileAuth(req);
  if (!auth.ok) return auth.response;

  const form = await req.formData().catch(() => null);
  if (!form) return err("Form data tidak valid.", 400);

  const file = form.get("logo");
  if (!(file instanceof File) || file.size === 0)
    return err("File logo tidak ditemukan.", 400);
  if (!file.type.startsWith("image/")) return err("File harus berupa gambar.", 400);
  if (file.size > MAX_BYTES) return err("Ukuran logo maksimal 5MB.", 400);

  const admin = createAdminClient();
  const ext = file.name.split(".").pop()?.toLowerCase() || "png";
  const path = `${auth.userId}/logo-${Date.now()}.${ext}`;

  const { error } = await admin.storage
    .from("logos")
    .upload(path, file, { upsert: true, contentType: file.type });

  if (error) return err(error.message);

  const url = admin.storage.from("logos").getPublicUrl(path).data.publicUrl;

  // Persist the new URL on the workspace row
  await admin
    .from("workspaces")
    .update({ logo_url: url })
    .eq("id", auth.workspace.id);

  return NextResponse.json({ url });
}
