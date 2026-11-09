-- supabase/migrations/20261109200000_grant_stores_to_service_role.sql
-- Cron-перепроверке (секретный ключ, роль service_role) нужно читать stores, чтобы найти магазин Amazon.

begin;

grant select on public.stores to service_role;

commit;