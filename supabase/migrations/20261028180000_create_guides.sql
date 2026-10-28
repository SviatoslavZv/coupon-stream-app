begin;

create table public.guides (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique
    check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  title text not null check (btrim(title) <> ''),
  intro text not null check (btrim(intro) <> ''),
  meta_description text,
  category text,
  gender text,
  event_slug text,
  is_published boolean not null default false,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (is_published = false or published_at is not null)
);

create trigger set_guides_updated_at
  before update on public.guides
  for each row execute function public.update_updated_at_column();

grant select on public.guides to anon;
grant select, insert, update, delete on public.guides to authenticated;
grant select, insert, update, delete on public.guides to service_role;

alter table public.guides enable row level security;

create policy "Public can read published guides"
  on public.guides for select
  to anon, authenticated
  using (is_published = true);

create policy "Admin can manage guides"
  on public.guides for all
  to authenticated
  using ((select auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
  with check ((select auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

commit;