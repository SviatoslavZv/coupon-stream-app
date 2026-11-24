-- Brands move from lib/constants/taxonomy.ts into the database,
-- so a new brand can be added from the admin without a code change.
-- coupons.brand and shop_links.brand keep storing the brand label;
-- a foreign key on the label makes sure only known brands are saved.

begin;

create table public.brands (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  label text not null unique check (btrim(label) <> ''),
  created_at timestamptz not null default now()
);

grant select (id, slug, label) on public.brands to anon;
grant select, insert, update, delete on public.brands to authenticated;
grant select, insert, update, delete on public.brands to service_role;

alter table public.brands enable row level security;

create policy "Public can read brands"
  on public.brands for select
  to anon, authenticated
  using (true);

create policy "Admin can manage brands"
  on public.brands for all
  to authenticated
  using ((select auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
  with check ((select auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

-- The 138 brands from lib/constants/taxonomy.ts, plus Khombu
insert into public.brands (slug, label) values
  ('nike', 'Nike'),
  ('adidas', 'Adidas'),
  ('new-balance', 'New Balance'),
  ('skechers', 'Skechers'),
  ('converse', 'Converse'),
  ('vans', 'Vans'),
  ('puma', 'Puma'),
  ('under-armour', 'Under Armour'),
  ('reebok', 'Reebok'),
  ('levis', 'Levi''s'),
  ('calvin-klein', 'Calvin Klein'),
  ('tommy-hilfiger', 'Tommy Hilfiger'),
  ('ralph-lauren', 'Ralph Lauren'),
  ('the-north-face', 'The North Face'),
  ('champion', 'Champion'),
  ('columbia', 'Columbia'),
  ('coach', 'Coach'),
  ('michael-kors', 'Michael Kors'),
  ('kate-spade', 'Kate Spade'),
  ('fossil', 'Fossil'),
  ('guess', 'Guess'),
  ('hm', 'H&M'),
  ('mango', 'Mango'),
  ('dockers', 'Dockers'),
  ('steve-madden', 'Steve Madden'),
  ('timberland', 'Timberland'),
  ('crocs', 'Crocs'),
  ('ugg', 'UGG'),
  ('amazfit', 'Amazfit'),
  ('vionic', 'Vionic'),
  ('birkenstock', 'Birkenstock'),
  ('carolina-herrera', 'Carolina Herrera'),
  ('brixton', 'Brixton'),
  ('giuseppe-zanotti', 'Giuseppe Zanotti'),
  ('rowe-and-taylor', 'Rowe and Taylor'),
  ('bloomingdales', 'Bloomingdale''s'),
  ('tory-burch', 'Tory Burch'),
  ('maceoo', 'Maceoo'),
  ('vy-jewelry', 'VY Jewelry'),
  ('oakley', 'Oakley'),
  ('ray-ban', 'Ray-Ban'),
  ('costa-del-mar', 'Costa Del Mar'),
  ('tucci', 'TUCCI'),
  ('bvlgari', 'Bvlgari'),
  ('lancome', 'Lancôme'),
  ('sachin-and-babi', 'Sachin and Babi'),
  ('dream-pairs', 'Dream Pairs'),
  ('nortiv-8', 'Nortiv 8'),
  ('bruno-marc', 'Bruno Marc'),
  ('coofandy', 'Coofandy'),
  ('kxkshop', 'KXKshop'),
  ('crazy-shirts', 'Crazy Shirts'),
  ('ecko-unltd', 'Ecko Unltd'),
  ('musinsa', 'Musinsa'),
  ('dancewear-solutions', 'Dancewear Solutions'),
  ('marathon-watch', 'Marathon Watch'),
  ('belle-fare', 'Belle Fare'),
  ('citizen', 'Citizen'),
  ('gevril', 'Gevril'),
  ('hamilton', 'Hamilton'),
  ('mido', 'Mido'),
  ('tissot', 'Tissot'),
  ('zodiac', 'Zodiac'),
  ('certina', 'Certina'),
  ('ball', 'Ball'),
  ('longines', 'Longines'),
  ('dansko', 'Dansko'),
  ('ecco', 'Ecco'),
  ('abeo', 'ABEO'),
  ('clarks', 'Clarks'),
  ('mbt', 'MBT'),
  ('aetrex', 'Aetrex'),
  ('beautifeel', 'Beautifeel'),
  ('born', 'Born'),
  ('earth', 'Earth'),
  ('keen', 'Keen'),
  ('mephisto', 'Mephisto'),
  ('naot', 'Naot'),
  ('pikolinos', 'Pikolinos'),
  ('sanita', 'Sanita'),
  ('sofft', 'Sofft'),
  ('taos', 'Taos'),
  ('teva', 'Teva'),
  ('merrell', 'Merrell'),
  ('rieker', 'Rieker'),
  ('propet', 'Propet'),
  ('walking-cradles', 'Walking Cradles'),
  ('brooks', 'Brooks'),
  ('jordan', 'Jordan'),
  ('asics', 'Asics'),
  ('hoka', 'Hoka'),
  ('saucony', 'Saucony'),
  ('dr-martens', 'Dr. Martens'),
  ('sperry', 'Sperry'),
  ('sam-edelman', 'Sam Edelman'),
  ('toms', 'TOMS'),
  ('sorel', 'Sorel'),
  ('naturalizer', 'Naturalizer'),
  ('lifestride', 'LifeStride'),
  ('dr-scholls', 'Dr. Scholl''s'),
  ('franco-sarto', 'Franco Sarto'),
  ('badgley-mishka', 'American Glamour By Badgley Mishka'),
  ('sam-and-libby', 'Sam and Libby'),
  ('aerosoles', 'Aerosoles'),
  ('eurosoft', 'Eurosoft'),
  ('ryka', 'Rykä'),
  ('madden-girl', 'Madden Girl'),
  ('cole-haan', 'Cole Haan'),
  ('blowfish-malibu', 'Blowfish Malibu'),
  ('mia', 'MIA'),
  ('frye-and-co', 'Frye and Co.'),
  ('nunn-bush', 'Nunn Bush'),
  ('boc', 'b.o.c'),
  ('taxi', 'Taxi'),
  ('stacy-adams', 'Stacy Adams'),
  ('florsheim', 'Florsheim'),
  ('k-swiss', 'K-Swiss'),
  ('coconuts', 'Coconuts'),
  ('bcbg', 'BCBG'),
  ('reef', 'REEF'),
  ('dv-dolce-vita', 'DV Dolce Vita'),
  ('on-running', 'On'),
  ('gucci', 'Gucci'),
  ('chanel', 'Chanel'),
  ('hermes', 'Hermès'),
  ('rolex', 'Rolex'),
  ('cartier', 'Cartier'),
  ('dior', 'Dior'),
  ('prada', 'Prada'),
  ('valentino', 'Valentino'),
  ('balenciaga', 'Balenciaga'),
  ('saint-laurent', 'Saint Laurent'),
  ('fendi', 'Fendi'),
  ('burberry', 'Burberry'),
  ('patek-philippe', 'Patek Philippe'),
  ('dyson', 'Dyson'),
  ('estee-lauder', 'Estée Lauder'),
  ('all-clad', 'All-Clad'),
  ('khombu', 'Khombu')
on conflict (slug) do nothing;

-- Renaming a brand renames it everywhere; deleting it leaves the field empty
alter table public.coupons
  add constraint coupons_brand_fkey
  foreign key (brand) references public.brands (label)
  on update cascade on delete set null;

alter table public.shop_links
  add constraint shop_links_brand_fkey
  foreign key (brand) references public.brands (label)
  on update cascade on delete set null;

-- Brand pages filter coupons by brand; the keys above also look these columns up
create index if not exists coupons_brand_idx on public.coupons (brand);
create index if not exists shop_links_brand_idx on public.shop_links (brand);

commit;
