-- Little Arts commerce settings and orders
-- Run this file in the Supabase SQL editor after the existing schema files.
-- It is additive: it does not delete or alter product records.

create extension if not exists "pgcrypto";

create table if not exists public.admin_users (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

-- Add the already-created Little Arts admin after running this migration:
-- insert into public.admin_users (user_id)
-- select id from auth.users where email = 'your-admin-email@example.com';

create or replace function public.is_site_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.admin_users where user_id = auth.uid()
  );
$$;

create table if not exists public.commerce_settings (
  id uuid primary key default '00000000-0000-0000-0000-000000000002',
  razorpay_enabled boolean not null default true,
  manual_upi_enabled boolean not null default true,
  upi_id text,
  upi_qr_url text,
  manual_shipping_enabled boolean not null default true,
  shiprocket_enabled boolean not null default false,
  shipping_charge numeric(10,2) not null default 0 check (shipping_charge >= 0),
  free_shipping_threshold numeric(10,2) check (free_shipping_threshold is null or free_shipping_threshold >= 0),
  serviceable_pincodes text[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint commerce_settings_singleton check (id = '00000000-0000-0000-0000-000000000002')
);

insert into public.commerce_settings (id)
values ('00000000-0000-0000-0000-000000000002')
on conflict (id) do nothing;

create or replace function public.set_commerce_settings_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end;
$$;

drop trigger if exists commerce_settings_set_updated_at on public.commerce_settings;
create trigger commerce_settings_set_updated_at
before update on public.commerce_settings
for each row execute function public.set_commerce_settings_updated_at();

create table if not exists public.commerce_orders (
  id uuid primary key default gen_random_uuid(),
  order_number text not null unique default ('LA-' || upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 10))),
  customer_name text not null check (char_length(trim(customer_name)) between 2 and 120),
  customer_phone text not null check (customer_phone ~ '^[0-9+ -]{8,20}$'),
  address_line1 text not null check (char_length(trim(address_line1)) between 5 and 240),
  address_line2 text,
  city text not null check (char_length(trim(city)) between 2 and 100),
  state text not null check (char_length(trim(state)) between 2 and 100),
  pincode text not null check (pincode ~ '^[1-9][0-9]{5}$'),
  subtotal numeric(10,2) not null check (subtotal >= 0),
  shipping_fee numeric(10,2) not null check (shipping_fee >= 0),
  total numeric(10,2) not null check (total >= 0),
  payment_method text not null check (payment_method in ('RAZORPAY','UPI')),
  payment_status text not null default 'PENDING' check (payment_status in ('PENDING','PAID','VERIFIED','FAILED','REFUNDED')),
  upi_reference text,
  razorpay_order_id text unique,
  razorpay_payment_id text unique,
  payment_verified_at timestamptz,
  payment_verified_by uuid references auth.users(id),
  courier_name text,
  postage_amount numeric(10,2) check (postage_amount is null or postage_amount >= 0),
  tracking_number text,
  shipped_at timestamptz,
  fulfilment_status text not null default 'UNFULFILLED' check (fulfilment_status in ('UNFULFILLED','PROCESSING','SHIPPED','DELIVERED','CANCELLED')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.commerce_order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.commerce_orders(id) on delete cascade,
  product_id uuid references public.products(id) on delete set null,
  product_name text not null,
  unit_price numeric(10,2) not null check (unit_price >= 0),
  quantity integer not null check (quantity between 1 and 10),
  line_total numeric(10,2) not null check (line_total >= 0)
);

create index if not exists commerce_orders_created_idx on public.commerce_orders (created_at desc);
create index if not exists commerce_order_items_order_idx on public.commerce_order_items (order_id);

create or replace function public.set_commerce_order_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  if new.payment_status = 'VERIFIED' and old.payment_status is distinct from 'VERIFIED' then
    new.payment_verified_at = now();
    new.payment_verified_by = auth.uid();
  end if;
  return new;
end;
$$;

drop trigger if exists commerce_orders_set_updated_at on public.commerce_orders;
create trigger commerce_orders_set_updated_at
before update on public.commerce_orders
for each row execute function public.set_commerce_order_updated_at();

alter table public.admin_users enable row level security;
alter table public.commerce_settings enable row level security;
alter table public.commerce_orders enable row level security;
alter table public.commerce_order_items enable row level security;

drop policy if exists "Admins manage admin users" on public.admin_users;
create policy "Admins manage admin users" on public.admin_users
for all to authenticated using (public.is_site_admin()) with check (public.is_site_admin());

drop policy if exists "Admins manage commerce settings" on public.commerce_settings;
create policy "Admins manage commerce settings" on public.commerce_settings
for all to authenticated using (public.is_site_admin()) with check (public.is_site_admin());

drop policy if exists "Admins manage commerce orders" on public.commerce_orders;
create policy "Admins manage commerce orders" on public.commerce_orders
for all to authenticated using (public.is_site_admin()) with check (public.is_site_admin());

drop policy if exists "Admins manage commerce order items" on public.commerce_order_items;
create policy "Admins manage commerce order items" on public.commerce_order_items
for all to authenticated using (public.is_site_admin()) with check (public.is_site_admin());

