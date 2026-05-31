"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, Minus, Plus, Trash2 } from "lucide-react";

import { createSale } from "@/app/dashboard/[workspace_id]/sales/actions";
import type { PaymentMethod, Product } from "@/lib/types";
import { formatRupiah } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Line {
  product: Product;
  quantity: number;
}

const PAYMENT_METHODS: PaymentMethod[] = ["Tunai", "Transfer", "QRIS", "Lainnya"];

export function SaleForm({
  workspaceId,
  products,
}: {
  workspaceId: string;
  products: Product[];
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [customerName, setCustomerName] = useState("");
  const [lines, setLines] = useState<Line[]>([]);
  const [initialPayment, setInitialPayment] = useState("");
  const [method, setMethod] = useState<PaymentMethod>("Tunai");
  const [isDelivered, setIsDelivered] = useState(false);

  const available = products.filter(
    (p) => !lines.some((l) => l.product.id === p.id)
  );

  const total = useMemo(
    () => lines.reduce((sum, l) => sum + l.product.price * l.quantity, 0),
    [lines]
  );

  function addProduct(id: string) {
    const product = products.find((p) => p.id === id);
    if (product) setLines((prev) => [...prev, { product, quantity: 1 }]);
  }

  function setQty(id: string, qty: number) {
    setLines((prev) =>
      prev.map((l) =>
        l.product.id === id
          ? { ...l, quantity: Math.max(1, Math.min(qty, l.product.stock)) }
          : l
      )
    );
  }

  function removeLine(id: string) {
    setLines((prev) => prev.filter((l) => l.product.id !== id));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!customerName.trim()) return toast.error("Nama pelanggan wajib diisi.");
    if (lines.length === 0) return toast.error("Pilih minimal satu produk.");

    const payment = Number(initialPayment) || 0;
    if (payment > total)
      return toast.error("Pembayaran melebihi total tagihan.");

    startTransition(async () => {
      const result = await createSale(workspaceId, {
        customerName,
        items: lines.map((l) => ({
          product_id: l.product.id,
          quantity: l.quantity,
        })),
        initialPayment: payment,
        paymentMethod: method,
        isDelivered,
      });
      if (result.error) {
        toast.error(result.error);
        return;
      }
      toast.success("Penjualan dibuat.");
      router.push(`/dashboard/${workspaceId}/sales/${result.saleId}`);
      router.refresh();
    });
  }

  const payment = Number(initialPayment) || 0;
  const remaining = Math.max(0, total - payment);
  const projectedStatus =
    payment >= total && total > 0
      ? "Lunas"
      : isDelivered
        ? "Belum Lunas"
        : "DP";

  return (
    <form onSubmit={handleSubmit} className="grid gap-6 lg:grid-cols-3">
      <div className="space-y-6 lg:col-span-2">
        <Card>
          <CardHeader>
            <CardTitle>Pelanggan</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label htmlFor="customer">Nama Pelanggan</Label>
              <Input
                id="customer"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="Ibu Sari"
                required
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Produk</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Select value="" onValueChange={addProduct}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="+ Tambah produk ke pesanan" />
              </SelectTrigger>
              <SelectContent>
                {available.length === 0 ? (
                  <div className="px-2 py-1.5 text-sm text-muted-foreground">
                    Tidak ada produk tersedia
                  </div>
                ) : (
                  available.map((p) => (
                    <SelectItem
                      key={p.id}
                      value={p.id}
                      disabled={p.stock <= 0}
                    >
                      {p.name} — {formatRupiah(p.price)} (stok {p.stock})
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>

            {lines.length === 0 ? (
              <p className="rounded-lg border border-dashed py-8 text-center text-sm text-muted-foreground">
                Belum ada produk dipilih.
              </p>
            ) : (
              <div className="divide-y rounded-lg border">
                {lines.map((l) => (
                  <div
                    key={l.product.id}
                    className="flex items-center gap-3 p-3"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-medium">{l.product.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {formatRupiah(l.product.price)} · stok {l.product.stock}
                      </p>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        className="size-8"
                        onClick={() => setQty(l.product.id, l.quantity - 1)}
                      >
                        <Minus className="size-3.5" />
                      </Button>
                      <Input
                        type="number"
                        min={1}
                        max={l.product.stock}
                        value={l.quantity}
                        onChange={(e) =>
                          setQty(l.product.id, Number(e.target.value))
                        }
                        className="h-8 w-14 text-center"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        className="size-8"
                        onClick={() => setQty(l.product.id, l.quantity + 1)}
                      >
                        <Plus className="size-3.5" />
                      </Button>
                    </div>
                    <div className="w-28 text-right font-medium">
                      {formatRupiah(l.product.price * l.quantity)}
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="size-8 text-muted-foreground"
                      onClick={() => removeLine(l.product.id)}
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Summary / payment */}
      <div className="lg:col-span-1">
        <Card className="lg:sticky lg:top-20">
          <CardHeader>
            <CardTitle>Ringkasan &amp; Pembayaran</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Total Tagihan</span>
              <span className="text-lg font-bold">{formatRupiah(total)}</span>
            </div>

            <div className="space-y-2">
              <Label htmlFor="payment">Pembayaran Awal (Rp)</Label>
              <Input
                id="payment"
                type="number"
                min={0}
                value={initialPayment}
                onChange={(e) => setInitialPayment(e.target.value)}
                placeholder="0"
              />
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

            <div className="flex items-center justify-between rounded-lg border p-3">
              <div>
                <p className="text-sm font-medium">Barang Sudah Diserahkan</p>
                <p className="text-xs text-muted-foreground">
                  Aktifkan jika barang sudah diberikan.
                </p>
              </div>
              <Switch checked={isDelivered} onCheckedChange={setIsDelivered} />
            </div>

            <div className="space-y-1 rounded-lg bg-muted/50 p-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Sisa Tagihan</span>
                <span className="font-medium">{formatRupiah(remaining)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Status</span>
                <span className="font-semibold text-primary">
                  {projectedStatus}
                </span>
              </div>
            </div>

            <Button type="submit" className="w-full" disabled={isPending}>
              {isPending && <Loader2 className="size-4 animate-spin" />}
              Simpan Penjualan
            </Button>
          </CardContent>
        </Card>
      </div>
    </form>
  );
}
