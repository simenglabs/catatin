"use client";

import {
  PolarAngleAxis,
  RadialBar,
  RadialBarChart,
  ResponsiveContainer,
} from "recharts";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export function GrowthGauge({
  growthPercent,
  thisMonthLabel,
  lastMonthLabel,
}: {
  growthPercent: number;
  thisMonthLabel: string;
  lastMonthLabel: string;
}) {
  // Map growth (-100..+100+) onto a 0..100 gauge fill for display.
  const fill = Math.max(0, Math.min(100, 50 + growthPercent / 2));
  const positive = growthPercent >= 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Pertumbuhan Penjualan</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="relative mx-auto h-48 w-full max-w-xs">
          <ResponsiveContainer width="100%" height="100%">
            <RadialBarChart
              innerRadius="78%"
              outerRadius="100%"
              data={[{ value: fill }]}
              startAngle={180}
              endAngle={0}
            >
              <PolarAngleAxis
                type="number"
                domain={[0, 100]}
                tick={false}
                axisLine={false}
              />
              <RadialBar
                dataKey="value"
                cornerRadius={12}
                fill="var(--primary)"
                background={{ fill: "var(--secondary)" }}
              />
            </RadialBarChart>
          </ResponsiveContainer>
          <div className="absolute inset-x-0 bottom-4 flex flex-col items-center">
            <span
              className={cn(
                "text-3xl font-bold",
                positive ? "text-emerald-600" : "text-red-500"
              )}
            >
              {positive ? "+" : ""}
              {growthPercent.toFixed(1)}%
            </span>
            <span className="text-xs text-muted-foreground">
              vs bulan lalu
            </span>
          </div>
        </div>
        <div className="mt-2 flex justify-center gap-6 text-center text-xs text-muted-foreground">
          <span>{lastMonthLabel}</span>
          <span className="font-medium text-foreground">{thisMonthLabel}</span>
        </div>
      </CardContent>
    </Card>
  );
}
