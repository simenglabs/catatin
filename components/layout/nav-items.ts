import { LayoutDashboard, Package, Settings, ShoppingCart, type LucideIcon } from "lucide-react";

export interface NavItem {
  label: string;
  icon: LucideIcon;
  /** Path segment appended to /dashboard/[workspace_id]. Empty = overview. */
  segment: string;
}

export const NAV_ITEMS: NavItem[] = [
  { label: "Dashboard", icon: LayoutDashboard, segment: "" },
  { label: "Penjualan", icon: ShoppingCart, segment: "sales" },
  { label: "Produk", icon: Package, segment: "products" },
  { label: "Pengaturan", icon: Settings, segment: "settings" },
];

export function hrefFor(workspaceId: string, segment: string) {
  return segment
    ? `/dashboard/${workspaceId}/${segment}`
    : `/dashboard/${workspaceId}`;
}
