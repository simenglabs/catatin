-- Per-workspace invoice customization: template, accent color, business
-- contact details, footer text, and payment instructions. Stored on the
-- workspace row (1 user = 1 workspace). Table grants from 0002 and the
-- "workspaces owner all" RLS policy already cover these new columns.

alter table public.workspaces
  add column if not exists invoice_template     text not null default 'modern',
  add column if not exists invoice_accent       text not null default '#4f46e5',
  add column if not exists business_address     text,
  add column if not exists business_phone       text,
  add column if not exists business_email       text,
  add column if not exists business_tax_id      text,
  add column if not exists invoice_footer       text,
  add column if not exists payment_instructions text;

alter table public.workspaces
  drop constraint if exists workspaces_invoice_template_check;
alter table public.workspaces
  add constraint workspaces_invoice_template_check
  check (invoice_template in ('modern', 'classic', 'minimal'));
