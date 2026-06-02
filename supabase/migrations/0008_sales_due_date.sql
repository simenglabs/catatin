-- Payment due date for a sale. Optional — only meaningful for unpaid (DP /
-- Belum Lunas) transactions; Lunas sales need none. Stored as a calendar date.
-- Set both at creation (via the app, right after create_sale) and editable on
-- the sale detail page; the "sales owner all" RLS policy already covers it.

alter table public.sales
  add column if not exists due_date date;
