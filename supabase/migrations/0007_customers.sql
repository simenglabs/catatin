-- Customers: a per-workspace contact book. Sales may reference a customer, but
-- also keep a `customer_name` snapshot so historical invoices stay stable even
-- if the customer is later renamed or deleted.

create table public.customers (
  id           uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces (id) on delete cascade,
  name         text not null,
  phone        text,
  description  text,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);
create index customers_workspace_idx on public.customers (workspace_id);

-- Link sales to a customer. ON DELETE SET NULL keeps the sale (and its
-- customer_name snapshot) intact when a customer is removed.
alter table public.sales
  add column if not exists customer_id uuid references public.customers (id) on delete set null;
create index sales_customer_idx on public.sales (customer_id);

-- ──────────────────────────── RLS ────────────────────────────
alter table public.customers enable row level security;

create policy "customers owner all" on public.customers
  for all using (
    exists (select 1 from public.workspaces w
            where w.id = customers.workspace_id and w.owner_id = auth.uid())
  ) with check (
    exists (select 1 from public.workspaces w
            where w.id = customers.workspace_id and w.owner_id = auth.uid())
  );

-- ─────────── Recreate create_sale to accept an optional customer ───────────
-- Adding a parameter changes the signature, so the old function must be dropped
-- and recreated (CREATE OR REPLACE cannot alter the argument list). Grants are
-- re-applied below to preserve the security posture from migrations 0002–0004.
drop function if exists public.create_sale(uuid, text, jsonb, numeric, text, boolean);

create or replace function public.create_sale(
  p_workspace_id    uuid,
  p_customer_id     uuid,
  p_customer_name   text,
  p_items           jsonb,
  p_initial_payment numeric,
  p_payment_method  text,
  p_is_delivered    boolean
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user     uuid := auth.uid();
  v_owner    uuid;
  v_sale_id  uuid;
  v_total    numeric := 0;
  v_invoice  text;
  v_seq      int;
  v_cust_ok  boolean;
  item       jsonb;
  v_product  public.products;
  v_qty      int;
begin
  if v_user is null then raise exception 'Tidak diizinkan'; end if;

  select owner_id into v_owner from public.workspaces where id = p_workspace_id;
  if v_owner is distinct from v_user then raise exception 'Tidak diizinkan'; end if;

  -- If a customer is supplied, it must belong to this workspace.
  if p_customer_id is not null then
    select exists (
      select 1 from public.customers
      where id = p_customer_id and workspace_id = p_workspace_id
    ) into v_cust_ok;
    if not v_cust_ok then raise exception 'Pelanggan tidak ditemukan'; end if;
  end if;

  -- Invoice number INV-YYYYMM-NNNN, sequential within the workspace+month.
  select count(*) + 1 into v_seq
  from public.sales
  where workspace_id = p_workspace_id
    and date_trunc('month', created_at) = date_trunc('month', now());
  v_invoice := 'INV-' || to_char(now(), 'YYYYMM') || '-' || lpad(v_seq::text, 4, '0');

  insert into public.sales (workspace_id, customer_id, invoice_number, customer_name, total_amount, status, is_delivered)
  values (p_workspace_id, p_customer_id, v_invoice, p_customer_name, 0, 'DP', coalesce(p_is_delivered, false))
  returning id into v_sale_id;

  for item in select * from jsonb_array_elements(p_items)
  loop
    v_qty := (item ->> 'quantity')::int;
    select * into v_product from public.products
    where id = (item ->> 'product_id')::uuid and workspace_id = p_workspace_id
    for update;
    if not found then raise exception 'Produk tidak ditemukan'; end if;
    if v_product.stock < v_qty then
      raise exception 'Stok % tidak mencukupi', v_product.name;
    end if;

    insert into public.sales_items (sale_id, product_id, quantity, price_at_sale)
    values (v_sale_id, v_product.id, v_qty, v_product.price);

    -- Reserve/decrement stock at sale creation (DP stage requirement).
    update public.products set stock = stock - v_qty, updated_at = now()
    where id = v_product.id;

    v_total := v_total + v_product.price * v_qty;
  end loop;

  update public.sales set total_amount = v_total where id = v_sale_id;

  if coalesce(p_initial_payment, 0) > 0 then
    insert into public.payment_history (sale_id, amount_paid, payment_method)
    values (v_sale_id, least(p_initial_payment, v_total), coalesce(p_payment_method, 'Tunai'));
  end if;

  perform public.recalculate_sale_status(v_sale_id);
  return v_sale_id;
end;
$$;

-- Re-apply grants for the new signature (mirror of 0002 → 0004 for create_sale):
-- callable only by `authenticated` (the app uses the user's session; the
-- function self-authorizes via auth.uid()) and service_role. Revoke the
-- implicit PUBLIC grant and anon.
revoke execute on function public.create_sale(uuid, uuid, text, jsonb, numeric, text, boolean) from public, anon;
grant execute on function public.create_sale(uuid, uuid, text, jsonb, numeric, text, boolean) to authenticated, service_role;
