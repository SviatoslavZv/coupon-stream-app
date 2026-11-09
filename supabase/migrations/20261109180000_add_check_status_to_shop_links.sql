-- supabase/migrations/20261109180000_add_check_status_to_shop_links.sql
-- Результат ежедневной перепроверки товара (шаг 6). is_active остаётся ручным переключателем админа.

begin;

alter table public.shop_links
  add column check_status text
    check (check_status in ('ok', 'out_of_stock', 'no_commission', 'not_found'));

grant select (check_status) on public.shop_links to anon;

commit;