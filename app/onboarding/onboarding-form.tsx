"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

import { createWorkspace } from "./actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function OnboardingForm() {
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    startTransition(async () => {
      const result = await createWorkspace({ error: null }, fd);
      if (result?.error) toast.error(result.error);
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="space-y-2">
        <Label htmlFor="company_name">Nama Perusahaan</Label>
        <Input
          id="company_name"
          name="company_name"
          placeholder="Toko Berkah Jaya"
          required
        />
      </div>

      <p className="text-sm text-muted-foreground">
        Logo bisa Anda tambahkan nanti di menu Pengaturan.
      </p>

      <Button type="submit" className="w-full" disabled={isPending}>
        {isPending && <Loader2 className="size-4 animate-spin" />}
        Lanjutkan ke Dashboard
      </Button>
    </form>
  );
}
