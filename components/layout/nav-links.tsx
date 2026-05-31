"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAV_ITEMS, hrefFor } from "./nav-items";
import { cn } from "@/lib/utils";

export function NavLinks({
  workspaceId,
  onNavigate,
}: {
  workspaceId: string;
  onNavigate?: () => void;
}) {
  const pathname = usePathname();
  const base = `/dashboard/${workspaceId}`;

  return (
    <nav className="flex flex-col gap-1">
      {NAV_ITEMS.map((item) => {
        const href = hrefFor(workspaceId, item.segment);
        const active =
          item.segment === ""
            ? pathname === base
            : pathname.startsWith(href);
        const Icon = item.icon;
        return (
          <Link
            key={item.label}
            href={href}
            onClick={onNavigate}
            className={cn(
              "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
              active
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
            )}
          >
            <Icon className="size-4.5" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
