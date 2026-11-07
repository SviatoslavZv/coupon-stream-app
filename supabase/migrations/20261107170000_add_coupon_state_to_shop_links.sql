begin;

alter table public.shop_links
  add column coupon_percent numeric(5,2)
    check (coupon_percent > 0 and coupon_percent < 100);

create unique index shop_links_store_asin_key
  on public.shop_links (store_id, asin)
  where asin is not null;

grant select (coupon_percent) on public.shop_links to anon;

commit;