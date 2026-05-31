-- Catatin — initial schema, business logic, and RLS.
-- Multi-tenant: every core table is scoped by workspace_id; a workspace is
-- owned by exactly one user (1 user = 1 workspace owner for this MVP).

-- ───────────────────────────── Types ─────────────────────────────
create type public.sale_status as enum ('DP', 'Belum Lunas', 'Lunas');

-- ──────────────────────────── Tables ─────────────────────────────
create table public.profiles (
  id         uuid primary key references auth.users (id) on delete cascade,
  email      text not null,
  full_name  text,
  created_at timestamptz not null default now()
);

create table public.workspaces (
  id           uuid primary key default gen_random_uuid(),
  owner_id     uuid not null references public.profiles (id) on delete cascade,
  company_name text not null,
  logo_url     text,
  created_at   timestamptz not null default now()
);
-- 1 user = 1 workspace owner.
create unique index workspaces_owner_unique on public.workspaces (owner_id);

create table public.products (
  id           uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces (id) on delete cascade,
  name         text not null,
  price        numeric(14, 2) not null default 0,
  stock        integer not null default 0,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);
create index products_workspace_idx on public.products (workspace_id);

create table public.sales (
  id             uuid primary key default gen_random_uuid(),
  workspace_id   uuid not null references public.workspaces (id) on delete cascade,
  invoice_number text not null,
  customer_name  text not null,
  total_amount   numeric(14, 2) not null default 0,
  status         public.sale_status not null default 'DP',
  is_delivered   boolean not null default false,
  created_at     timestamptz not null default now()
);
create unique index sales_invoice_unique on public.sales (workspace_id, invoice_number);
create index sales_workspace_idx on public.sales (workspace_id);

create table public.sales_items (
  id            uuid primary key default gen_random_uuid(),
  sale_id       uuid not null references public.sales (id) on delete cascade,
  product_id    uuid references public.products (id) on delete set null,
  quantity      integer not null check (quantity > 0),
  price_at_sale numeric(14, 2) not null default 0
);
create index sales_items_sale_idx on public.sales_items (sale_id);

create table public.payment_history (
  id             uuid primary key default gen_random_uuid(),
  sale_id        uuid not null references public.sales (id) on delete cascade,
  amount_paid    numeric(14, 2) not null check (amount_paid > 0),
  payment_date   timestamptz not null default now(),
  payment_method text not null default 'Tunai'
);
create index payment_history_sale_idx on public.payment_history (sale_id);

-- ─────────────────── Auth bootstrap: create profile ───────────────────
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name)
  values (new.id, new.email, new.raw_user_meta_data ->> 'full_name')
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

