import {
  Banknote,
  Clock,
  HandCoins,
  Wallet,
} from "lucide-react";

import { getScopedDb } from "@/lib/db/scoped";
import { daysUntil, formatNumber, formatRupiah } from "@/lib/format";
import { PageHeader } from "@/components/layout/page-header";
import { MetricCard } from "@/components/dashboard/metric-card";
import {
  SalesBarChart,
  type MonthlyPoint,
} from "@/components/dashboard/sales-bar-chart";
import { GrowthGauge } from "@/components/dashboard/growth-gauge";
import { DueReminders, type DueItem } from "@/components/dashboard/due-reminders";
import type { SaleStatus } from "@/lib/types";

interface SaleAgg {
  id: string;
  invoice_number: string;
  customer_name: string;
  total_amount: number;
  status: SaleStatus;
  due_date: string | null;
  created_at: string;
  payment_history: { amount_paid: number; payment_date: string }[];
}

/** Sales due within this many days are listed as "akan jatuh tempo". */
const UPCOMING_WINDOW_DAYS = 7;

const monthKey = (d: Date) => `${d.getFullYear()}-${d.getMonth()}`;

const MONTH_LABELS = [
  "Jan", "Feb", "Mar", "Apr", "Mei", "Jun",
  "Jul", "Agu", "Sep", "Okt", "Nov", "Des",
];

export default async function DashboardPage({
  params,
}: {
  params: Promise<{ workspace_id: string }>;
}) {
  const { workspace_id } = await params;
  const db = await getScopedDb(workspace_id);

  const { data } = await db.select(
    "sales",
    "id, invoice_number, customer_name, total_amount, status, due_date, created_at, payment_history(amount_paid, payment_date)"
  );

  const sales = (data ?? []) as unknown as SaleAgg[];
  const paidOf = (s: SaleAgg) =>
    s.payment_history.reduce((sum, p) => sum + Number(p.amount_paid), 0);

  // Due-date reminders: unpaid sales with a due date, split into overdue and
  // upcoming (within UPCOMING_WINDOW_DAYS), each sorted by nearest date first.
  const overdueItems: DueItem[] = [];
  const upcomingItems: DueItem[] = [];
  for (const s of sales) {
    if (s.status === "Lunas" || !s.due_date) continue;
    const remaining = Math.max(0, Number(s.total_amount) - paidOf(s));
    if (remaining <= 0) continue;
    const diff = daysUntil(s.due_date);
    const item: DueItem = {
      id: s.id,
      invoice_number: s.invoice_number,
      customer_name: s.customer_name,
      due_date: s.due_date,
      remaining,
    };
    if (diff < 0) overdueItems.push(item);
    else if (diff <= UPCOMING_WINDOW_DAYS) upcomingItems.push(item);
  }
  const byDueDate = (a: DueItem, b: DueItem) =>
    a.due_date < b.due_date ? -1 : a.due_date > b.due_date ? 1 : 0;
  overdueItems.sort(byDueDate);
  upcomingItems.sort(byDueDate);

  const revenueLunas = sales
    .filter((s) => s.status === "Lunas")
    .reduce((sum, s) => sum + Number(s.total_amount), 0);

  // Piutang = sisa tagihan dari semua transaksi yang belum lunas (DP + Belum Lunas).
  const outstanding = sales
    .filter((s) => s.status === "DP" || s.status === "Belum Lunas")
    .reduce((sum, s) => sum + Math.max(0, Number(s.total_amount) - paidOf(s)), 0);

  const activeDP = sales.filter((s) => s.status === "DP").length;
  const totalSales = sales.length;

  const now = new Date();

  // Pendapatan bulan ini = uang yang benar-benar diterima (payment_history)
  // pada bulan berjalan, berdasarkan tanggal pembayaran — bukan nilai tagihan.
  const thisMonthKey = monthKey(now);
  const lastMonthKey = monthKey(new Date(now.getFullYear(), now.getMonth() - 1, 1));
  let cashThisMonth = 0;
  let cashLastMonth = 0;
  for (const s of sales) {
    for (const p of s.payment_history) {
      const k = monthKey(new Date(p.payment_date));
      if (k === thisMonthKey) cashThisMonth += Number(p.amount_paid);
      else if (k === lastMonthKey) cashLastMonth += Number(p.amount_paid);
    }
  }
  const cashGrowthPercent =
    cashLastMonth > 0
      ? ((cashThisMonth - cashLastMonth) / cashLastMonth) * 100
      : cashThisMonth > 0
        ? 100
        : 0;

  // Monthly sales series (last 8 months, by sale total_amount) — drives the
  // "Performa Penjualan" chart and growth gauge (nominal sales, not cash).
  const months: { key: string; label: string }[] = [];
  for (let i = 7; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push({
      key: `${d.getFullYear()}-${d.getMonth()}`,
      label: MONTH_LABELS[d.getMonth()],
    });
  }
  const byMonth = new Map<string, number>();
  for (const s of sales) {
    const d = new Date(s.created_at);
    const key = `${d.getFullYear()}-${d.getMonth()}`;
    byMonth.set(key, (byMonth.get(key) ?? 0) + Number(s.total_amount));
  }
  const chartData: MonthlyPoint[] = months.map((m) => ({
    month: m.label,
    revenue: byMonth.get(m.key) ?? 0,
  }));

  const thisMonth = chartData[chartData.length - 1]?.revenue ?? 0;
  const lastMonth = chartData[chartData.length - 2]?.revenue ?? 0;
  const growthPercent =
    lastMonth > 0
      ? ((thisMonth - lastMonth) / lastMonth) * 100
      : thisMonth > 0
        ? 100
        : 0;

  return (
    <>
      <PageHeader
        title="Ringkasan Penjualan"
        description="Ringkasan aktivitas dan pendapatan usaha Anda."
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          highlight
          label="Total Pendapatan (Lunas)"
          value={formatRupiah(revenueLunas)}
          hint={`${formatNumber(totalSales)} total transaksi`}
          icon={Wallet}
        />
        <MetricCard
          label="Piutang Usaha"
          value={formatRupiah(outstanding)}
          hint="Sisa tagihan DP & Belum Lunas"
          icon={Banknote}
          tone="amber"
        />
        <MetricCard
          label="Transaksi DP Aktif"
          value={formatNumber(activeDP)}
          hint="Menunggu pelunasan / pengiriman"
          icon={Clock}
          tone="blue"
        />
        <MetricCard
          label="Pendapatan Bulan Ini"
          value={formatRupiah(cashThisMonth)}
          hint={`Uang masuk · ${cashGrowthPercent >= 0 ? "+" : ""}${cashGrowthPercent.toFixed(1)}% vs bulan lalu`}
          icon={HandCoins}
          tone="emerald"
        />
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <SalesBarChart data={chartData} />
        </div>
        <div className="lg:col-span-1">
          <GrowthGauge
            growthPercent={growthPercent}
            thisMonthLabel={`${MONTH_LABELS[now.getMonth()]} ${now.getFullYear()}`}
            lastMonthLabel={
              MONTH_LABELS[(now.getMonth() + 11) % 12]
            }
          />
        </div>
      </div>

      <div className="mt-6">
        <DueReminders
          workspaceId={workspace_id}
          overdue={overdueItems}
          upcoming={upcomingItems}
        />
      </div>
    </>
  );
}
