import { getScopedDb } from "@/lib/db/scoped";
import { PageHeader } from "@/components/layout/page-header";
import { CustomersClient } from "@/components/customers/customers-client";
import type { Customer } from "@/lib/types";

export default async function CustomersPage({
  params,
}: {
  params: Promise<{ workspace_id: string }>;
}) {
  const { workspace_id } = await params;
  const db = await getScopedDb(workspace_id);

  const { data: customers } = await db
    .select("customers")
    .order("name", { ascending: true });

  return (
    <>
      <PageHeader
        title="Pelanggan"
        description="Kelola daftar pelanggan dan kontak Anda."
      />
      <CustomersClient
        workspaceId={db.workspace.id}
        customers={(customers ?? []) as unknown as Customer[]}
      />
    </>
  );
}
