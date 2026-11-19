-- Nightly cleanup of coupons that expired more than 60 days ago.
-- The function and the cron job were created in the dashboard; this file puts them in the repository
-- and closes two gaps: a fixed search_path and no direct calls from the API.
-- The cron job itself already exists: cleanup-old-expired-coupons, '0 3 * * *', select delete_old_expired_coupons()
begin;

create or replace function public.delete_old_expired_coupons()
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  delete from public.coupons
  where expires_at is not null
    and expires_at < now() - interval '60 days';
end;
$$;

-- Only the cron job (role postgres) may run it, not visitors through the API
revoke execute on function public.delete_old_expired_coupons() from public, anon, authenticated;

commit;