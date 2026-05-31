"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Loader2, Plus } from "lucide-react";

import { addPayment } from "@/app/dashboard/[workspace_id]/sales/actions";
import type { PaymentMethod } from "@/lib/types";
import { formatRupiah } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const PAYMENT_METHODS: PaymentMethod[] = ["Tunai", "Transfer", "QRIS", "Lainnya"];

export function PaymentDialog({
  workspaceId,
  saleId,
  remaining,
}: {
  workspaceId: string;
  saleId: string;
  remaining: number;
}) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState<PaymentMethod>("Tunai");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const value = Number(amount) || 0;
    if (value <= 0) return toast.error("Jumlah pembayaran tidak valid.");
    if (value > remaining)
      return toast.error("Pembayaran melebihi sisa tagihan.");

    startTransition(async () => {
      const result = await addPayment(workspaceId, saleId, {
        amount: value,
        method,
      });
      if (result.error) {
        toast.error(result.error);
        return;
      }
      toast.success("Pembayaran ditambahkan.");
      setAmount("");
      setOpen(false);
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" disabled={remaining <= 0}>
          <Plus className="size-4" />
          Tambah Pembayaran
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Tambah Pembayaran</DialogTitle>
          <DialogDescription>
            Sisa tagihan saat ini: {formatRupiah(remaining)}.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="amount">Jumlah (Rp)</Label>
            <Input
              id="amount"
              type="number"
              min={1}
              max={remaining}
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder={String(remaining)}
              required
            />
            <button
              type="button"
              onClick={() => setAmount(String(remaining))}
              className="text-xs font-medium text-primary hover:underline"
            >
              Lunasi sisa ({formatRupiah(remaining)})
            </button>
          </div>
          <div className="space-y-2">
            <Label>Metode Pembayaran</Label>
            <Select
              value={method}
              onValueChange={(v) => setMethod(v as PaymentMethod)}
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PAYMENT_METHODS.map((m) => (
                  <SelectItem key={m} value={m}>
                    {m}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={isPending} className="w-full">
              {isPending && <Loader2 className="size-4 animate-spin" />}
              Simpan Pembayaran
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
