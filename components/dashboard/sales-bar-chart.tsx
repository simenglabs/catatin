"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { formatRupiah } from "@/lib/format";

export interface MonthlyPoint {
  month: string;
  revenue: number;
}

export function SalesBarChart({ data }: { data: MonthlyPoint[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Performa Penjualan</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: 8 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
              <XAxis
                dataKey="month"
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 12, fill: "var(--muted-foreground)" }}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                width={48}
                tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
                tickFormatter={(v) =>
                  v >= 1_000_000
                    ? `${v / 1_000_000}jt`
                    : v >= 1000
                      ? `${v / 1000}rb`
                      : String(v)
                }
              />
              <Tooltip
                cursor={{ fill: "var(--accent)" }}
                contentStyle={{
                  borderRadius: 12,
                  border: "1px solid var(--border)",
                  fontSize: 12,
                }}
                formatter={(value) => [formatRupiah(Number(value)), "Pendapatan"]}
              />
              <Bar
                dataKey="revenue"
                fill="var(--primary)"
                radius={[8, 8, 0, 0]}
                maxBarSize={48}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
