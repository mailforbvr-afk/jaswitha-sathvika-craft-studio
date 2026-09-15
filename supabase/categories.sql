-- Little Craft Studio: dynamic categories
-- Run this ONCE in the Supabase SQL Editor after schema.sql and storage.sql.
--
-- Safety:
-- - Does NOT delete products.
-- - Does NOT change product names, prices, photos, status, or featured flags.
-- - Copies each product's old category text into category_id, then drops the
--   old text column (the meaning is kept via the foreign key).
-- - Stops with an error instead of continuing if a product cannot be matched.

create extension if not exists "pgcrypto";

create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(trim(name)) > 0),
  slug text not null unique check (char_length(trim(slug)) > 0),
  icon text,
  display_order integer not null default 0,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists categories_active_order_idx
  on public.categories (active, display_order, name);

create index if not exists categories_display_order_idx
  on public.categories (display_order);

create or replace function public.set_categories_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists categories_set_updated_at on public.categories;
create trigger categories_set_updated_at
before update on public.categories
for each row
execute function public.set_categories_updated_at();

insert into public.categories (name, slug, icon, display_order, active)
values
  ('Bracelets', 'bracelets', '📿', 10, true),
  ('Flowers', 'flowers', '🌸', 20, true),
  ('Bouquets', 'bouquets', '💐', 30, true),
  ('Keychains', 'keychains', '🔑', 40, true),
  ('Magnets', 'magnets', '🧲', 50, true),
  ('Other', 'other', '🎨', 60, true)
on conflict (slug) do nothing;

alter table public.categories enable row level security;

drop policy if exists "Public can view active categories" on public.categories;
create policy "Public can view active categories"
on public.categories
for select
to anon
using (active = true);

drop policy if exists "Authenticated can view all categories" on public.categories;
create policy "Authenticated can view all categories"
on public.categories
for select
to authenticated
using (true);

drop policy if exists "Authenticated can create categories" on public.categories;
create policy "Authenticated can create categories"
on public.categories
for insert
to authenticated
with check (true);

drop policy if exists "Authenticated can update categories" on public.categories;
create policy "Authenticated can update categories"
on public.categories
for update
to authenticated
using (true)
with check (true);

drop policy if exists "Authenticated can delete categories" on public.categories;
create policy "Authenticated can delete categories"
on public.categories
for delete
to authenticated
using (true);

do $$
begin
  if not exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'products'
      and column_name = 'category_id'
  ) then
    alter table public.products add column category_id uuid;
  end if;
end $$;

do $$
begin
  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'products'
      and column_name = 'category'
  ) then
    update public.products as p
    set category_id = c.id
    from public.categories as c
    where p.category_id is null
      and c.slug = case p.category
        when 'BRACELETS' then 'bracelets'
        when 'FLOWERS' then 'flowers'
        when 'BOUQUETS' then 'bouquets'
        when 'KEYCHAINS' then 'keychains'
        when 'MAGNETS' then 'magnets'
        when 'OTHER' then 'other'
        else lower(p.category)
      end;
  end if;
end $$;

update public.products
set category_id = (
  select id from public.categories where slug = 'other' limit 1
)
where category_id is null;

do $$
begin
  if exists (select 1 from public.products where category_id is null) then
    raise exception 'Some products could not be linked to a category. No product rows were deleted.';
  end if;
end $$;

alter table public.products
  alter column category_id set not null;

alter table public.products
  drop constraint if exists products_category_id_fkey;

alter table public.products
  add constraint products_category_id_fkey
  foreign key (category_id)
  references public.categories(id)
  on update cascade
  on delete restrict;

alter table public.products
  drop constraint if exists products_category_check;

drop index if exists public.products_category_idx;

create index if not exists products_category_id_idx
  on public.products (category_id);

do $$
begin
  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'products'
      and column_name = 'category'
  ) then
    alter table public.products drop column category;
  end if;
end $$;
