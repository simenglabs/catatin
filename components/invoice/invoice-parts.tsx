/* eslint-disable @next/next/no-img-element */
import { formatDateTime, formatRupiah } from "@/lib/format";
import type { InvoiceTotals } from "@/lib/invoice";
import type { SaleWithRelations, Workspace } from "@/lib/types";

/**
 * Logo or initial fallback. crossOrigin="anonymous" lets html-to-image embed
 * the remote Supabase logo when rendering the PDF (otherwise the canvas taints).
 */
export function LogoMark({
  workspace,
  accent,
  className = "size-14 rounded-xl",
}: {
  workspace: Workspace;
  accent: string;
  className?: string;
}) {
  if (workspace.logo_url) {
    return (
      <img
        src={workspace.logo_url}
        alt={workspace.company_name}
        crossOrigin="anonymous"
        className={`${className} object-cover`}
      />
    );
  }
  return (
    <div
      className={`${className} flex items-center justify-center text-xl font-bold text-white`}
      style={{ backgroundColor: accent }}
    >
      {workspace.company_name.charAt(0).toUpperCase()}
    </div>
  );
}

/** Address / phone / email / tax id lines — only rendered when present. */
export function BusinessContact({
  workspace,
  className = "",
}: {
  workspace: Workspace;
  className?: string;
}) {
  const lines = [
    workspace.business_address,
    workspace.business_phone,
    workspace.business_email,
    workspace.business_tax_id ? `NPWP: ${workspace.business_tax_id}` : null,
  ].filter(Boolean) as string[];

  if (lines.length === 0) return null;
  return (
    <div className={`space-y-0.5 text-xs text-zinc-500 ${className}`}>
      {lines.map((line) => (
        <p key={line} className="whitespace-pre-line">
          {line}
        </p>
      ))}
    </div>
  );
}

export function ItemsTable({
  sale,
  accent,
}: {
  sale: SaleWithRelations;
  accent: string;
}) {
  return (
    <table className="w-full text-sm">
      <thead>
        <tr
          className="text-left text-xs uppercase tracking-wide"
          style={{ color: accent }}
        >
          <th className="py-2 font-semibold">Produk</th>
          <th className="py-2 text-center font-semibold">Qty</th>
          <th className="py-2 text-right font-semibold">Harga</th>
          <th className="py-2 text-right font-semibold">Subtotal</th>
        </tr>
      </thead>
      <tbody>
        {sale.sales_items.map((item) => (
          <tr key={item.id} className="border-b border-zinc-100">
            <td className="py-3 font-medium">
              {item.products?.name ?? "Produk dihapus"}
            </td>
            <td className="py-3 text-center">{item.quantity}</td>
            <td className="py-3 text-right">
              {formatRupiah(item.price_at_sale)}
            </td>
            <td className="py-3 text-right">
              {formatRupiah(item.price_at_sale * item.quantity)}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export function TotalsBlock({
  sale,
  totals,
  accent,
}: {
  sale: SaleWithRelations;
  totals: InvoiceTotals;
  accent: string;
}) {
  return (
    <div className="w-full max-w-xs space-y-2 text-sm">
      <div className="flex justify-between">
        <span className="text-zinc-500">Total Tagihan</span>
        <span className="font-semibold">{formatRupiah(sale.total_amount)}</span>
      </div>
      <div className="flex justify-between">
        <span className="text-zinc-500">Sudah Dibayar</span>
        <span className="font-semibold text-emerald-600">
          {formatRupiah(totals.paid)}
        </span>
      </div>
      <div className="flex justify-between border-t pt-2 text-base">
        <span className="font-medium">Sisa Tagihan</span>
        <span className="font-bold" style={{ color: accent }}>
          {formatRupiah(totals.remaining)}
        </span>
      </div>
    </div>
  );
}

export function PaymentHistoryList({ totals }: { totals: InvoiceTotals }) {
  if (totals.payments.length === 0) return null;
  return (
    <div>
      <p className="text-xs font-medium uppercase tracking-wide text-zinc-400">
        Riwayat Pembayaran
      </p>
      <ul className="mt-2 divide-y divide-zinc-100 text-sm">
        {totals.payments.map((p) => (
          <li key={p.id} className="flex justify-between py-2">
            <span className="text-zinc-600">
              {formatDateTime(p.payment_date)} · {p.payment_method}
            </span>
            <span className="font-medium">{formatRupiah(p.amount_paid)}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

/** Payment instructions + custom footer note. Falls back to a thank-you line. */
export function InvoiceFooter({ workspace }: { workspace: Workspace }) {
  return (
    <div className="space-y-4">
      {workspace.payment_instructions && (
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-zinc-400">
            Instruksi Pembayaran
          </p>
          <p className="mt-1 whitespace-pre-line text-sm text-zinc-600">
            {workspace.payment_instructions}
          </p>
        </div>
      )}
      <p className="whitespace-pre-line text-center text-xs text-zinc-400">
        {workspace.invoice_footer?.trim() ||
          `Terima kasih atas kepercayaan Anda kepada ${workspace.company_name}.`}
      </p>
    </div>
  );
}
