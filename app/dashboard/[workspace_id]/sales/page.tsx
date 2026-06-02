import Link from "next/link";
import { ChevronRight, Plus, ShoppingCart } from "lucide-react";

import { getScopedDb } from "@/lib/db/scoped";
import { formatDate, formatRupiah, isOverdue } from "@/lib/format";
import { PageHeader } from "@/components/layout/page-header";
import { StatusBadge } from "@/components/sales/status-badge";
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
import type { Sale } from "@/lib/types";

type SaleRow = Sale & { payment_history: { amount_paid: number }[] };

export default async function SalesPage({
  params,
}: {
  params: Promise<{ workspace_id: string }>;
}) {
  const { workspace_id } = await params;
  const db = await getScopedDb(workspace_id);
  const workspace = db.workspace;

  const { data } = await db
    .select("sales", "*, payment_history(amount_paid)")
    .order("created_at", { ascending: false });

  const sales = (data ?? []) as unknown as SaleRow[];
  const paidOf = (s: SaleRow) =>
    s.payment_history.reduce((sum, p) => sum + Number(p.amount_paid), 0);

  return (
    <>
      <PageHeader
        title="Penjualan"
        description="Daftar seluruh transaksi penjualan Anda."
      >
        <Button asChild>
          <Link href={`/dashboard/${workspace.id}/sales/new`}>
            <Plus className="size-4" />
            Buat Penjualan
          </Link>
        </Button>
      </PageHeader>

      {sales.length === 0 ? (
        <Card className="flex flex-col items-center justify-center gap-3 py-16 text-center">
          <span className="flex size-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
            <ShoppingCart className="size-6" />
          </span>
          <div>
            <p className="font-medium">Belum ada penjualan</p>
            <p className="text-sm text-muted-foreground">
              Catat transaksi pertama Anda.
            </p>
          </div>
          <Button asChild variant="outline">
            <Link href={`/dashboard/${workspace.id}/sales/new`}>
              <Plus className="size-4" />
              Buat Penjualan
            </Link>
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
                    <TableHead>Invoice</TableHead>
                    <TableHead>Pelanggan</TableHead>
                    <TableHead>Tanggal</TableHead>
                    <TableHead>Jatuh Tempo</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                    <TableHead className="text-right">Sisa</TableHead>
                    <TableHead className="text-center">Status</TableHead>
                    <TableHead className="w-10" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sales.map((s) => {
                    const remaining = Math.max(0, Number(s.total_amount) - paidOf(s));
                    return (
                      <TableRow
                        key={s.id}
                        className="cursor-pointer transition-colors hover:bg-muted/50"
                        data-href={`/dashboard/${workspace.id}/sales/${s.id}`}
                      >
                        <TableCell className="font-medium">
                          <Link
                            href={`/dashboard/${workspace.id}/sales/${s.id}`}
                            className="hover:underline"
                          >
                            {s.invoice_number}
                          </Link>
                        </TableCell>
                        <TableCell>{s.customer_name}</TableCell>
                        <TableCell className="text-muted-foreground">
                          {formatDate(s.created_at)}
                        </TableCell>
                        <TableCell
                          className={
                            isOverdue(s.due_date, s.status)
                              ? "font-medium text-red-600"
                              : "text-muted-foreground"
                          }
                        >
                          {s.due_date ? (
                            <>
                              {formatDate(s.due_date)}
                              {isOverdue(s.due_date, s.status) && (
                                <span className="ml-1 text-xs">(lewat)</span>
                              )}
                            </>
                          ) : (
                            "—"
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          {formatRupiah(s.total_amount)}
                        </TableCell>
                        <TableCell className="text-right">
                          {formatRupiah(remaining)}
                        </TableCell>
                        <TableCell className="text-center">
                          <StatusBadge status={s.status} />
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          <ChevronRight className="size-4" />
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </Card>

          {/* Mobile cards */}
          <div className="grid gap-3 md:hidden">
            {sales.map((s) => {
              const remaining = Math.max(0, Number(s.total_amount) - paidOf(s));
              return (
                <Link
                  key={s.id}
                  href={`/dashboard/${workspace.id}/sales/${s.id}`}
                >
                  <Card className="gap-2 p-4">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="truncate font-medium">{s.customer_name}</p>
                        <p className="text-xs text-muted-foreground">
                          {s.invoice_number} · {formatDate(s.created_at)}
                        </p>
                      </div>
                      <StatusBadge status={s.status} />
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Total</span>
                      <span className="font-semibold">
                        {formatRupiah(s.total_amount)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Sisa</span>
                      <span>{formatRupiah(remaining)}</span>
                    </div>
                    {s.due_date && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Jatuh Tempo</span>
                        <span
                          className={
                            isOverdue(s.due_date, s.status)
                              ? "font-medium text-red-600"
                              : ""
                          }
                        >
                          {formatDate(s.due_date)}
                          {isOverdue(s.due_date, s.status) && " (lewat)"}
                        </span>
                      </div>
                    )}
                  </Card>
                </Link>
              );
            })}
          </div>
        </>
      )}
    </>
  );
}
