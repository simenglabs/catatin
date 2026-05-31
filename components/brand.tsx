import { cn } from "@/lib/utils";

/** Custom Catatin mark: a check that rises like a chart — "tercatat & tumbuh". */
function Mark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      <path
        d="M4.5 13.5 8.5 17.5 19.5 6.5"
        stroke="currentColor"
        strokeWidth="2.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="19.5" cy="6.5" r="1.9" fill="currentColor" />
    </svg>
  );
}

export function Logo({
  className,
  withText = true,
  tone = "default",
}: {
  className?: string;
  withText?: boolean;
  /** "light" renders for dark/gradient backgrounds. */
  tone?: "default" | "light";
}) {
  const light = tone === "light";
  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      <span
        className={cn(
          "flex size-9 items-center justify-center rounded-xl shadow-sm",
          light
            ? "bg-white/20 text-white"
            : "bg-gradient-to-br from-primary to-violet-500 text-white shadow-primary/25"
        )}
      >
        <Mark className="size-5" />
      </span>
      {withText && (
        <span
          className={cn(
            "text-lg font-bold tracking-tight",
            light && "text-white"
          )}
        >
          Catatin
        </span>
      )}
    </div>
  );
}
