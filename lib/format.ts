const rupiah = new Intl.NumberFormat("id-ID", {
  style: "currency",
  currency: "IDR",
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

/** Format a number as Indonesian Rupiah, e.g. 150000 -> "Rp150.000". */
export function formatRupiah(value: number | string | null | undefined): string {
  const n = typeof value === "string" ? Number(value) : value ?? 0;
  if (!Number.isFinite(n)) return rupiah.format(0);
  return rupiah.format(n as number);
}

/** Compact number formatting, e.g. 2500 -> "2.500". */
export function formatNumber(value: number | string | null | undefined): string {
  const n = typeof value === "string" ? Number(value) : value ?? 0;
  return new Intl.NumberFormat("id-ID").format(Number.isFinite(n) ? (n as number) : 0);
}

const dateFmt = new Intl.DateTimeFormat("id-ID", {
  day: "numeric",
  month: "long",
  year: "numeric",
});

const dateTimeFmt = new Intl.DateTimeFormat("id-ID", {
  day: "numeric",
  month: "short",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});

export function formatDate(value: string | Date | null | undefined): string {
  if (!value) return "-";
  const d = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(d.getTime())) return "-";
  return dateFmt.format(d);
}

export function formatDateTime(value: string | Date | null | undefined): string {
  if (!value) return "-";
  const d = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(d.getTime())) return "-";
  return dateTimeFmt.format(d);
}

/** Today's date as a YYYY-MM-DD string in local time (matches a `date` column). */
export function todayISODate(): string {
  const d = new Date();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${m}-${day}`;
}

/**
 * A sale is overdue when it has a due date in the past and is not yet fully
 * paid. Compares calendar dates as strings (both YYYY-MM-DD), so timezone has
 * no effect.
 */
export function isOverdue(
  dueDate: string | null | undefined,
  status: string
): boolean {
  if (!dueDate || status === "Lunas") return false;
  return dueDate < todayISODate();
}

/**
 * Whole-day difference from today to a YYYY-MM-DD date: negative when the date
 * is in the past, 0 today, positive in the future. Uses UTC midnight on both
 * sides so the result is purely calendar-based.
 */
export function daysUntil(dateStr: string): number {
  const [y, m, d] = dateStr.split("-").map(Number);
  const target = Date.UTC(y, m - 1, d);
  const now = new Date();
  const today = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate());
  return Math.round((target - today) / 86_400_000);
}
