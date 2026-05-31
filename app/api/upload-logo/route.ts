import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

const MAX_BYTES = 5 * 1024 * 1024; // 5MB

/**
 * Uploads a workspace logo to the `logos` bucket. Auth is verified via the
 * user's session, the path is scoped to their id, and the write uses the
 * service-role client (bypasses Storage RLS) — avoiding the auth.uid() token
 * propagation pitfalls of uploading through the SSR/browser session client.
 * Route Handlers also have no Server Action body-size limit.
 */
export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Tidak diizinkan." }, { status: 401 });
    }

    const form = await req.formData();
    const file = form.get("logo");
    if (!(file instanceof File) || file.size === 0) {
      return NextResponse.json(
        { error: "File logo tidak ditemukan." },
        { status: 400 }
      );
    }
    if (!file.type.startsWith("image/")) {
      return NextResponse.json(
        { error: "File harus berupa gambar." },
        { status: 400 }
      );
    }
    if (file.size > MAX_BYTES) {
      return NextResponse.json(
        { error: "Ukuran logo maksimal 5MB." },
        { status: 400 }
      );
    }

    const admin = createAdminClient();
    const ext = file.name.split(".").pop()?.toLowerCase() || "png";
    const path = `${user.id}/logo-${Date.now()}.${ext}`;

    const { error } = await admin.storage
      .from("logos")
      .upload(path, file, { upsert: true, contentType: file.type });
    if (error) {
      console.error("[upload-logo] storage error:", error.message);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const url = admin.storage.from("logos").getPublicUrl(path).data.publicUrl;
    return NextResponse.json({ url });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Internal server error";
    console.error("[upload-logo] unhandled error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
