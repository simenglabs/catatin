import { getScopedDb } from "@/lib/db/scoped";
import { PageHeader } from "@/components/layout/page-header";
import { SettingsForm } from "./settings-form";

export default async function SettingsPage({
  params,
}: {
  params: Promise<{ workspace_id: string }>;
}) {
  const { workspace_id } = await params;
  const db = await getScopedDb(workspace_id);

  return (
    <>
      <PageHeader
        title="Pengaturan Invoice"
        description="Sesuaikan logo, template, warna, dan detail usaha pada invoice."
      />
      <SettingsForm workspace={db.workspace} />
    </>
  );
}
