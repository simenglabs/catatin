-- Revoke the implicit PUBLIC EXECUTE grant on SECURITY DEFINER functions.
--
-- Postgres grants EXECUTE to PUBLIC on every function at creation time, so the
-- per-role revokes in 0003 were not enough — anon/authenticated still inherited
-- EXECUTE through PUBLIC and remained callable via /rest/v1/rpc/...
--
-- After this, the internal/trigger functions are reachable only by service_role
-- (and postgres). create_sale stays callable by `authenticated` — the app
-- invokes it with the user's session and the function self-authorizes via
-- auth.uid() — which is intentional, so its lone "authenticated" advisor remains
-- by design.

revoke execute on function public.handle_new_user() from public;
revoke execute on function public.recalculate_sale_status(uuid) from public;
revoke execute on function public.trg_payment_recalc() from public;
revoke execute on function public.trg_sale_delivered_recalc() from public;
revoke execute on function public.create_sale(uuid, text, jsonb, numeric, text, boolean) from public;
