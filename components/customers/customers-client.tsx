"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { MoreVertical, Pencil, Phone, Plus, Trash2, Users } from "lucide-react";

import { deleteCustomer } from "@/app/dashboard/[workspace_id]/customers/actions";
import type { Customer } from "@/lib/types";
import { CustomerDialog } from "./customer-dialog";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
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

export function CustomersClient({
  workspaceId,
  customers,
}: {
  workspaceId: string;
  customers: Customer[];
}) {
  const [, startTransition] = useTransition();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Customer | undefined>();
  const [toDelete, setToDelete] = useState<Customer | undefined>();

  function openCreate() {
    setEditing(undefined);
    setDialogOpen(true);
  }
  function openEdit(customer: Customer) {
    setEditing(customer);
    setDialogOpen(true);
  }
  function confirmDelete() {
    if (!toDelete) return;
    const customer = toDelete;
    startTransition(async () => {
      const result = await deleteCustomer(workspaceId, customer.id);
      if (result.error) toast.error(result.error);
      else toast.success("Pelanggan dihapus.");
      setToDelete(undefined);
    });
  }

  return (
    <>
      <div className="mb-4 flex justify-end">
        <Button onClick={openCreate}>
          <Plus className="size-4" />
          Tambah Pelanggan
        </Button>
      </div>

      {customers.length === 0 ? (
        <Card className="flex flex-col items-center justify-center gap-3 py-16 text-center">
          <span className="flex size-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
            <Users className="size-6" />
          </span>
          <div>
            <p className="font-medium">Belum ada pelanggan</p>
            <p className="text-sm text-muted-foreground">
              Tambahkan pelanggan untuk mempercepat pencatatan penjualan.
            </p>
          </div>
          <Button onClick={openCreate} variant="outline">
            <Plus className="size-4" />
            Tambah Pelanggan
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
                    <TableHead>Nama</TableHead>
                    <TableHead>Nomor HP</TableHead>
                    <TableHead>Deskripsi</TableHead>
                    <TableHead className="w-12" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {customers.map((c) => (
                    <TableRow
                      key={c.id}
                      className="transition-colors hover:bg-muted/50"
                    >
                      <TableCell className="font-medium">{c.name}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {c.phone || "—"}
                      </TableCell>
                      <TableCell className="max-w-xs truncate text-muted-foreground">
                        {c.description || "—"}
                      </TableCell>
                      <TableCell>
                        <RowMenu
                          onEdit={() => openEdit(c)}
                          onDelete={() => setToDelete(c)}
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
            {customers.map((c) => (
              <Card
                key={c.id}
                className="flex-row items-start justify-between gap-3 p-4"
              >
                <div className="min-w-0">
                  <p className="truncate font-medium">{c.name}</p>
                  {c.phone && (
                    <p className="mt-0.5 flex items-center gap-1.5 text-sm text-muted-foreground">
                      <Phone className="size-3.5" />
                      {c.phone}
                    </p>
                  )}
                  {c.description && (
                    <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                      {c.description}
                    </p>
                  )}
                </div>
                <RowMenu
                  onEdit={() => openEdit(c)}
                  onDelete={() => setToDelete(c)}
                />
              </Card>
            ))}
          </div>
        </>
      )}

      <CustomerDialog
        key={editing?.id ?? "new"}
        workspaceId={workspaceId}
        customer={editing}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
      />

      <Dialog
        open={Boolean(toDelete)}
        onOpenChange={(o) => !o && setToDelete(undefined)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Hapus pelanggan?</DialogTitle>
            <DialogDescription>
              Pelanggan <span className="font-medium">{toDelete?.name}</span>{" "}
              akan dihapus. Transaksi yang sudah ada tetap tersimpan dengan nama
              pelanggan terdahulu.
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
