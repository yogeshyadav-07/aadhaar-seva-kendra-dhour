# Digital Seva Kendra — Supabase Backend Setup

Ye advanced CSC portal poori tarah Supabase-backed hai — Services, Application
Tracker, Notices, Documents, Gallery, Yojana/Blog, Hero, Popup, Ticker,
Payment, aur Contact — sab kuch. Admin Panel me jo bhi change hoga, turant
sabhi visitors ko dikhega.

**LocalStorage me sirf ye 2 cheezein hain** (jaanbujh kar, per-device UI state,
admin content nahi): Dark/Light theme, aur visitor counter.

---

## Step 1 — Supabase Project Banayein

1. [supabase.com](https://supabase.com) pe sign up / login karein
2. **New Project** → naam do, password set karein, region **South Asia (Mumbai)** rakhein
3. 1-2 minute me project ready ho jayega

---

## Step 2 — Tables, Functions, Buckets aur RLS Policies (SQL)

Dashboard → **SQL Editor** → **New query** → poora neeche wala SQL ek sath paste karke **Run** karein:

```sql
create extension if not exists pgcrypto;

-- ═══════════ SERVICES ═══════════
create table services (
  id uuid primary key default gen_random_uuid(),
  icon text default '📋',
  name text not null,
  name_en text,
  category text,
  description text,
  doc_required text,
  form_file_url text,
  form_file_path text,
  sort_order integer default 0,
  created_at timestamptz not null default now()
);
alter table services enable row level security;
create policy "public_read_services" on services for select to anon, authenticated using (true);
create policy "auth_insert_services" on services for insert to authenticated with check (true);
create policy "auth_update_services" on services for update to authenticated using (true);
create policy "auth_delete_services" on services for delete to authenticated using (true);


-- ═══════════ APPLICATIONS (Tracker) — NO direct public SELECT ═══════════
create table applications (
  id uuid primary key default gen_random_uuid(),
  tracking_id text not null unique,
  applicant_name text,
  service_name text,
  status text not null default 'received' check (status in ('received','processing','approved','rejected','ready')),
  remarks text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table applications enable row level security;
-- ⚠️ जानबूझकर यहाँ anon के लिए कोई SELECT policy नहीं है — नीचे दिए secure
-- functions (RPC) के through ही customer अपना status देख सकते हैं, ताकि कोई
-- browser console से सब applicants का data ना देख सके।
create policy "auth_read_applications" on applications for select to authenticated using (true);
create policy "auth_insert_applications" on applications for insert to authenticated with check (true);
create policy "auth_update_applications" on applications for update to authenticated using (true);
create policy "auth_delete_applications" on applications for delete to authenticated using (true);

-- Secure lookup function — सिर्फ exact tracking_id मैच वाली एक row देता है
create or replace function get_application_status(p_tracking_id text)
returns table(tracking_id text, applicant_name text, service_name text, status text, remarks text, updated_at timestamptz)
language sql security definer set search_path = public as $$
  select tracking_id, applicant_name, service_name, status, remarks, updated_at
  from applications
  where lower(tracking_id) = lower(p_tracking_id)
  limit 1;
$$;
grant execute on function get_application_status(text) to anon, authenticated;

-- Secure "live feed" function — नाम नहीं, सिर्फ ID/service/status (privacy)
create or replace function get_recent_applications(p_limit int default 6)
returns table(tracking_id text, service_name text, status text, updated_at timestamptz)
language sql security definer set search_path = public as $$
  select tracking_id, service_name, status, updated_at
  from applications
  order by updated_at desc
  limit p_limit;
$$;
grant execute on function get_recent_applications(int) to anon, authenticated;


-- ═══════════ NOTICES ═══════════
create table notices (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  message text,
  date text,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);
alter table notices enable row level security;
create policy "public_read_active_notices" on notices for select to anon using (is_active = true);
create policy "auth_read_all_notices" on notices for select to authenticated using (true);
create policy "auth_insert_notices" on notices for insert to authenticated with check (true);
create policy "auth_update_notices" on notices for update to authenticated using (true);
create policy "auth_delete_notices" on notices for delete to authenticated using (true);


-- ═══════════ DOCUMENTS ═══════════
create table documents (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  category text,
  file_url text not null,
  file_path text,
  uploaded_at timestamptz not null default now()
);
alter table documents enable row level security;
create policy "public_read_documents" on documents for select to anon, authenticated using (true);
create policy "auth_insert_documents" on documents for insert to authenticated with check (true);
create policy "auth_update_documents" on documents for update to authenticated using (true);
create policy "auth_delete_documents" on documents for delete to authenticated using (true);


-- ═══════════ GALLERY ═══════════
create table gallery (
  id uuid primary key default gen_random_uuid(),
  caption text,
  image_url text not null,
  image_path text,
  created_at timestamptz not null default now()
);
alter table gallery enable row level security;
create policy "public_read_gallery" on gallery for select to anon, authenticated using (true);
create policy "auth_insert_gallery" on gallery for insert to authenticated with check (true);
create policy "auth_update_gallery" on gallery for update to authenticated using (true);
create policy "auth_delete_gallery" on gallery for delete to authenticated using (true);


-- ═══════════ BLOG / YOJANA POSTS ═══════════
create table blog_posts (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  summary text,
  content text,
  cover_image_url text,
  cover_image_path text,
  is_published boolean not null default true,
  created_at timestamptz not null default now()
);
alter table blog_posts enable row level security;
create policy "public_read_published_posts" on blog_posts for select to anon using (is_published = true);
create policy "auth_read_all_posts" on blog_posts for select to authenticated using (true);
create policy "auth_insert_posts" on blog_posts for insert to authenticated with check (true);
create policy "auth_update_posts" on blog_posts for update to authenticated using (true);
create policy "auth_delete_posts" on blog_posts for delete to authenticated using (true);


-- ═══════════ SITE CONTENT (Hero/Popup/Ticker/Payment/Contact) ═══════════
create table site_content (
  key text primary key,
  value jsonb not null default '{}'::jsonb,
  updated_at timestamptz default now()
);
alter table site_content enable row level security;
create policy "public_read_site_content" on site_content for select to anon, authenticated using (true);
create policy "auth_insert_site_content" on site_content for insert to authenticated with check (true);
create policy "auth_update_site_content" on site_content for update to authenticated using (true);
create policy "auth_delete_site_content" on site_content for delete to authenticated using (true);


-- ═══════════ STORAGE BUCKET #1 — documents ═══════════
insert into storage.buckets (id, name, public) values ('documents', 'documents', true) on conflict (id) do nothing;
create policy "public_read_documents_bucket" on storage.objects for select using (bucket_id = 'documents');
create policy "auth_upload_documents_bucket" on storage.objects for insert to authenticated with check (bucket_id = 'documents');
create policy "auth_delete_documents_bucket" on storage.objects for delete to authenticated using (bucket_id = 'documents');

-- ═══════════ STORAGE BUCKET #2 — site-assets (gallery, blog covers, QR, service files, hero video) ═══════════
insert into storage.buckets (id, name, public) values ('site-assets', 'site-assets', true) on conflict (id) do nothing;
create policy "public_read_site_assets_bucket" on storage.objects for select using (bucket_id = 'site-assets');
create policy "auth_upload_site_assets_bucket" on storage.objects for insert to authenticated with check (bucket_id = 'site-assets');
create policy "auth_update_site_assets_bucket" on storage.objects for update to authenticated using (bucket_id = 'site-assets');
create policy "auth_delete_site_assets_bucket" on storage.objects for delete to authenticated using (bucket_id = 'site-assets');
```

Ye chalne ke baad ban jayega: **6 tables** (services, applications, notices,
documents, gallery, blog_posts, site_content — actually 7), **2 secure
functions**, aur **2 storage buckets**.

> ⚠️ Video files bade hote hain — agar Hero background video upload karni ho
> to Supabase Storage me default file-size limit dekh lein (Dashboard →
> Storage → बकेट settings me max file size badा sakte hain).

---

## Step 2.5 — Client Data Seed (Sai Grahak Kendra)

Upar wala schema chalane ke turant baad, [`seed-sai-grahak-kendra.sql`](./seed-sai-grahak-kendra.sql)
file ka pura SQL bhi SQL Editor me paste karke **Run** kar dein — isse Rahul
Sahu ka contact info aur poster ke sabhi 23 services (categories ke saath)
automatically ban jayenge, koi manual typing nahi karni padegi।

---

## Step 3 — Admin User Banayein (Supabase Auth)

1. Dashboard → **Authentication → Users** → **Add user** → **Create new user**
2. Email: jaise `admin@example.com`, Password: strong rakhein
3. **Auto Confirm User** ✅ zaroor check karein
4. **Create user**

---

## Step 4 — API Keys `script.js` me Daalein

1. Dashboard → **Project Settings → API** se **Project URL** aur **anon public key** copy karein
2. `script.js` file kholke shuru me ye lines dhoondhein aur apni values se replace karein:

```js
const SUPABASE_URL = "YOUR_SUPABASE_PROJECT_URL";
const SUPABASE_ANON_KEY = "YOUR_SUPABASE_ANON_KEY";
```

> anon key public karna safe hai — write/delete sirf RLS policies se restricted admin tak hi seemित hai।

---

## Step 5 — Test Karein

Static server se serve karein (seedha `file://` na kholein):
```bash
python3 -m http.server 8000
```
`http://localhost:8000` kholein → Admin Login karein → har tab me ek-ek entry
add/upload karke customer side (homepage refresh karke) confirm karein ki
dikh raha hai.

**Application Tracker test:** Admin Panel → Applications tab me ek record
banayein (Tracking ID jaise `DSK2026-00001`) → homepage pe "आवेदन ट्रैक करें"
section me wahi ID daal ke check karein।

---

## Content ka business/branding data

Ye site **Sai Grahak Kendra (Rahul Sahu)** ke liye customize की गई है।
Contact numbers (8103305224 / WhatsApp 918103305224) aur poster ke sabhi 23
services **pre-loaded** karne ke liye [`seed-sai-grahak-kendra.sql`](./seed-sai-grahak-kendra.sql)
file ko upar wale Step 2 ka schema chalane ke turant baad SQL Editor me run
kar dein — services categories ke saath (सरकारी सेवाएं, बैंकिंग, बिल भुगतान,
शिक्षा, अन्य) automatically ban jayengi aur homepage par filter chips ke
through dikhengi.

Address abhi poster me nahi diya gaya tha, isliye khali chhoda gaya hai —
Admin Panel → **Contact** tab se address bhar dein, turant Navbar/Hero/
Location/Payment/Footer sabhi jagah apply ho jayega (koi code change nahi
chahiye).

---

## Troubleshooting

| Problem | Fix |
|---|---|
| "Script error" ya kuch load nahi ho raha | `SUPABASE_URL`/`SUPABASE_ANON_KEY` check karein, `file://` की जगह local server use karein |
| Tracker "not found" bata raha hai | Application record Admin Panel → Applications tab me bana hai ya nahi check karein, exact Tracking ID match hona chahiye |
| Login fail | Email/password Step 3 se match karein, user confirm hai ya nahi Dashboard me check karein |
| Upload fail | Step 2 ka pura SQL bina error chala tha ya nahi confirm karein |

---

Poori site ab Supabase-backed hai — admin jo bhi change karega, turant sabhi
visitors ko real data se dikhega.
