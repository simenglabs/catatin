import { getScopedDb } from "@/lib/db/scoped";
import { PageHeader } from "@/components/layout/page-header";
import { ProductsClient } from "@/components/products/products-client";
import type { Product } from "@/lib/types";

export default async function ProductsPage({
  params,
}: {
  params: Promise<{ workspace_id: string }>;
}) {
  const { workspace_id } = await params;
  const db = await getScopedDb(workspace_id);

  const { data: products } = await db
    .select("products")
    .order("created_at", { ascending: false });

  return (
    <>
      <PageHeader
        title="Produk"
        description="Kelola daftar produk dan stok Anda."
      />
      <ProductsClient
        workspaceId={db.workspace.id}
        products={(products ?? []) as unknown as Product[]}
      />
    </>
  );
}
