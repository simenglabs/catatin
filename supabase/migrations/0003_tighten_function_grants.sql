-- Tighten function EXECUTE grants widened by 0002.
--
-- 0002 ran `grant execute on all functions ... to anon, authenticated`, which
-- also exposed internal/trigger SECURITY DEFINER functions over the REST API
-- (/rest/v1/rpc/...). Trigger functions never need direct EXECUTE — they fire
-- as the table owner — and the recalc helper is only ever called from inside
-- create_sale (itself SECURITY DEFINER, so it runs regardless of caller grants).
--
-- create_sale stays callable by `authenticated` (the app invokes it with the
-- user's session) but is revoked from `anon`; it self-authorizes via auth.uid()
-- anyway, so anon was already rejected at runtime.

revoke execute on function public.handle_new_user() from anon, authenticated;
revoke execute on function public.recalculate_sale_status(uuid) from anon, authenticated;
revoke execute on function public.trg_payment_recalc() from anon, authenticated;
revoke execute on function public.trg_sale_delivered_recalc() from anon, authenticated;
revoke execute on function public.create_sale(uuid, text, jsonb, numeric, text, boolean) from anon;
