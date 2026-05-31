import {
  Banknote,
  Clock,
  HandCoins,
  Wallet,
} from "lucide-react";

import { getScopedDb } from "@/lib/db/scoped";
import { formatNumber, formatRupiah } from "@/lib/format";
import { PageHeader } from "@/components/layout/page-header";
import { MetricCard } from "@/components/dashboard/metric-card";
import {
  SalesBarChart,
  type MonthlyPoint,
} from "@/components/dashboard/sales-bar-chart";
import { GrowthGauge } from "@/components/dashboard/growth-gauge";
import type { SaleStatus } from "@/lib/types";

interface SaleAgg {
  total_amount: number;
  status: SaleStatus;
  created_at: string;
  payment_history: { amount_paid: number }[];
}

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
    "total_amount, status, created_at, payment_history(amount_paid)"
  );

  const sales = (data ?? []) as unknown as SaleAgg[];
  const paidOf = (s: SaleAgg) =>
    s.payment_history.reduce((sum, p) => sum + Number(p.amount_paid), 0);

  const revenueLunas = sales
    .filter((s) => s.status === "Lunas")
    .reduce((sum, s) => sum + Number(s.total_amount), 0);

  const outstanding = sales
    .filter((s) => s.status === "Belum Lunas")
    .reduce((sum, s) => sum + Math.max(0, Number(s.total_amount) - paidOf(s)), 0);

  const activeDP = sales.filter((s) => s.status === "DP").length;
  const totalSales = sales.length;

  // Monthly revenue series (last 8 months, by sale total_amount).
  const now = new Date();
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
          label="Piutang (Belum Lunas)"
          value={formatRupiah(outstanding)}
          hint="Tagihan belum terlunasi"
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
          value={formatRupiah(thisMonth)}
          hint={`${growthPercent >= 0 ? "+" : ""}${growthPercent.toFixed(1)}% vs bulan lalu`}
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
    </>
  );
}
