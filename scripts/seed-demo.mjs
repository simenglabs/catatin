// Seeds a demo account: auth user + workspace + sample products.
// Idempotent — deleting the auth user cascades the workspace and its products,
// so re-running gives a clean demo. No sales/payment data is created.
//
//   node --env-file=.env.local scripts/seed-demo.mjs
//
// Requires SUPABASE_SERVICE_ROLE_KEY (service-role bypasses RLS for seeding).

import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceKey) {
  console.error(
    "Missing env. Run with: node --env-file=.env.local scripts/seed-demo.mjs"
  );
  process.exit(1);
}

const DEMO = {
  email: "demo@catatin.app",
  password: "demodemo123",
  fullName: "Akun Demo",
  company: "Toko Demo Catatin",
};

const PRODUCTS = [
  { name: "Kopi Arabika 250g", price: 85000, stock: 120 },
  { name: "Teh Hijau Premium 100g", price: 45000, stock: 80 },
  { name: "Gula Aren Cair 500ml", price: 32000, stock: 60 },
  { name: "Susu Kental Manis 370g", price: 18500, stock: 200 },
  { name: "Cangkir Keramik", price: 55000, stock: 40 },
];

const admin = createClient(url, serviceKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

async function findUserByEmail(email) {
  for (let page = 1; page <= 20; page++) {
    const { data, error } = await admin.auth.admin.listUsers({
      page,
      perPage: 200,
    });
    if (error) throw error;
    const hit = data.users.find((u) => u.email === email);
    if (hit) return hit;
    if (data.users.length < 200) break; // last page
  }
  return null;
}

async function main() {
  // 1. Clean slate — delete existing demo user (cascades workspace + products).
  const existing = await findUserByEmail(DEMO.email);
  if (existing) {
    console.log(`Removing existing demo user ${existing.id} (cascade)…`);
    const { error } = await admin.auth.admin.deleteUser(existing.id);
    if (error) throw error;
  }

  // 2. Create the auth user (email pre-confirmed so it can log in immediately).
  //    The on_auth_user_created trigger inserts the matching profile row.
  const { data: created, error: createErr } =
    await admin.auth.admin.createUser({
      email: DEMO.email,
      password: DEMO.password,
      email_confirm: true,
      user_metadata: { full_name: DEMO.fullName },
    });
  if (createErr) throw createErr;
  const userId = created.user.id;
  console.log(`Created auth user ${userId}`);

  // 3. Workspace (1 user = 1 workspace owner).
  const { data: workspace, error: wsErr } = await admin
    .from("workspaces")
    .insert({ owner_id: userId, company_name: DEMO.company })
    .select("id")
    .single();
  if (wsErr) throw wsErr;
  console.log(`Created workspace ${workspace.id}`);

  // 4. Sample products.
  const { error: prodErr } = await admin
    .from("products")
    .insert(PRODUCTS.map((p) => ({ ...p, workspace_id: workspace.id })));
  if (prodErr) throw prodErr;
  console.log(`Inserted ${PRODUCTS.length} products`);

  console.log("\n✅ Demo account ready");
  console.log("──────────────────────────────");
  console.log(`  Email    : ${DEMO.email}`);
  console.log(`  Password : ${DEMO.password}`);
  console.log(`  Workspace: ${DEMO.company} (${workspace.id})`);
  console.log("  Data     : 5 produk, tanpa sales/payment");
}

main().catch((e) => {
  console.error("Seed failed:", e.message ?? e);
  process.exit(1);
});
