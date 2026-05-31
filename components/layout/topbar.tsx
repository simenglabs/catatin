"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, Plus } from "lucide-react";

import { Logo } from "@/components/brand";
import { NavLinks } from "./nav-links";
import { UserMenu } from "./user-menu";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

export function Topbar({
  workspaceId,
  companyName,
  email,
  fullName,
}: {
  workspaceId: string;
  companyName: string;
  email: string;
  fullName: string | null;
}) {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-3 border-b bg-background/80 px-4 backdrop-blur lg:px-8">
      <div className="flex items-center gap-3">
        {/* Mobile nav trigger */}
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild className="lg:hidden">
            <Button variant="ghost" size="icon" aria-label="Buka menu">
              <Menu className="size-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-72 p-0">
            <SheetHeader className="border-b">
              <SheetTitle asChild>
                <div>
                  <Logo />
                </div>
              </SheetTitle>
            </SheetHeader>
            <div className="flex flex-col gap-4 p-4">
              <NavLinks
                workspaceId={workspaceId}
                onNavigate={() => setOpen(false)}
              />
              <Button asChild onClick={() => setOpen(false)}>
                <Link href={`/dashboard/${workspaceId}/sales/new`}>
                  <Plus className="size-4" />
                  Buat Penjualan
                </Link>
              </Button>
            </div>
          </SheetContent>
        </Sheet>

        <div className="lg:hidden">
          <Logo withText={false} />
        </div>
        <div className="hidden flex-col leading-tight lg:flex">
          <span className="text-xs text-muted-foreground">Workspace</span>
          <span className="text-sm font-semibold">{companyName}</span>
        </div>
      </div>

      <UserMenu email={email} fullName={fullName} />
    </header>
  );
}
