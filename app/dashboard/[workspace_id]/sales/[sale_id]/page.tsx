import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, FileText } from "lucide-react";

import { getScopedDb } from "@/lib/db/scoped";
import { formatDate, formatDateTime, formatRupiah } from "@/lib/format";
import { PageHeader } from "@/components/layout/page-header";
import { StatusBadge } from "@/components/sales/status-badge";
import { PaymentDialog } from "@/components/sales/payment-dialog";
import { DeliveredToggle } from "@/components/sales/delivered-toggle";
import { DueDateEditor } from "@/components/sales/due-date-editor";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { SaleWithRelations } from "@/lib/types";

export default async function SaleDetailPage({
  params,
}: {
  params: Promise<{ workspace_id: string; sale_id: string }>;
}) {
  const { workspace_id, sale_id } = await params;
  const db = await getScopedDb(workspace_id);
  const workspace = db.workspace;

  const { data } = await db
    .select("sales", "*, sales_items(*, products(name)), payment_history(*)")
    .eq("id", sale_id)
    .maybeSingle();

  if (!data) notFound();
  const sale = data as unknown as SaleWithRelations;

  const payments = [...sale.payment_history].sort(
    (a, b) =>
      new Date(a.payment_date).getTime() - new Date(b.payment_date).getTime()
  );
  const paid = payments.reduce((sum, p) => sum + Number(p.amount_paid), 0);
  const remaining = Math.max(0, Number(sale.total_amount) - paid);

  return (
    <>
      <Button asChild variant="ghost" size="sm" className="mb-2 -ml-2">
        <Link href={`/dashboard/${workspace.id}/sales`}>
          <ArrowLeft className="size-4" />
          Kembali
        </Link>
      </Button>

      <PageHeader title={sale.invoice_number} description={`Dibuat ${formatDate(sale.created_at)}`}>
        <StatusBadge status={sale.status} className="text-sm" />
        <Button asChild variant="outline">
          <Link href={`/dashboard/${workspace.id}/sales/${sale.id}/invoice`}>
            <FileText className="size-4" />
            Lihat Invoice
          </Link>
        </Button>
      </PageHeader>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Item Penjualan</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Produk</TableHead>
                      <TableHead className="text-center">Qty</TableHead>
                      <TableHead className="text-right">Harga</TableHead>
                      <TableHead className="text-right">Subtotal</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sale.sales_items.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium">
                          {item.products?.name ?? "Produk dihapus"}
                        </TableCell>
                        <TableCell className="text-center">
                          {item.quantity}
                        </TableCell>
                        <TableCell className="text-right">
                          {formatRupiah(item.price_at_sale)}
                        </TableCell>
                        <TableCell className="text-right">
                          {formatRupiah(item.price_at_sale * item.quantity)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex-row items-center justify-between">
              <CardTitle>Riwayat Pembayaran</CardTitle>
              <PaymentDialog
                workspaceId={workspace.id}
                saleId={sale.id}
                remaining={remaining}
              />
            </CardHeader>
            <CardContent>
              {payments.length === 0 ? (
                <p className="py-6 text-center text-sm text-muted-foreground">
                  Belum ada pembayaran.
                </p>
              ) : (
                <ul className="divide-y">
                  {payments.map((p) => (
                    <li
                      key={p.id}
                      className="flex items-center justify-between py-3"
                    >
                      <div>
                        <p className="font-medium">
                          {formatRupiah(p.amount_paid)}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {p.payment_method} · {formatDateTime(p.payment_date)}
                        </p>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Summary */}
        <div className="lg:col-span-1">
          <Card className="lg:sticky lg:top-20">
            <CardHeader>
              <CardTitle>Ringkasan</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-xs text-muted-foreground">Pelanggan</p>
                <p className="font-medium">{sale.customer_name}</p>
              </div>
              <Separator />
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total</span>
                  <span className="font-medium">
                    {formatRupiah(sale.total_amount)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Sudah Dibayar</span>
                  <span className="font-medium text-emerald-600">
                    {formatRupiah(paid)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Sisa Tagihan</span>
                  <span className="font-semibold">{formatRupiah(remaining)}</span>
                </div>
              </div>
              <Separator />
              <div className="flex items-center justify-between rounded-lg border p-3">
                <div>
                  <p className="text-sm font-medium">Barang Diserahkan</p>
                  <p className="text-xs text-muted-foreground">
                    Ubah status pengiriman.
                  </p>
                </div>
                <DeliveredToggle
                  workspaceId={workspace.id}
                  saleId={sale.id}
                  isDelivered={sale.is_delivered}
                />
              </div>
              <DueDateEditor
                workspaceId={workspace.id}
                saleId={sale.id}
                dueDate={sale.due_date}
                status={sale.status}
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
