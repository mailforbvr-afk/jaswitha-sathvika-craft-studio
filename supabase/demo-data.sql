-- Optional sample rows for testing. These are NOT real crafts or prices.
-- Run only after supabase/categories.sql. Remove later with the DELETE below.

insert into public.products (name, description, price, category_id, image_url, status, featured)
values
  (
    'Demo Beaded Bracelet (Sample)',
    'Sample database row for testing. Replace with a real creation from the admin dashboard.',
    0,
    (select id from public.categories where slug = 'bracelets' limit 1),
    null,
    'AVAILABLE',
    true
  ),
  (
    'Demo Pipe-Cleaner Flower (Sample)',
    'Sample database row for testing. This is not a real product.',
    0,
    (select id from public.categories where slug = 'flowers' limit 1),
    null,
    'AVAILABLE',
    true
  ),
  (
    'Demo Sold Item (Sample)',
    'Sample sold row. It should stay hidden on the public website.',
    0,
    (select id from public.categories where slug = 'other' limit 1),
    null,
    'SOLD',
    false
  );

-- To remove this sample data later:
-- delete from public.products where name like '%(Sample)';
