import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { getScopedDb } from "@/lib/db/scoped";
import { PageHeader } from "@/components/layout/page-header";
import { SaleForm } from "@/components/sales/sale-form";
import { Button } from "@/components/ui/button";
import type { Product } from "@/lib/types";

export default async function NewSalePage({
  params,
}: {
  params: Promise<{ workspace_id: string }>;
}) {
  const { workspace_id } = await params;
  const db = await getScopedDb(workspace_id);
  const workspace = db.workspace;

  const { data: products } = await db.select("products", "*").order("name");

  return (
    <>
      <Button asChild variant="ghost" size="sm" className="mb-2 -ml-2">
        <Link href={`/dashboard/${workspace.id}/sales`}>
          <ArrowLeft className="size-4" />
          Kembali
        </Link>
      </Button>
      <PageHeader
        title="Buat Penjualan"
        description="Pilih produk, masukkan pelanggan, dan catat pembayaran awal."
      />
      <SaleForm
        workspaceId={workspace.id}
        products={(products ?? []) as unknown as Product[]}
      />
    </>
  );
}
