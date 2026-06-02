import { redirect } from "next/navigation";
import type { SupabaseClient } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import type { Workspace } from "@/lib/types";

/**
 * Tables that carry a `workspace_id` column directly. These are the only tables
 * the scoped helpers will filter automatically. Child tables (`sales_items`,
 * `payment_history`) are scoped indirectly through their parent `sale` — use
 * `requireSale()` to obtain a workspace-verified sale id first.
 */
type ScopedTable = "products" | "sales" | "customers";

/**
 * A thin wrapper over the service-role client that bakes the current user's
 * `workspace_id` into every query. Because the service-role key bypasses RLS,
 * this wrapper is what replaces the database's tenant-isolation guarantee:
 * there is no code path here that queries tenant data without the filter.
 */
export class ScopedDb {
  constructor(
    /** Escape hatch — the raw service-role client. Bypasses ALL isolation.
     *  Only use for tables this wrapper does not cover, and always filter by
     *  an id you have already verified belongs to `this.workspace`. */
    readonly admin: SupabaseClient,
    readonly workspace: Workspace
  ) {}

  /** SELECT pre-filtered to this workspace. Chain `.eq('id', x)`, `.single()`… */
  select(table: ScopedTable, columns = "*") {
    return this.admin
      .from(table)
      .select(columns)
      .eq("workspace_id", this.workspace.id);
  }

  /** INSERT with `workspace_id` forced onto every row (caller's value ignored). */
  insert<T extends Record<string, unknown>>(table: ScopedTable, rows: T | T[]) {
    const arr = Array.isArray(rows) ? rows : [rows];
    return this.admin
      .from(table)
      .insert(arr.map((r) => ({ ...r, workspace_id: this.workspace.id })));
  }

  /** UPDATE pre-filtered to this workspace. Chain `.eq('id', x)` to target a row. */
  update(table: ScopedTable, values: Record<string, unknown>) {
    return this.admin
      .from(table)
      .update(values)
      .eq("workspace_id", this.workspace.id);
  }

  /** DELETE pre-filtered to this workspace. Chain `.eq('id', x)` to target a row. */
  delete(table: ScopedTable) {
    return this.admin
      .from(table)
      .delete()
      .eq("workspace_id", this.workspace.id);
  }

  /**
   * Resolves a sale by id and verifies it belongs to this workspace. Use this
   * before touching `sales_items` / `payment_history`, then scope those queries
   * by the returned `sale.id` via `this.admin`.
   */
  async requireSale(saleId: string) {
    const { data, error } = await this.admin
      .from("sales")
      .select("*")
      .eq("id", saleId)
      .eq("workspace_id", this.workspace.id)
      .maybeSingle();
    if (error) throw error;
    return data; // null if not found / not owned — caller decides how to handle
  }
}

/**
 * Authenticates the user via their session cookie (anon client), verifies they
 * own `workspaceId`, and returns a {@link ScopedDb} backed by the service-role
 * client. Redirects to /login or /onboarding when there is no valid session or
 * workspace — mirroring `requireWorkspace()`.
 *
 * The session check uses the anon client (RLS-respecting). Only AFTER ownership
 * is proven do we hand back the privileged, workspace-scoped client.
 */
export async function getScopedDb(workspaceId: string): Promise<ScopedDb> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const admin = createAdminClient();
  const { data: workspace } = await admin
    .from("workspaces")
    .select("*")
    .eq("id", workspaceId)
    .eq("owner_id", user.id)
    .maybeSingle();

  if (!workspace) {
    const { data: own } = await admin
      .from("workspaces")
      .select("id")
      .eq("owner_id", user.id)
      .maybeSingle();
    if (own) redirect(`/dashboard/${own.id}`);
    redirect("/onboarding");
  }

  return new ScopedDb(admin, workspace as Workspace);
}
