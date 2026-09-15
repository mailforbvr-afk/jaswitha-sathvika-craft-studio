-- Little Craft Studio database setup
-- Run this in the Supabase SQL Editor first.
-- Then run supabase/storage.sql, then supabase/categories.sql.

create extension if not exists "pgcrypto";

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(trim(name)) > 0),
  description text not null default '',
  price numeric(10, 2) not null check (price >= 0),
  category text not null check (
    category in ('BRACELETS', 'FLOWERS', 'BOUQUETS', 'KEYCHAINS', 'MAGNETS', 'OTHER')
  ),
  image_url text,
  status text not null default 'AVAILABLE' check (status in ('AVAILABLE', 'SOLD')),
  featured boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists products_status_created_idx
  on public.products (status, created_at desc);

create index if not exists products_category_idx
  on public.products (category);

create or replace function public.set_products_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists products_set_updated_at on public.products;
create trigger products_set_updated_at
before update on public.products
for each row
execute function public.set_products_updated_at();

alter table public.products enable row level security;

drop policy if exists "Public can view available products" on public.products;
create policy "Public can view available products"
on public.products
for select
to anon
using (status = 'AVAILABLE');

drop policy if exists "Authenticated can view all products" on public.products;
create policy "Authenticated can view all products"
on public.products
for select
to authenticated
using (true);

drop policy if exists "Authenticated can create products" on public.products;
create policy "Authenticated can create products"
on public.products
for insert
to authenticated
with check (true);

drop policy if exists "Authenticated can update products" on public.products;
create policy "Authenticated can update products"
on public.products
for update
to authenticated
using (true)
with check (true);

drop policy if exists "Authenticated can delete products" on public.products;
create policy "Authenticated can delete products"
on public.products
for delete
to authenticated
using (true);
