"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

import {
  createCustomer,
  updateCustomer,
} from "@/app/dashboard/[workspace_id]/customers/actions";
import type { Customer } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export function CustomerDialog({
  workspaceId,
  customer,
  open,
  onOpenChange,
  onSaved,
}: {
  workspaceId: string;
  customer?: Customer;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Called with the resulting customer after a successful save. */
  onSaved?: (customer: Customer) => void;
}) {
  const isEdit = Boolean(customer);
  const [isPending, startTransition] = useTransition();
  const [name, setName] = useState(customer?.name ?? "");
  const [phone, setPhone] = useState(customer?.phone ?? "");
  const [description, setDescription] = useState(customer?.description ?? "");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const values = { name: name.trim(), phone, description };
    if (!values.name) return toast.error("Nama pelanggan wajib diisi.");

    startTransition(async () => {
      if (isEdit) {
        const result = await updateCustomer(workspaceId, customer!.id, values);
        if (result.error) {
          toast.error(result.error);
          return;
        }
        toast.success("Pelanggan diperbarui.");
        onSaved?.({
          ...customer!,
          name: values.name,
          phone: values.phone.trim() || null,
          description: values.description.trim() || null,
        });
      } else {
        const result = await createCustomer(workspaceId, values);
        if (result.error) {
          toast.error(result.error);
          return;
        }
        toast.success("Pelanggan ditambahkan.");
        if (result.customer) onSaved?.(result.customer);
      }
      onOpenChange(false);
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {isEdit ? "Edit Pelanggan" : "Tambah Pelanggan"}
          </DialogTitle>
          <DialogDescription>Masukkan detail pelanggan.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="c-name">Nama Pelanggan</Label>
            <Input
              id="c-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ibu Sari"
              autoFocus
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="c-phone">Nomor HP</Label>
            <Input
              id="c-phone"
              type="tel"
              inputMode="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="0812xxxxxxx"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="c-desc">
              Deskripsi{" "}
              <span className="font-normal text-muted-foreground">
                (opsional)
              </span>
            </Label>
            <Textarea
              id="c-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Catatan, alamat, atau info lain."
              rows={3}
            />
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Batal
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending && <Loader2 className="size-4 animate-spin" />}
              Simpan
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
