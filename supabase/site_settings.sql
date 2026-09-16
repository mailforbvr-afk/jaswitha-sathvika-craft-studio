-- Little Craft Studio: public site wording
-- Run this ONCE in the Supabase SQL Editor after schema.sql, storage.sql, and categories.sql.
--
-- If you already created site_settings, re-run this file (safe) to add theme, content, and photo URL columns.
-- Then run supabase/site_images.sql to create the site-images storage bucket.
-- Does NOT change products, categories, product-images, or WhatsApp.

create extension if not exists "pgcrypto";

create table if not exists public.site_settings (
  id uuid primary key,
  studio_name text not null check (char_length(trim(studio_name)) > 0),
  main_title text not null check (char_length(trim(main_title)) > 0),
  tagline text not null check (char_length(trim(tagline)) > 0),
  contact_heading text not null default '',
  contact_message text not null default '',
  about_text text not null default '',
  instagram_url text,
  email text,
  theme text not null default 'pink-dream',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint site_settings_singleton
    check (id = '00000000-0000-0000-0000-000000000001')
);

create or replace function public.set_site_settings_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists site_settings_set_updated_at on public.site_settings;
create trigger site_settings_set_updated_at
before update on public.site_settings
for each row
execute function public.set_site_settings_updated_at();

-- Theme field for existing databases that already created site_settings.
-- Safe to re-run. Does NOT change products, categories, or WhatsApp.
alter table public.site_settings
  add column if not exists theme text not null default 'pink-dream';

insert into public.site_settings (
  id,
  studio_name,
  main_title,
  tagline,
  contact_heading,
  contact_message,
  about_text,
  instagram_url,
  email,
  theme
)
values (
  '00000000-0000-0000-0000-000000000001',
  'Jaswitha & Sathvika Little Craft Studio',
  'Little Creations, Made with Love',
  'Little hands • Big imagination • Handmade with love ❤️',
  'Interested in any of our creations?',
  'Send us a WhatsApp message!',
  'Welcome to Jaswitha & Sathvika Little Craft Studio, a little space filled with handmade creations, imagination and love. Every creation is made with care and lots of creativity.',
  null,
  null,
  'pink-dream'
)
on conflict (id) do nothing;

alter table public.site_settings enable row level security;

drop policy if exists "Public can view site settings" on public.site_settings;
create policy "Public can view site settings"
on public.site_settings
for select
to anon
using (true);

drop policy if exists "Authenticated can view site settings" on public.site_settings;
create policy "Authenticated can view site settings"
on public.site_settings
for select
to authenticated
using (true);

drop policy if exists "Authenticated can insert site settings" on public.site_settings;
create policy "Authenticated can insert site settings"
on public.site_settings
for insert
to authenticated
with check (id = '00000000-0000-0000-0000-000000000001');

drop policy if exists "Authenticated can update site settings" on public.site_settings;
create policy "Authenticated can update site settings"
on public.site_settings
for update
to authenticated
using (id = '00000000-0000-0000-0000-000000000001')
with check (id = '00000000-0000-0000-0000-000000000001');

alter table public.site_settings
  drop constraint if exists site_settings_theme_check;

alter table public.site_settings
  add constraint site_settings_theme_check
  check (theme in (
    'pink-dream',
    'rainbow-fun',
    'garden-bloom',
    'butterfly-magic',
    'candy-pop',
    'ocean-dream',
    'sunny-craft'
  ));

-- Public website content fields. Safe to re-run. Existing values are kept.
-- Does NOT change products, categories, images, storage, or WhatsApp.

alter table public.site_settings add column if not exists header_studio_name text not null default 'Jaswitha & Sathvika Little Craft Studio';
alter table public.site_settings add column if not exists header_tagline text not null default 'Little Craft Studio';
alter table public.site_settings add column if not exists hero_badge text not null default 'Handmade with little hands';
alter table public.site_settings add column if not exists hero_description text not null default 'Handmade creations made with lots of imagination, creativity and love.';
alter table public.site_settings add column if not exists hero_primary_button text not null default '✨ Explore Our Crafts';
alter table public.site_settings add column if not exists hero_secondary_button text not null default '💬 Chat on WhatsApp';
alter table public.site_settings add column if not exists hero_visual_title text not null default 'Made by Little Hands';
alter table public.site_settings add column if not exists hero_visual_caption text not null default 'Little crafts, made with care';
alter table public.site_settings add column if not exists collections_eyebrow text not null default 'Collections';
alter table public.site_settings add column if not exists collections_title text not null default 'Little categories, lots of colour';
alter table public.site_settings add column if not exists collections_description text not null default 'Tap a category to see handmade pieces made with little hands.';
alter table public.site_settings add column if not exists featured_eyebrow text not null default 'Favorites';
alter table public.site_settings add column if not exists featured_title text not null default '✨ Little Favorites';
alter table public.site_settings add column if not exists featured_description text not null default 'A few handmade pieces we are especially happy to share.';
alter table public.site_settings add column if not exists gallery_eyebrow text not null default 'Gallery';
alter table public.site_settings add column if not exists gallery_title text not null default 'All our crafts';
alter table public.site_settings add column if not exists gallery_description text not null default 'Every piece is handmade, one of a kind, and shared here so you can enjoy looking — and message us if something makes you smile.';
alter table public.site_settings add column if not exists about_eyebrow text not null default 'Our Story';
alter table public.site_settings add column if not exists about_title text not null default '💕 Our Little Story';
alter table public.site_settings add column if not exists about_highlight text not null default 'Two sisters, one little studio.';
alter table public.site_settings add column if not exists story_section_title text not null default 'Every creation has a story ✨';
alter table public.site_settings add column if not exists story_section_text text not null default 'This website is about creativity, learning and enjoying the process of making things. Some days it is a bracelet. Some days it is a tiny flower. The joy is in trying, practising and making something with their own hands.';
alter table public.site_settings add column if not exists story_card_1_title text not null default 'Made with Love ❤️';
alter table public.site_settings add column if not exists story_card_1_text text not null default 'Every little creation is made with care, patience and lots of love.';
alter table public.site_settings add column if not exists story_card_2_title text not null default 'Little Hands, Big Ideas ✨';
alter table public.site_settings add column if not exists story_card_2_text text not null default 'From tiny flowers to colourful bracelets, every creation starts with imagination.';
alter table public.site_settings add column if not exists story_card_3_title text not null default 'Learning Through Creativity 🌸';
alter table public.site_settings add column if not exists story_card_3_text text not null default 'Making things helps us learn, experiment, practice and enjoy the joy of creating.';
alter table public.site_settings add column if not exists contact_eyebrow text not null default 'GET IN TOUCH';
alter table public.site_settings add column if not exists contact_button_text text not null default 'Chat on WhatsApp';
alter table public.site_settings add column if not exists footer_description text not null default 'Little hands • Big imagination • Handmade with love ❤️';
alter table public.site_settings add column if not exists footer_copyright text not null default 'Handmade with love by Jaswitha & Sathvika.';

-- Studio photos (public URLs from the site-images bucket). Nullable. Safe to re-run.
-- Does NOT store binary image data. Does NOT change product-images.
alter table public.site_settings add column if not exists hero_image_url text;
alter table public.site_settings add column if not exists story_card_1_image_url text;
alter table public.site_settings add column if not exists story_card_2_image_url text;
alter table public.site_settings add column if not exists story_card_3_image_url text;
