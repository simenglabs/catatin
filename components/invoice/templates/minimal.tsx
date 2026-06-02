import { formatDate } from "@/lib/format";
import type { InvoiceTotals } from "@/lib/invoice";
import { StatusBadge } from "@/components/sales/status-badge";
import type { SaleWithRelations, Workspace } from "@/lib/types";
import {
  BusinessContact,
  InvoiceFooter,
  ItemsTable,
  PaymentHistoryList,
  TotalsBlock,
} from "../invoice-parts";

/** Spacious, monochrome layout; accent used only as a thin top rule + total. */
export function MinimalInvoice({
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
    <div className="print-area mx-auto w-full max-w-3xl rounded-2xl border bg-white p-8 text-zinc-900 shadow-sm sm:p-12">
      <div className="h-px w-16" style={{ backgroundColor: accent }} />

      <div className="mt-5 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold">{workspace.company_name}</h2>
          <BusinessContact workspace={workspace} className="mt-1" />
        </div>
        <div className="text-right">
          <p className="text-xs uppercase tracking-[0.3em] text-zinc-400">
            Invoice
          </p>
          <p className="font-mono text-sm text-zinc-700">
            {sale.invoice_number}
          </p>
        </div>
      </div>

      <div className="mt-10 flex flex-wrap justify-between gap-4 text-sm">
        <div>
          <p className="text-xs uppercase tracking-wide text-zinc-400">Kepada</p>
          <p className="mt-1 font-medium">{sale.customer_name}</p>
        </div>
        <div className="text-right">
          <p className="text-xs uppercase tracking-wide text-zinc-400">
            Tanggal
          </p>
          <p className="mt-1 font-medium">{formatDate(sale.created_at)}</p>
          {sale.due_date && (
            <>
              <p className="mt-2 text-xs uppercase tracking-wide text-zinc-400">
                Jatuh Tempo
              </p>
              <p className="mt-1 font-medium">{formatDate(sale.due_date)}</p>
            </>
          )}
        </div>
        <div className="text-right">
          <p className="text-xs uppercase tracking-wide text-zinc-400">
            Status
          </p>
          <div className="mt-1">
            <StatusBadge status={sale.status} />
          </div>
        </div>
      </div>

      <div className="mt-10">
        <ItemsTable sale={sale} accent={accent} />
      </div>

      <div className="mt-8 flex justify-end">
        <TotalsBlock sale={sale} totals={totals} accent={accent} />
      </div>

      {totals.payments.length > 0 && (
        <div className="mt-10">
          <PaymentHistoryList totals={totals} />
        </div>
      )}

      <div className="mt-12">
        <InvoiceFooter workspace={workspace} />
      </div>
    </div>
  );
}
