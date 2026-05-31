import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Workspace } from "@/lib/types";

/** Returns the authenticated user or redirects to /login. */
export async function requireUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  return { supabase, user };
}

/**
 * Resolves the workspace for the given id, verifying it is owned by the
 * current user. Redirects to /login, /onboarding, or the user's own
 * workspace when the id is missing/foreign.
 */
export async function requireWorkspace(workspaceId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: workspace } = await supabase
    .from("workspaces")
    .select("*")
    .eq("id", workspaceId)
    .eq("owner_id", user.id)
    .maybeSingle();

  if (!workspace) {
    // Maybe they own a different workspace — send them there; otherwise onboard.
    const { data: own } = await supabase
      .from("workspaces")
      .select("id")
      .eq("owner_id", user.id)
      .maybeSingle();
    if (own) redirect(`/dashboard/${own.id}`);
    redirect("/onboarding");
  }

  return { supabase, user, workspace: workspace as Workspace };
}
