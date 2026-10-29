begin;

create table public.shop_links (
  id uuid primary key default gen_random_uuid(),
  store_id uuid not null references public.stores(id) on delete cascade,
  kind text not null check (kind in ('product', 'section')),
  title text not null check (btrim(title) <> ''),
  url text not null check (url ~ '^https://'),
  brand text,
  asin text check (asin ~ '^[A-Z0-9]{10}$'),
  image_url text check (image_url ~ '^https://'),
  network_link_id text,
  commission_rate numeric(5,2) check (commission_rate between 0 and 100),
  is_active boolean not null default true,
  last_checked_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (asin is null or kind = 'product'),
  unique (store_id, network_link_id)
);

create index shop_links_store_id_idx on public.shop_links (store_id);

create trigger set_shop_links_updated_at
  before update on public.shop_links
  for each row execute function public.update_updated_at_column();

grant select (
  id, store_id, kind, title, url, brand, asin,
  image_url, is_active, last_checked_at, updated_at
) on public.shop_links to anon;
grant select, insert, update, delete on public.shop_links to authenticated;
grant select, insert, update, delete on public.shop_links to service_role;

alter table public.shop_links enable row level security;

create policy "Public can read active shop links"
  on public.shop_links for select
  to anon, authenticated
  using (is_active = true);

create policy "Admin can manage shop links"
  on public.shop_links for all
  to authenticated
  using ((select auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
  with check ((select auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

commit;