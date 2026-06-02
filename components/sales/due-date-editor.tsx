"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { CalendarClock, Loader2 } from "lucide-react";

import { updateDueDate } from "@/app/dashboard/[workspace_id]/sales/actions";
import { formatDate, isOverdue } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function DueDateEditor({
  workspaceId,
  saleId,
  dueDate,
  status,
}: {
  workspaceId: string;
  saleId: string;
  dueDate: string | null;
  status: string;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(dueDate ?? "");

  const overdue = isOverdue(dueDate, status);

  function save() {
    startTransition(async () => {
      const result = await updateDueDate(workspaceId, saleId, value || null);
      if (result.error) {
        toast.error(result.error);
        return;
      }
      toast.success("Jatuh tempo diperbarui.");
      setEditing(false);
      router.refresh();
    });
  }

  if (editing) {
    return (
      <div className="space-y-2 rounded-lg border p-3">
        <p className="text-sm font-medium">Jatuh Tempo</p>
        <Input
          type="date"
          value={value}
          onChange={(e) => setValue(e.target.value)}
        />
        <div className="flex gap-2">
          <Button size="sm" onClick={save} disabled={isPending}>
            {isPending && <Loader2 className="size-4 animate-spin" />}
            Simpan
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              setValue(dueDate ?? "");
              setEditing(false);
            }}
          >
            Batal
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between rounded-lg border p-3">
      <div className="min-w-0">
        <p className="flex items-center gap-1.5 text-sm font-medium">
          <CalendarClock className="size-4 text-muted-foreground" />
          Jatuh Tempo
        </p>
        <p
          className={
            overdue
              ? "text-sm font-semibold text-red-600"
              : "text-sm text-muted-foreground"
          }
        >
          {dueDate ? formatDate(dueDate) : "Belum diatur"}
          {overdue && " · Lewat tempo"}
        </p>
      </div>
      <Button size="sm" variant="ghost" onClick={() => setEditing(true)}>
        {dueDate ? "Ubah" : "Atur"}
      </Button>
    </div>
  );
}
