import type { LucideIcon } from "lucide-react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type Tone = "default" | "emerald" | "amber" | "blue";

const TONES: Record<Tone, { icon: string; value: string }> = {
  default: { icon: "bg-primary/10 text-primary", value: "" },
  emerald: { icon: "bg-emerald-100 text-emerald-600", value: "text-emerald-600" },
  amber: { icon: "bg-amber-100 text-amber-600", value: "text-amber-600" },
  blue: { icon: "bg-blue-100 text-blue-600", value: "text-blue-600" },
};

export function MetricCard({
  label,
  value,
  hint,
  icon: Icon,
  highlight = false,
  tone = "default",
}: {
  label: string;
  value: string;
  hint?: string;
  icon: LucideIcon;
  highlight?: boolean;
  tone?: Tone;
}) {
  const t = TONES[tone];
  return (
    <Card
      className={cn(
        "gap-3 p-5",
        highlight &&
          "border-transparent bg-gradient-to-br from-primary to-violet-500 text-primary-foreground shadow-md"
      )}
    >
      <div className="flex items-start justify-between">
        <span
          className={cn(
            "text-sm font-medium",
            highlight ? "text-primary-foreground/80" : "text-muted-foreground"
          )}
        >
          {label}
        </span>
        <span
          className={cn(
            "flex size-9 items-center justify-center rounded-full",
            highlight ? "bg-white/20" : t.icon
          )}
        >
          <Icon className="size-4.5" />
        </span>
      </div>
      <p
        className={cn(
          "text-2xl font-bold tracking-tight",
          !highlight && t.value
        )}
      >
        {value}
      </p>
      {hint && (
        <p
          className={cn(
            "text-xs",
            highlight ? "text-primary-foreground/70" : "text-muted-foreground"
          )}
        >
          {hint}
        </p>
      )}
    </Card>
  );
}