-- A safe public projection: never returns customer data or private credentials.
create or replace function public.checkout_options()
returns jsonb
language sql
stable
security definer
set search_path = public
as $$
  select jsonb_build_object(
    'manualShippingEnabled', manual_shipping_enabled,
    'shippingCharge', shipping_charge,
    'freeShippingThreshold', free_shipping_threshold,
    'serviceablePincodes', serviceable_pincodes,
    'manualUpiEnabled', manual_upi_enabled and nullif(trim(coalesce(upi_id, '')), '') is not null,
    'upiId', case when manual_upi_enabled then upi_id else null end,
    'upiQrUrl', case when manual_upi_enabled then upi_qr_url else null end,
    'razorpayEnabled', razorpay_enabled
  ) from public.commerce_settings
  where id = '00000000-0000-0000-0000-000000000002';
$$;

-- Server routes call this function. Prices, availability, shipping and enabled
-- methods are calculated from database records, never from browser-provided totals.
create or replace function public.create_commerce_order(
  p_customer jsonb,
  p_items jsonb,
  p_payment_method text,
  p_upi_reference text default null
)
returns table(order_id uuid, order_number text, total numeric, payment_method text)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_settings public.commerce_settings%rowtype;
  v_subtotal numeric(10,2) := 0;
  v_shipping numeric(10,2) := 0;
  v_total numeric(10,2);
  v_order_id uuid;
  v_item jsonb;
  v_product public.products%rowtype;
  v_qty integer;
  v_pincode text := coalesce(p_customer->>'pincode', '');
begin
  if jsonb_typeof(p_customer) <> 'object' or jsonb_typeof(p_items) <> 'array' or jsonb_array_length(p_items) = 0 then
    raise exception 'Invalid checkout details' using errcode = '22023';
  end if;
  if coalesce(p_customer->>'name', '') !~ '^.{2,120}$' or coalesce(p_customer->>'phone', '') !~ '^[0-9+ -]{8,20}$'
     or coalesce(p_customer->>'addressLine1', '') !~ '^.{5,240}$' or coalesce(p_customer->>'city', '') !~ '^.{2,100}$'
     or coalesce(p_customer->>'state', '') !~ '^.{2,100}$' or v_pincode !~ '^[1-9][0-9]{5}$' then
    raise exception 'Invalid customer or delivery details' using errcode = '22023';
  end if;
  select * into v_settings from public.commerce_settings where id = '00000000-0000-0000-0000-000000000002';
  if not found or not v_settings.manual_shipping_enabled then
    raise exception 'Delivery is not available' using errcode = '22023';
  end if;
  if cardinality(v_settings.serviceable_pincodes) > 0 and not (v_pincode = any(v_settings.serviceable_pincodes)) then
    raise exception 'This pincode is not serviceable yet' using errcode = '22023';
  end if;
  if p_payment_method = 'UPI' and (not v_settings.manual_upi_enabled or nullif(trim(coalesce(v_settings.upi_id, '')), '') is null) then
    raise exception 'Manual UPI is not available' using errcode = '22023';
  end if;
  if p_payment_method = 'RAZORPAY' and not v_settings.razorpay_enabled then
    raise exception 'Online payment is not available' using errcode = '22023';
  end if;
  if p_payment_method not in ('UPI', 'RAZORPAY') then raise exception 'Invalid payment method' using errcode = '22023'; end if;
  for v_item in select * from jsonb_array_elements(p_items) loop
    v_qty := nullif(v_item->>'quantity', '')::integer;
    if v_qty is null or v_qty < 1 or v_qty > 10 then raise exception 'Invalid quantity' using errcode = '22023'; end if;
    select * into v_product from public.products where id = (v_item->>'productId')::uuid and status = 'AVAILABLE';
    if not found then raise exception 'A selected creation is no longer available' using errcode = '22023'; end if;
    v_subtotal := v_subtotal + (v_product.price * v_qty);
  end loop;
  if v_settings.free_shipping_threshold is null or v_subtotal < v_settings.free_shipping_threshold then v_shipping := v_settings.shipping_charge; end if;
  v_total := v_subtotal + v_shipping;
  insert into public.commerce_orders (customer_name, customer_phone, address_line1, address_line2, city, state, pincode, subtotal, shipping_fee, total, payment_method, upi_reference)
  values (trim(p_customer->>'name'), trim(p_customer->>'phone'), trim(p_customer->>'addressLine1'), nullif(trim(coalesce(p_customer->>'addressLine2','')), ''), trim(p_customer->>'city'), trim(p_customer->>'state'), v_pincode, v_subtotal, v_shipping, v_total, p_payment_method, nullif(trim(coalesce(p_upi_reference,'')), ''))
  returning id into v_order_id;
  for v_item in select * from jsonb_array_elements(p_items) loop
    v_qty := (v_item->>'quantity')::integer;
    select * into v_product from public.products where id = (v_item->>'productId')::uuid;
    insert into public.commerce_order_items (order_id, product_id, product_name, unit_price, quantity, line_total)
    values (v_order_id, v_product.id, v_product.name, v_product.price, v_qty, v_product.price * v_qty);
  end loop;
  return query select id, order_number, total, payment_method from public.commerce_orders where id = v_order_id;
end;
$$;

revoke all on public.commerce_settings, public.commerce_orders, public.commerce_order_items from anon;
grant execute on function public.checkout_options() to anon, authenticated;
grant execute on function public.create_commerce_order(jsonb, jsonb, text, text) to anon, authenticated;
