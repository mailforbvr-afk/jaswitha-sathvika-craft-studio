# Jaswitha & Sathvika — Little Craft Studio

A colourful handmade gallery for two children’s crafts: bracelets, flowers, bouquets, keychains, magnets and other little creations.

This is **not** a shopping cart website. Visitors look at the gallery and send a WhatsApp message if they are interested. A parent or guardian manages the crafts from a simple admin page.

## What you will use

- **Next.js** — the website
- **TypeScript** — safer JavaScript
- **Tailwind CSS** — styling
- **Supabase** — login, product database, and photo storage
- **WhatsApp click-to-chat** — enquiries
- **Cloudflare** — later, for putting the site on the internet

You do **not** need Python, WordPress, Shopify, or online payments.

## 1. Install Node.js (one-time)

You need Node.js 20 or newer.

On a Mac with Homebrew:

```bash
brew install node
```

Then check:

```bash
node -v
npm -v
```

## 2. Install the project

In Terminal, go to this folder and install packages:

```bash
cd /Users/bhadrabadam/Jaswitha
npm install
```

## 3. Environment variables

Copy the example file:

```bash
cp .env.example .env.local
```

Open `.env.local` and fill in:

| Variable | What it is |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Supabase **publishable** (client) key. Never put the service-role key here. |
| `NEXT_PUBLIC_WHATSAPP_NUMBER` | Parent/guardian WhatsApp number with country code, digits only. Example: `9198XXXXXXXX` |
| `NEXT_PUBLIC_USE_DEMO_DATA` | `true` only while you want sample gallery cards. Set `false` after real products exist. |

Never commit `.env.local`. It stays on your computer.

## 4. Run the website on your computer

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

Admin page: [http://localhost:3000/admin](http://localhost:3000/admin)

If Supabase is not set up yet, the public site shows clearly labelled **demo sample** cards so you can see the design. Those are not real products.

## 5. Create a Supabase project

1. Sign in at [https://supabase.com](https://supabase.com).
2. Click **New project**.
3. Choose a name, password, and region.
4. Wait until the project is ready.
5. Go to **Project Settings → API**.
6. Copy the **Project URL** and the **publishable** key into `.env.local`.

Do not copy the **service_role** key into this website.

## 6. Create the products table

1. In Supabase, open **SQL Editor**.
2. Paste and run the contents of `supabase/schema.sql`.
3. This creates the `products` table and safety rules (Row Level Security):
   - Visitors can only read products marked **AVAILABLE**.
   - Signed-in admin can add, edit, and delete products.
4. Then paste and run `supabase/categories.sql`.
   - This adds a `categories` table, seeds Bracelets / Flowers / Bouquets / Keychains / Magnets / Other, and links existing products without deleting them.
   - After this, you can add new categories from `/admin` without changing code.

## 7. Configure photo storage

1. In the same SQL Editor, paste and run `supabase/storage.sql`.
2. This creates a public bucket named `product-images`.
3. Visitors can view photos. Only the signed-in admin can upload, replace, or delete them.

Optional: Storage → Configuration → set a max file size (5 MB is a good match for the website).

## 8. Create the admin user

1. In Supabase, open **Authentication → Users**.
2. Click **Add user** → **Create new user**.
3. Enter the parent/guardian email and a strong password.
4. Turn off public sign-up if you see **Authentication → Providers → Email → Confirm email** options that would let strangers register. Recommended:
   - Authentication → Providers → Email: keep email login ON
   - Disable public sign-ups if your Supabase version shows that setting
5. Sign in at `/admin/login` with that email and password.

Anyone who can sign in can manage products, so only create this one user.

## 9. Add real crafts

1. Sign in at `/admin`.
2. Click **+ Add New Creation**.
3. Upload a photo, name, description, price (numbers only, like `150`), category, Available, and optionally Featured.
4. Save. The public gallery updates immediately.

Behaviour:

- **Available** products appear on the website.
- **Sold** products stay in the admin list but disappear from the public gallery.
- **Delete** removes the product and tries to remove its photo too.
- **Featured** products also appear in **Featured Creations**.

## 10. Optional sample database rows

`supabase/demo-data.sql` can insert a few labelled sample rows. They are not real crafts.

To remove them later:

```sql
delete from public.products where name like '%(Sample)';
```

Then set `NEXT_PUBLIC_USE_DEMO_DATA=false` in `.env.local`.

## 11. Deploy to Cloudflare

Local development uses normal Next.js (`npm run dev`). Cloudflare hosting uses the OpenNext adapter.

When you are ready to put the site online:

1. Push this project to GitHub.
2. Create a Cloudflare account.
3. In this folder:

```bash
npm install @opennextjs/cloudflare wrangler --save-dev
npx @opennextjs/cloudflare migrate
```

4. Add the same environment variables in Cloudflare:
   - Workers / Pages project → Settings → Variables and Secrets
   - Add `NEXT_PUBLIC_SUPABASE_URL`
   - Add `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
   - Add `NEXT_PUBLIC_WHATSAPP_NUMBER`
   - Add `NEXT_PUBLIC_USE_DEMO_DATA=false`
5. Deploy:

```bash
npm run deploy
```

Or connect the GitHub repo in the Cloudflare dashboard and use:

- Build command: `npx @opennextjs/cloudflare build`
- Deploy command: `npx @opennextjs/cloudflare deploy`

This does **not** need a computer left running. Cloudflare serves the website.

## 12. Add a custom domain later

1. Buy a domain (for example from Cloudflare, Google Domains, or another registrar).
2. In Cloudflare, open the deployed Worker/Pages project.
3. Open **Custom domains** and add your domain.
4. Follow Cloudflare’s DNS steps.
5. After HTTPS is active, update the website address in `src/app/layout.tsx` (`metadataBase`) if you want sharing previews to use the real domain.

## Useful commands

```bash
npm run dev      # run locally
npm run build    # check a production build
npm run start    # preview the production build locally
npm run lint     # check for code issues
```

## Privacy notes

- Do not publish a home address, school name, or a child’s personal phone number.
- The WhatsApp number should belong to a parent or guardian.
- Photos of the children are optional and can stay off the site. Craft photos should be the main focus.

## If something goes wrong

- **Blank gallery after connecting Supabase:** add products in `/admin`, and confirm they are marked Available.
- **Cannot upload an image:** check the `product-images` bucket and storage SQL policies. Use JPG/PNG/WEBP/GIF under 5 MB.
- **Cannot sign in:** confirm the user exists in Supabase Authentication and that `.env.local` has the correct URL and publishable key. Restart `npm run dev` after changing env files.
- **WhatsApp button does nothing:** set `NEXT_PUBLIC_WHATSAPP_NUMBER` to digits with country code, then restart the dev server.
