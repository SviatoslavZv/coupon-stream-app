begin;

alter table public.coupons
  add column asin text check (asin ~ '^[A-Z0-9]{10}$'),
  add column image_url text check (image_url ~ '^https://');

create index coupons_asin_idx on public.coupons (asin) where asin is not null;

commit;