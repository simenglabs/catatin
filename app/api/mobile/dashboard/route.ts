import { NextRequest, NextResponse } from "next/server";
import { getMobileAuth, err } from "@/lib/mobile-auth";

/** GET /api/mobile/dashboard — pre-computed metrics for the dashboard screen */
export async function GET(req: NextRequest) {
  const auth = await getMobileAuth(req);
  if (!auth.ok) return auth.response;

  const wsId = auth.workspace.id;

  // Fetch all sales
  const { data: salesData, error: salesError } = await auth.db.admin
    .from("sales")
    .select("id, total_amount, status, is_delivered, due_date, created_at, invoice_number, customer_name, customer_id, workspace_id")
    .eq("workspace_id", wsId)
    .order("created_at", { ascending: false });

  if (salesError) return err(salesError.message);
  const sales = salesData ?? [];

  // Fetch all payments for those sales
  const saleIds = sales.map((s: { id: string }) => s.id);
  let payments: Array<{ sale_id: string; amount_paid: number; payment_date: string }> = [];
  if (saleIds.length > 0) {
    const { data: paymentsData } = await auth.db.admin
      .from("payment_history")
      .select("sale_id, amount_paid, payment_date")
      .in("sale_id", saleIds);
    payments = paymentsData ?? [];
  }

  const now = new Date();
  const startOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

  let totalRevenue = 0;
  let thisMonthRevenue = 0;
  let lastMonthRevenue = 0;

  // Monthly cash map — last 6 months
  const monthlyMap: Record<string, number> = {};
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    monthlyMap[`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`] = 0;
  }

  for (const p of payments) {
    const amt = Number(p.amount_paid);
    totalRevenue += amt;
    const pd = new Date(p.payment_date);
    const key = `${pd.getFullYear()}-${String(pd.getMonth() + 1).padStart(2, "0")}`;
    if (key in monthlyMap) monthlyMap[key] += amt;
    if (pd >= startOfThisMonth) thisMonthRevenue += amt;
    else if (pd >= startOfLastMonth) lastMonthRevenue += amt;
  }

  const monthlyCash = Object.entries(monthlyMap).map(([key, amount]) => {
    const [year, month] = key.split("-");
    return { month: `${year}-${month}-01`, amount };
  });

  // Due reminders: unpaid with due_date ≤ today + 7 days
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const in7 = new Date(today);
  in7.setDate(in7.getDate() + 7);

  const dueSales = sales
    .filter((s: { status: string; due_date: string | null }) => {
      if (s.status === "Lunas") return false;
      if (!s.due_date) return false;
      return new Date(s.due_date) <= in7;
    })
    .sort((a: { due_date: string }, b: { due_date: string }) =>
      new Date(a.due_date).getTime() - new Date(b.due_date).getTime()
    );

  return NextResponse.json({
    total_revenue: totalRevenue,
    this_month_revenue: thisMonthRevenue,
    last_month_revenue: lastMonthRevenue,
    total_sales: sales.length,
    lunas_sales: sales.filter((s: { status: string }) => s.status === "Lunas").length,
    dp_sales: sales.filter((s: { status: string }) => s.status === "DP").length,
    belum_lunas_sales: sales.filter((s: { status: string }) => s.status === "Belum Lunas").length,
    monthly_cash: monthlyCash,
    due_sales: dueSales,
  });
}
