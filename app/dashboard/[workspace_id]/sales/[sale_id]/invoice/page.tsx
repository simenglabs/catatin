import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { getScopedDb } from "@/lib/db/scoped";
import { InvoiceTemplate } from "@/components/invoice/invoice-template";
import { PrintButton } from "@/components/invoice/print-button";
import { DownloadPdfButton } from "@/components/invoice/download-pdf-button";
import { Button } from "@/components/ui/button";
import type { SaleWithRelations } from "@/lib/types";

export default async function InvoicePage({
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

  return (
    <div className="mx-auto max-w-3xl">
      <div className="no-print mb-6 flex items-center justify-between">
        <Button asChild variant="ghost" size="sm" className="-ml-2">
          <Link href={`/dashboard/${workspace.id}/sales/${sale.id}`}>
            <ArrowLeft className="size-4" />
            Kembali
          </Link>
        </Button>
        <div className="flex items-center gap-2">
          <PrintButton />
          <DownloadPdfButton
            targetId="invoice-sheet"
            fileName={`Invoice-${sale.invoice_number}.pdf`}
          />
        </div>
      </div>

      <div id="invoice-sheet">
        <InvoiceTemplate workspace={workspace} sale={sale} />
      </div>
    </div>
  );
}
