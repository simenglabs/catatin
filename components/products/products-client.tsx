"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { MoreVertical, Package, Pencil, Plus, Trash2 } from "lucide-react";

import { deleteProduct } from "@/app/dashboard/[workspace_id]/products/actions";
import type { Product } from "@/lib/types";
import { formatNumber, formatRupiah } from "@/lib/format";
import { ProductDialog } from "./product-dialog";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

function StockBadge({ stock }: { stock: number }) {
  if (stock <= 0)
    return <Badge variant="outline" className="border-red-200 bg-red-50 text-red-700">Habis</Badge>;
  if (stock <= 5)
    return <Badge variant="outline" className="border-amber-200 bg-amber-50 text-amber-700">{formatNumber(stock)}</Badge>;
  return <Badge variant="outline">{formatNumber(stock)}</Badge>;
}

export function ProductsClient({
  workspaceId,
  products,
}: {
  workspaceId: string;
  products: Product[];
}) {
  const [, startTransition] = useTransition();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Product | undefined>();
  const [toDelete, setToDelete] = useState<Product | undefined>();

  function openCreate() {
    setEditing(undefined);
    setDialogOpen(true);
  }
  function openEdit(product: Product) {
    setEditing(product);
    setDialogOpen(true);
  }
  function confirmDelete() {
    if (!toDelete) return;
    const product = toDelete;
    startTransition(async () => {
      const result = await deleteProduct(workspaceId, product.id);
      if (result.error) toast.error(result.error);
      else toast.success("Produk dihapus.");
      setToDelete(undefined);
    });
  }

  return (
    <>
      <div className="mb-4 flex justify-end">
        <Button onClick={openCreate}>
          <Plus className="size-4" />
          Tambah Produk
        </Button>
      </div>

      {products.length === 0 ? (
        <Card className="flex flex-col items-center justify-center gap-3 py-16 text-center">
          <span className="flex size-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
            <Package className="size-6" />
          </span>
          <div>
            <p className="font-medium">Belum ada produk</p>
            <p className="text-sm text-muted-foreground">
              Tambahkan produk pertama Anda untuk mulai berjualan.
            </p>
          </div>
          <Button onClick={openCreate} variant="outline">
            <Plus className="size-4" />
            Tambah Produk
          </Button>
        </Card>
      ) : (
        <>
          {/* Desktop table */}
          <Card className="hidden overflow-hidden p-0 md:block">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nama Produk</TableHead>
                    <TableHead className="text-right">Harga</TableHead>
                    <TableHead className="text-center">Stok</TableHead>
                    <TableHead className="w-12" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {products.map((p) => (
                    <TableRow key={p.id} className="transition-colors hover:bg-muted/50">
                      <TableCell className="font-medium">{p.name}</TableCell>
                      <TableCell className="text-right">
                        {formatRupiah(p.price)}
                      </TableCell>
                      <TableCell className="text-center">
                        <StockBadge stock={p.stock} />
                      </TableCell>
                      <TableCell>
                        <RowMenu
                          onEdit={() => openEdit(p)}
                          onDelete={() => setToDelete(p)}
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </Card>

          {/* Mobile cards */}
          <div className="grid gap-3 md:hidden">
            {products.map((p) => (
              <Card key={p.id} className="flex-row items-center justify-between p-4">
                <div className="min-w-0">
                  <p className="truncate font-medium">{p.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {formatRupiah(p.price)}
                  </p>
                  <div className="mt-1">
                    <StockBadge stock={p.stock} />
                  </div>
                </div>
                <RowMenu
                  onEdit={() => openEdit(p)}
                  onDelete={() => setToDelete(p)}
                />
              </Card>
            ))}
          </div>
        </>
      )}

      <ProductDialog
        key={editing?.id ?? "new"}
        workspaceId={workspaceId}
        product={editing}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
      />

      <Dialog open={Boolean(toDelete)} onOpenChange={(o) => !o && setToDelete(undefined)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Hapus produk?</DialogTitle>
            <DialogDescription>
              Produk <span className="font-medium">{toDelete?.name}</span> akan
              dihapus permanen. Tindakan ini tidak bisa dibatalkan.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setToDelete(undefined)}>
              Batal
            </Button>
            <Button variant="destructive" onClick={confirmDelete}>
              Hapus
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

function RowMenu({
  onEdit,
  onDelete,
}: {
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" aria-label="Aksi">
          <MoreVertical className="size-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onSelect={onEdit}>
          <Pencil className="size-4" />
          Edit
        </DropdownMenuItem>
        <DropdownMenuItem variant="destructive" onSelect={onDelete}>
          <Trash2 className="size-4" />
          Hapus
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
