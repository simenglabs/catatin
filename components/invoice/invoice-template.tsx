import { computeInvoiceTotals } from "@/lib/invoice";
import type { SaleWithRelations, Workspace } from "@/lib/types";
import { ModernInvoice } from "./templates/modern";
import { ClassicInvoice } from "./templates/classic";
import { MinimalInvoice } from "./templates/minimal";

const TEMPLATES = {
  modern: ModernInvoice,
  classic: ClassicInvoice,
  minimal: MinimalInvoice,
} as const;

/**
 * Renders the invoice using the workspace's chosen template, accent, and
 * business details. The same component drives the on-screen preview, the print
 * view, and the PDF capture, so customization flows everywhere from one source.
 */
export function InvoiceTemplate({
  workspace,
  sale,
}: {
  workspace: Workspace;
  sale: SaleWithRelations;
}) {
  const totals = computeInvoiceTotals(sale);
  const Template = TEMPLATES[workspace.invoice_template] ?? ModernInvoice;
  return <Template workspace={workspace} sale={sale} totals={totals} />;
}
