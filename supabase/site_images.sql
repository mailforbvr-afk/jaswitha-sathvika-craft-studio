-- Studio / website photos (kids photo and story-card photos).
-- Run this in the Supabase SQL Editor after site_settings.sql.
-- Safe to re-run.
--
-- Creates the public `site-images` bucket.
-- Does NOT change product-images, products, categories, WhatsApp, or themes.

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'site-images',
  'site-images',
  true,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do update
set
  public = true,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Public can view site images" on storage.objects;
create policy "Public can view site images"
on storage.objects
for select
to public
using (bucket_id = 'site-images');

drop policy if exists "Authenticated can upload site images" on storage.objects;
create policy "Authenticated can upload site images"
on storage.objects
for insert
to authenticated
with check (bucket_id = 'site-images');

drop policy if exists "Authenticated can update site images" on storage.objects;
create policy "Authenticated can update site images"
on storage.objects
for update
to authenticated
using (bucket_id = 'site-images')
with check (bucket_id = 'site-images');

drop policy if exists "Authenticated can delete site images" on storage.objects;
create policy "Authenticated can delete site images"
on storage.objects
for delete
to authenticated
using (bucket_id = 'site-images');
