-- supabase/migrations/20261109120000_skip_updated_at_on_click.sql
-- Клик по купону не должен менять updated_at: на нём строится lastmod в sitemap.

begin;

drop trigger set_coupons_updated_at on public.coupons;

create trigger set_coupons_updated_at
  before update on public.coupons
  for each row
  when (
    (to_jsonb(old) - 'click_count' - 'updated_at')
    is distinct from
    (to_jsonb(new) - 'click_count' - 'updated_at')
  )
  execute function public.update_updated_at_column();

create or replace function public.increment_coupon_click(coupon_id_input uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  update public.coupons
  set click_count = click_count + 1
  where id = coupon_id_input;
end;
$$;

commit;