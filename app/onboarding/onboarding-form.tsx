"use client";
/* eslint-disable @next/next/no-img-element */

import { useActionState, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { ImagePlus, Loader2 } from "lucide-react";

import { createWorkspace, type OnboardingState } from "./actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const initialState: OnboardingState = { error: null };
const MAX_LOGO_BYTES = 5 * 1024 * 1024; // 5MB

export function OnboardingForm() {
  const [state, formAction, isPending] = useActionState(
    createWorkspace,
    initialState
  );
  const [preview, setPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (state.error) toast.error(state.error);
  }, [state]);

  function onPickFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > MAX_LOGO_BYTES) {
      toast.error("Ukuran logo maksimal 5MB.");
      e.target.value = "";
      return;
    }
    setPreview(URL.createObjectURL(file));
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    fd.delete("logo"); // uploaded directly to Storage, not via the action

    const file = fileRef.current?.files?.[0];
    if (file) {
      setUploading(true);
      try {
        const body = new FormData();
        body.set("logo", file);
        const res = await fetch("/api/upload-logo", { method: "POST", body });
        const json = (await res.json()) as { url?: string; error?: string };
        if (!res.ok || !json.url) {
          toast.error(json.error ?? "Gagal upload logo.");
          return;
        }
        fd.set("logo_url", json.url);
      } catch {
        toast.error("Gagal upload logo. Coba lagi.");
        return;
      } finally {
        setUploading(false);
      }
    }

    formAction(fd);
  }

  const busy = uploading || isPending;

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="space-y-2">
        <Label>Logo Perusahaan (opsional)</Label>
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="flex size-20 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-dashed bg-muted/40 text-muted-foreground transition hover:border-primary hover:text-primary"
          >
            {preview ? (
              <img
                src={preview}
                alt="Pratinjau logo"
                className="size-20 object-cover"
              />
            ) : (
              <ImagePlus className="size-6" />
            )}
          </button>
          <div className="text-sm text-muted-foreground">
            Unggah logo usaha Anda. Akan tampil di invoice.
            <br />
            PNG/JPG, maks 5MB.
          </div>
        </div>
        <input
          ref={fileRef}
          type="file"
          name="logo"
          accept="image/png,image/jpeg,image/webp"
          className="hidden"
          onChange={onPickFile}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="company_name">Nama Perusahaan</Label>
        <Input
          id="company_name"
          name="company_name"
          placeholder="Toko Berkah Jaya"
          required
        />
      </div>

      <Button type="submit" className="w-full" disabled={busy}>
        {busy && <Loader2 className="size-4 animate-spin" />}
        {uploading ? "Mengunggah logo…" : "Lanjutkan ke Dashboard"}
      </Button>
    </form>
  );
}