-- ─────────────── Business logic: recompute sale status ───────────────
-- DP            : payment exists but not delivered and not fully paid
-- Belum Lunas   : delivered but not fully paid
-- Lunas         : sum(payments) >= total_amount
create or replace function public.recalculate_sale_status(p_sale_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_total     numeric;
  v_paid      numeric;
  v_delivered boolean;
begin
  select total_amount, is_delivered into v_total, v_delivered
  from public.sales where id = p_sale_id;
  if not found then return; end if;

  select coalesce(sum(amount_paid), 0) into v_paid
  from public.payment_history where sale_id = p_sale_id;

  update public.sales
  set status = case
        when v_paid >= v_total and v_total > 0 then 'Lunas'::public.sale_status
        when v_delivered                       then 'Belum Lunas'::public.sale_status
        else 'DP'::public.sale_status
      end
  where id = p_sale_id;
end;
$$;

create or replace function public.trg_payment_recalc()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  perform public.recalculate_sale_status(coalesce(new.sale_id, old.sale_id));
  return null;
end;
$$;

create trigger payment_recalc
after insert or update or delete on public.payment_history
for each row execute function public.trg_payment_recalc();

create or replace function public.trg_sale_delivered_recalc()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.is_delivered is distinct from old.is_delivered then
    perform public.recalculate_sale_status(new.id);
  end if;
  return null;
end;
$$;

create trigger sale_delivered_recalc
after update of is_delivered on public.sales
for each row execute function public.trg_sale_delivered_recalc();

-- ─────────────── Atomic sale creation (stock + invoice + payment) ───────────────
create or replace function public.create_sale(
  p_workspace_id   uuid,
  p_customer_name  text,
  p_items          jsonb,
  p_initial_payment numeric,
  p_payment_method text,
  p_is_delivered   boolean
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
  item       jsonb;
  v_product  public.products;
  v_qty      int;
begin
  if v_user is null then raise exception 'Tidak diizinkan'; end if;

  select owner_id into v_owner from public.workspaces where id = p_workspace_id;
  if v_owner is distinct from v_user then raise exception 'Tidak diizinkan'; end if;

  -- Invoice number INV-YYYYMM-NNNN, sequential within the workspace+month.
  select count(*) + 1 into v_seq
  from public.sales
  where workspace_id = p_workspace_id
    and date_trunc('month', created_at) = date_trunc('month', now());
  v_invoice := 'INV-' || to_char(now(), 'YYYYMM') || '-' || lpad(v_seq::text, 4, '0');

  insert into public.sales (workspace_id, invoice_number, customer_name, total_amount, status, is_delivered)
  values (p_workspace_id, v_invoice, p_customer_name, 0, 'DP', coalesce(p_is_delivered, false))
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

-- ──────────────────────────── RLS ────────────────────────────
alter table public.profiles        enable row level security;
alter table public.workspaces      enable row level security;
alter table public.products        enable row level security;
alter table public.sales           enable row level security;
alter table public.sales_items     enable row level security;
alter table public.payment_history enable row level security;

create policy "profiles self select" on public.profiles
  for select using (id = auth.uid());
create policy "profiles self update" on public.profiles
  for update using (id = auth.uid());
create policy "profiles self insert" on public.profiles
  for insert with check (id = auth.uid());

create policy "workspaces owner all" on public.workspaces
  for all using (owner_id = auth.uid()) with check (owner_id = auth.uid());

create policy "products owner all" on public.products
  for all using (
    exists (select 1 from public.workspaces w
            where w.id = products.workspace_id and w.owner_id = auth.uid())
  ) with check (
    exists (select 1 from public.workspaces w
            where w.id = products.workspace_id and w.owner_id = auth.uid())
  );

create policy "sales owner all" on public.sales
  for all using (
    exists (select 1 from public.workspaces w
            where w.id = sales.workspace_id and w.owner_id = auth.uid())
  ) with check (
    exists (select 1 from public.workspaces w
            where w.id = sales.workspace_id and w.owner_id = auth.uid())
  );

create policy "sales_items owner all" on public.sales_items
  for all using (
    exists (select 1 from public.sales s
            join public.workspaces w on w.id = s.workspace_id
            where s.id = sales_items.sale_id and w.owner_id = auth.uid())
  ) with check (
    exists (select 1 from public.sales s
            join public.workspaces w on w.id = s.workspace_id
            where s.id = sales_items.sale_id and w.owner_id = auth.uid())
  );

create policy "payment owner all" on public.payment_history
  for all using (
    exists (select 1 from public.sales s
            join public.workspaces w on w.id = s.workspace_id
            where s.id = payment_history.sale_id and w.owner_id = auth.uid())
  ) with check (
    exists (select 1 from public.sales s
            join public.workspaces w on w.id = s.workspace_id
            where s.id = payment_history.sale_id and w.owner_id = auth.uid())
  );

-- ──────────────────────── Storage: logos bucket ────────────────────────
insert into storage.buckets (id, name, public)
values ('logos', 'logos', true)
on conflict (id) do nothing;

create policy "logos public read" on storage.objects
  for select using (bucket_id = 'logos');
create policy "logos owner insert" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'logos' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "logos owner update" on storage.objects
  for update to authenticated
  using (bucket_id = 'logos' and (storage.foldername(name))[1] = auth.uid()::text);
