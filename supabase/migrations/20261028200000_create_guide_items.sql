begin;

create table public.guide_items (
  id uuid primary key default gen_random_uuid(),
  guide_id uuid not null references public.guides(id) on delete cascade,
  shop_link_id uuid references public.shop_links(id) on delete restrict,
  coupon_id uuid references public.coupons(id) on delete cascade,
  sort_order integer not null check (sort_order >= 0),
  comment text not null check (btrim(comment) <> ''),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (num_nonnulls(shop_link_id, coupon_id) = 1),
  unique (guide_id, shop_link_id),
  unique (guide_id, coupon_id)
);

create index guide_items_shop_link_id_idx on public.guide_items (shop_link_id);
create index guide_items_coupon_id_idx on public.guide_items (coupon_id);

create trigger set_guide_items_updated_at
  before update on public.guide_items
  for each row execute function public.update_updated_at_column();

grant select on public.guide_items to anon;
grant select, insert, update, delete on public.guide_items to authenticated;
grant select, insert, update, delete on public.guide_items to service_role;

alter table public.guide_items enable row level security;

create policy "Public can read items of published guides"
  on public.guide_items for select
  to anon, authenticated
  using (
    exists (
      select 1
      from public.guides g
      where g.id = guide_items.guide_id
        and g.is_published = true
    )
  );

create policy "Admin can manage guide items"
  on public.guide_items for all
  to authenticated
  using ((select auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
  with check ((select auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

commit;