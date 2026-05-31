import Link from "next/link";
import { Plus } from "lucide-react";
import { Logo } from "@/components/brand";
import { NavLinks } from "./nav-links";
import { Button } from "@/components/ui/button";

export function Sidebar({ workspaceId }: { workspaceId: string }) {
  return (
    <aside className="hidden w-64 shrink-0 flex-col border-r bg-sidebar px-4 py-6 lg:flex">
      <div className="px-2">
        <Logo />
      </div>
      <div className="mt-8 flex-1">
        <NavLinks workspaceId={workspaceId} />
      </div>
      <Button asChild className="mt-4 w-full">
        <Link href={`/dashboard/${workspaceId}/sales/new`}>
          <Plus className="size-4" />
          Buat Penjualan
        </Link>
      </Button>
    </aside>
  );
}
