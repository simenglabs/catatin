-- Grant DML on the public schema to the API roles.
--
-- After 0001 was applied, anon/authenticated/service_role had only the default
-- PUBLIC privileges (REFERENCES, TRIGGER, TRUNCATE) and could not read or write
-- any table, breaking every data path. This restores the standard Supabase
-- grants. RLS still gates anon/authenticated; service_role bypasses RLS by
-- design (see lib/db/scoped.ts, which enforces workspace_id in code instead).

grant usage on schema public to anon, authenticated, service_role;

grant select, insert, update, delete on all tables in schema public
  to anon, authenticated, service_role;
grant usage, select on all sequences in schema public
  to anon, authenticated, service_role;
grant execute on all functions in schema public
  to anon, authenticated, service_role;

-- Same grants for objects created in the future.
alter default privileges in schema public
  grant select, insert, update, delete on tables to anon, authenticated, service_role;
alter default privileges in schema public
  grant usage, select on sequences to anon, authenticated, service_role;
alter default privileges in schema public
  grant execute on functions to anon, authenticated, service_role;
