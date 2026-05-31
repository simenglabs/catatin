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

export function ModernInvoice({
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
    <div className="print-area mx-auto w-full max-w-3xl overflow-hidden rounded-2xl border bg-white text-zinc-900 shadow-sm">
      <div className="h-2 w-full" style={{ backgroundColor: accent }} />
      <div className="p-8 sm:p-10">
        {/* Header */}
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <LogoMark workspace={workspace} accent={accent} />
            <div>
              <h2 className="text-xl font-bold">{workspace.company_name}</h2>
              <BusinessContact workspace={workspace} className="mt-1" />
            </div>
          </div>
          <div className="text-right">
            <p
              className="text-2xl font-extrabold tracking-tight"
              style={{ color: accent }}
            >
              INVOICE
            </p>
            <p className="font-mono text-sm text-zinc-600">
              {sale.invoice_number}
            </p>
            <div className="mt-2 flex justify-end">
              <StatusBadge status={sale.status} />
            </div>
          </div>
        </div>

        {/* Meta */}
        <div className="mt-8 grid gap-6 sm:grid-cols-2">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-zinc-400">
              Ditagihkan kepada
            </p>
            <p className="mt-1 text-base font-semibold">{sale.customer_name}</p>
          </div>
          <div className="sm:text-right">
            <p className="text-xs font-medium uppercase tracking-wide text-zinc-400">
              Tanggal
            </p>
            <p className="mt-1 text-base font-semibold">
              {formatDate(sale.created_at)}
            </p>
          </div>
        </div>

        <div className="mt-6 border-t pt-2">
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
    </div>
  );
}
