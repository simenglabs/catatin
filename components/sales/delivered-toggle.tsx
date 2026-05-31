"use client";

import { useTransition } from "react";
import { toast } from "sonner";

import { toggleDelivered } from "@/app/dashboard/[workspace_id]/sales/actions";
import { Switch } from "@/components/ui/switch";

export function DeliveredToggle({
  workspaceId,
  saleId,
  isDelivered,
}: {
  workspaceId: string;
  saleId: string;
  isDelivered: boolean;
}) {
  const [isPending, startTransition] = useTransition();

  function onChange(next: boolean) {
    startTransition(async () => {
      const result = await toggleDelivered(workspaceId, saleId, next);
      if (result.error) toast.error(result.error);
      else
        toast.success(
          next ? "Ditandai sudah diserahkan." : "Ditandai belum diserahkan."
        );
    });
  }

  return (
    <Switch
      checked={isDelivered}
      onCheckedChange={onChange}
      disabled={isPending}
      aria-label="Barang sudah diserahkan"
    />
  );
}
