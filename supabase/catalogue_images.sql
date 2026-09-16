-- Catalogue images for products.
-- Run this in the Supabase SQL Editor.
-- Safe to re-run.
-- Does NOT change existing product photos, categories, WhatsApp, or site settings.

alter table public.products
  add column if not exists catalogue_image_url text;

alter table public.products
  add column if not exists use_catalogue_image boolean not null default false;
