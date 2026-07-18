# Sai Grahak Kendra — Digital CSC Portal

A fully dynamic, Supabase-backed website for a **Common Service Centre (CSC)** located in Village Dhour, District Durg, Chhattisgarh - 490024, India. Built as a single-page, multi-language digital portal offering government service listings, application tracking, notices, documents, gallery, schemes/blog, and a full admin dashboard for content management.

🔗 **Live Site:**  https://yogeshyadav-07.github.io/aadhaar-seva-kendra-dhour/

---

## ✨ Features

- **Multi-language support** — Hindi, English, and Chhattisgarhi
- **Services listing** — Aadhaar, PAN, banking, bill payments, education, and all government scheme services
- **Application Tracker** — visitors can check their application status via a secure tracking ID lookup
- **Live notices ticker** — scrolling announcements bar
- **Notices, Documents & Gallery sections** — dynamically managed
- **Schemes / Blog section** — for government yojana updates
- **UPI Payment section**
- **Google Maps integration** — direct location links to the centre
- **Dark / Light theme toggle**
- **Admin Dashboard** — secure login to manage services, notices, documents, gallery, blog posts, application statuses, and site content — all changes reflect instantly for every visitor
- **Fully responsive** — works across mobile, tablet, and desktop

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | HTML5, CSS3 (custom properties/tokens), Vanilla JavaScript |
| Backend / Database | [Supabase](https://supabase.com) (PostgreSQL, Row Level Security, RPC functions) |
| Storage | Supabase Storage buckets (documents, gallery images, forms) |
| Auth | Supabase Auth (admin login only) |
| Hosting | Static hosting (Netlify / Vercel / GitHub Pages, etc.) |

---

## 📁 Project Structure

```
├── index.html                    # Main site markup
├── style.css                     # All styling (design tokens, layout, components)
├── script.js                     # App logic, i18n, Supabase integration, admin panel
├── SUPABASE_SETUP.md             # Full backend setup guide (tables, RLS, functions)
└── seed-sai-grahak-kendra.sql    # Seed data for initial content
```

---

## 🚀 Getting Started

### 1. Clone / download the project files

Place `index.html`, `style.css`, and `script.js` in the same folder.

### 2. Set up the backend

Follow the step-by-step instructions in **`SUPABASE_SETUP.md`** to:
- Create a Supabase project
- Run the provided SQL to create tables, storage buckets, and security policies
- Connect your Supabase project URL and public API key inside `script.js`

### 3. Seed initial data (optional)

Run `seed-sai-grahak-kendra.sql` in the Supabase SQL editor to pre-fill sample services, notices, and content.

### 4. Run locally

Open `index.html` directly in a browser, or serve it with any local static server (e.g. VS Code Live Server) for the best experience.

### 5. Deploy

Upload `index.html`, `style.css`, and `script.js` to any static hosting provider (Netlify, Vercel, GitHub Pages, etc.).

---

## 🔐 Admin Access

The admin dashboard is accessible via the login option in the site and is protected by Supabase Auth. Only authenticated users can add/edit/delete services, notices, documents, gallery items, blog posts, and update application statuses.

---

## 📍 Location

**Sai Grahak Kendra**
Village Dhour, Dist. Durg, Chhattisgarh - 490024, India

---

## 👨‍💻 Credits

**Web Developed by Yogesh Kumar Yadav**

---

## 📄 License

This project is provided for the centre's own use. Please contact the developer for reuse or modification permissions.  
