import { formatDate } from "@/lib/format";
import type { InvoiceTotals } from "@/lib/invoice";
import { StatusBadge } from "@/components/sales/status-badge";
import type { SaleWithRelations, Workspace } from "@/lib/types";
import {
  BusinessContact,
  InvoiceFooter,
  ItemsTable,
  LogoMark,
  PaymentHistoryList,
  TotalsBlock,
} from "../invoice-parts";

/** Traditional centered layout with a heavy accent rule under the header. */
export function ClassicInvoice({
  workspace,
  sale,
  totals,
}: {
  workspace: Workspace;
  sale: SaleWithRelations;
  totals: InvoiceTotals;
}) {
  const accent = workspace.invoice_accent;
  return (
    <div className="print-area mx-auto w-full max-w-3xl rounded-2xl border bg-white p-8 font-serif text-zinc-900 shadow-sm sm:p-12">
      {/* Centered identity */}
      <div className="flex flex-col items-center text-center">
        <LogoMark
          workspace={workspace}
          accent={accent}
          className="size-16 rounded-full"
        />
        <h2 className="mt-3 text-2xl font-bold tracking-wide">
          {workspace.company_name}
        </h2>
        <BusinessContact workspace={workspace} className="mt-1 text-center" />
      </div>

      <div className="my-6 h-1 w-full" style={{ backgroundColor: accent }} />

      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-3xl font-bold tracking-widest text-zinc-800">
            INVOICE
          </p>
          <p className="font-mono text-sm text-zinc-600">
            {sale.invoice_number}
          </p>
        </div>
        <StatusBadge status={sale.status} />
      </div>

      <div className="mt-6 grid gap-4 rounded-lg border p-4 text-sm sm:grid-cols-2">
        <div>
          <span className="text-zinc-500">Kepada: </span>
          <span className="font-semibold">{sale.customer_name}</span>
        </div>
        <div className="sm:text-right">
          <span className="text-zinc-500">Tanggal: </span>
          <span className="font-semibold">{formatDate(sale.created_at)}</span>
        </div>
      </div>

      <div className="mt-6">
        <ItemsTable sale={sale} accent={accent} />
      </div>

      <div className="mt-6 flex justify-end">
        <TotalsBlock sale={sale} totals={totals} accent={accent} />
      </div>

      {totals.payments.length > 0 && (
        <div className="mt-8">
          <PaymentHistoryList totals={totals} />
        </div>
      )}

      <div className="mt-10 border-t pt-6">
        <InvoiceFooter workspace={workspace} />
      </div>
    </div>
  );
}
