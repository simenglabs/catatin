"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

import { createProduct, updateProduct } from "@/app/dashboard/[workspace_id]/products/actions";
import type { Product } from "@/lib/types";
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
} from "@/components/ui/dialog";

export function ProductDialog({
  workspaceId,
  product,
  open,
  onOpenChange,
}: {
  workspaceId: string;
  product?: Product;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const isEdit = Boolean(product);
  const [isPending, startTransition] = useTransition();
  const [name, setName] = useState(product?.name ?? "");
  const [price, setPrice] = useState(String(product?.price ?? ""));
  const [stock, setStock] = useState(String(product?.stock ?? ""));

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const values = {
      name: name.trim(),
      price: Number(price) || 0,
      stock: Math.trunc(Number(stock) || 0),
    };
    if (!values.name) return toast.error("Nama produk wajib diisi.");

    startTransition(async () => {
      const result = isEdit
        ? await updateProduct(workspaceId, product!.id, values)
        : await createProduct(workspaceId, values);
      if (result.error) {
        toast.error(result.error);
        return;
      }
      toast.success(isEdit ? "Produk diperbarui." : "Produk ditambahkan.");
      onOpenChange(false);
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit Produk" : "Tambah Produk"}</DialogTitle>
          <DialogDescription>
            Masukkan detail produk Anda.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="p-name">Nama Produk</Label>
            <Input
              id="p-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Kopi Arabika 250g"
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="p-price">Harga (Rp)</Label>
              <Input
                id="p-price"
                type="number"
                min={0}
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="50000"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="p-stock">Stok</Label>
              <Input
                id="p-stock"
                type="number"
                min={0}
                value={stock}
                onChange={(e) => setStock(e.target.value)}
                placeholder="100"
                required
              />
            </div>
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
