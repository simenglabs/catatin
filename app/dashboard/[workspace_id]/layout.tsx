import { requireWorkspace } from "@/lib/workspace";
import { Sidebar } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";

export default async function DashboardLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ workspace_id: string }>;
}) {
  const { workspace_id } = await params;
  const { user, workspace } = await requireWorkspace(workspace_id);

  return (
    <div className="flex min-h-dvh flex-1">
      <Sidebar workspaceId={workspace.id} />
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar
          workspaceId={workspace.id}
          companyName={workspace.company_name}
          email={user.email ?? ""}
          fullName={user.user_metadata?.full_name ?? null}
        />
        <main className="flex-1 px-4 py-6 lg:px-8 lg:py-8">
          <div className="page-enter mx-auto w-full max-w-7xl">{children}</div>
        </main>
      </div>
    </div>
  );
}
