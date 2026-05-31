import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { SaleStatus } from "@/lib/types";

const STYLES: Record<SaleStatus, string> = {
  DP: "border-amber-200 bg-amber-50 text-amber-700",
  "Belum Lunas": "border-blue-200 bg-blue-50 text-blue-700",
  Lunas: "border-emerald-200 bg-emerald-50 text-emerald-700",
};

export function StatusBadge({
  status,
  className,
}: {
  status: SaleStatus;
  className?: string;
}) {
  return (
    <Badge
      variant="outline"
      className={cn("font-medium", STYLES[status], className)}
    >
      {status}
    </Badge>
  );
}
