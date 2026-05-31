import type { PaymentHistory, SaleWithRelations } from "@/lib/types";

export interface InvoiceTotals {
  /** Payments sorted oldest-first. */
  payments: PaymentHistory[];
  /** Sum of amount_paid. */
  paid: number;
  /** Outstanding balance, never negative. */
  remaining: number;
}

/** Derives the payment summary shared by the invoice templates. */
export function computeInvoiceTotals(sale: SaleWithRelations): InvoiceTotals {
  const payments = [...sale.payment_history].sort(
    (a, b) =>
      new Date(a.payment_date).getTime() - new Date(b.payment_date).getTime()
  );
  const paid = payments.reduce((sum, p) => sum + Number(p.amount_paid), 0);
  const remaining = Math.max(0, Number(sale.total_amount) - paid);
  return { payments, paid, remaining };
}
