import Link from "next/link";
import { AlertTriangle, CalendarClock, CheckCircle2 } from "lucide-react";

import { daysUntil, formatDate, formatRupiah } from "@/lib/format";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export interface DueItem {
  id: string;
  invoice_number: string;
  customer_name: string;
  due_date: string;
  remaining: number;
}

function Row({
  workspaceId,
  item,
  overdue,
}: {
  workspaceId: string;
  item: DueItem;
  overdue: boolean;
}) {
  const diff = daysUntil(item.due_date);
  const label = overdue
    ? `Telat ${Math.abs(diff)} hari`
    : diff === 0
      ? "Jatuh tempo hari ini"
      : `${diff} hari lagi`;

  return (
    <Link
      href={`/dashboard/${workspaceId}/sales/${item.id}`}
      className="flex items-center justify-between gap-3 rounded-lg px-2 py-2.5 transition-colors hover:bg-muted/60"
    >
      <div className="min-w-0">
        <p className="truncate text-sm font-medium">{item.customer_name}</p>
        <p className="truncate text-xs text-muted-foreground">
          {item.invoice_number} · {formatDate(item.due_date)}
        </p>
      </div>
      <div className="shrink-0 text-right">
        <p className="text-sm font-semibold">{formatRupiah(item.remaining)}</p>
        <p
          className={
            overdue
              ? "text-xs font-medium text-red-600"
              : "text-xs text-amber-600"
          }
        >
          {label}
        </p>
      </div>
    </Link>
  );
}

export function DueReminders({
  workspaceId,
  overdue,
  upcoming,
}: {
  workspaceId: string;
  overdue: DueItem[];
  upcoming: DueItem[];
}) {
  const empty = overdue.length === 0 && upcoming.length === 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CalendarClock className="size-4.5 text-muted-foreground" />
          Tagihan Jatuh Tempo
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        {empty ? (
          <div className="flex flex-col items-center gap-2 py-8 text-center text-sm text-muted-foreground">
            <CheckCircle2 className="size-8 text-emerald-500" />
            Tidak ada tagihan yang mendekati atau melewati jatuh tempo.
          </div>
        ) : (
          <>
            {overdue.length > 0 && (
              <div className="space-y-1">
                <p className="flex items-center gap-1.5 px-2 text-xs font-semibold uppercase tracking-wide text-red-600">
                  <AlertTriangle className="size-3.5" />
                  Sudah Jatuh Tempo ({overdue.length})
                </p>
                {overdue.map((item) => (
                  <Row
                    key={item.id}
                    workspaceId={workspaceId}
                    item={item}
                    overdue
                  />
                ))}
              </div>
            )}

            {upcoming.length > 0 && (
              <div className="space-y-1">
                <p className="px-2 text-xs font-semibold uppercase tracking-wide text-amber-600">
                  Akan Jatuh Tempo ({upcoming.length})
                </p>
                {upcoming.map((item) => (
                  <Row
                    key={item.id}
                    workspaceId={workspaceId}
                    item={item}
                    overdue={false}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
