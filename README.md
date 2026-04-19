<div align="center">

<img src="https://ucocsa.vercel.app/favicon.png" alt="UCOCSA Logo" width="80" height="80" />

# UCOCSA

### University of Malawi Church of Christ Student Association

**A Christ-centered digital community platform for UNIMA students**

[![Live Site](https://img.shields.io/badge/🌍_Live_Site-ucocsa.vercel.app-1F3A2E?style=for-the-badge)](https://ucocsa.vercel.app)
[![Built with React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react&logoColor=white)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Supabase](https://img.shields.io/badge/Supabase-Backend-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)](https://supabase.com)
[![Vercel](https://img.shields.io/badge/Deployed_on-Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white)](https://vercel.com)

---

*Nurturing faith, academic excellence, and lifelong fellowship at the University of Malawi since 1985.*

</div>

---

## 📖 Table of Contents

- [Overview](#-overview)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)
- [Environment Variables](#-environment-variables)
- [Pages & Routes](#-pages--routes)
- [Admin Panel](#-admin-panel)
- [Database Schema](#-database-schema)
- [PWA & Hymns App](#-pwa--hymns-app)
- [Deployment](#-deployment)
- [Contributing](#-contributing)

---

## 🌿 Overview

UCOCSA is the official web platform for the **University of Malawi Church of Christ Student Association**, serving students across the UNIMA campus in Zomba, Malawi. The platform brings together all aspects of student fellowship life — from worship and prayer to events, blog posts, and community messaging — into one beautifully designed, mobile-first experience.

The platform is built as a **Progressive Web App (PWA)**, with the Hymns section available fully offline for low-data environments common in Malawi.

> "A Christ-centered community nurturing faith, academic excellence, and lifelong fellowship at UNIMA."

---

## ✨ Features

### 🎵 Hymn Library
- Full searchable hymnal with hundreds of hymns
- Verse-by-verse reading with adjustable font size
- **Presentation Mode** — full-screen, keyboard-navigable slides for worship leaders
- **Auto-scroll** with adjustable speed for hands-free reading
- YouTube audio/video integration per hymn (when online)
- Share hymns as beautifully designed poster images (PNG export)
- Member hymn suggestions with admin approval workflow
- **Fully offline** via PWA service worker — works without internet

### 🙏 Prayer Portal
- Submit prayer requests with optional anonymity and privacy settings
- Public prayer wall for community intercession
- Praise reports for answered prayers
- Per-request comment threads
- Admins can approve, archive, and moderate requests

### 📅 Events & Service Programs
- Full events calendar with filtering by type (Fellowship, Bible Study, Outreach, etc.)
- **Service Programs** — structured Sunday & MidWeek order-of-service management
- Countdown timer to next fellowship on the homepage
- Share events as poster images
- Members can view full order-of-service when logged in

### 📝 Blog & Student Voices
- Rich Markdown blog editor with image upload
- Per-post cover images, categories, and author profiles
- Likes, nested comments, and comment likes
- Dynamic OG meta tag injection for social sharing previews (`/api/og-blog.js`)

### 🖼️ Photo Gallery
- Albums with cover images and descriptions
- Highlighted albums carousel on the homepage
- Members can upload photos (subject to admin approval)
- Admin bulk upload and bucket-sync tools
- Lightbox photo viewer

### 📢 Announcements
- Admin-published announcements with expiry dates
- **Notification Bell** in the navbar with unread state, 4-hour reminder logic, and localStorage tracking
- Latest announcement shown as a site-wide banner on the homepage

### 👤 Authentication & Profiles
- Email/password and Google OAuth sign-in via Supabase Auth
- User profiles with avatar upload, faculty, year, interests, and phone number
- Public profile pages showing a member's published articles
- Role-based access control: `admin`, `moderator`, `user`

### 💬 Messaging
- Direct messages between members
- Prayer group chat creation
- Real-time message delivery via Supabase Realtime

### 📊 Admin Dashboard
- Summary cards with sparkline trends
- Monthly activity bar chart (members + prayer requests)
- Prayer request status donut chart
- Manual data cleanup tool

---

## 🛠 Tech Stack

| Layer | Technology |
|---|---|
| **Framework** | React 18 + TypeScript 5 |
| **Build Tool** | Vite 5 |
| **Styling** | Tailwind CSS v3 + CSS Variables |
| **UI Components** | shadcn/ui (Radix UI primitives) |
| **Animation** | Framer Motion |
| **Backend / DB** | Supabase (PostgreSQL + Auth + Storage + Realtime) |
| **State / Fetching** | TanStack Query v5 |
| **Routing** | React Router DOM v6 |
| **Forms** | React Hook Form + Zod |
| **Markdown** | react-markdown + remark-gfm + rehype-raw |
| **Image Export** | html-to-image |
| **Charts** | Recharts |
| **Carousel** | Embla Carousel + Autoplay |
| **PWA** | vite-plugin-pwa + Workbox |
| **OG Tags** | react-helmet-async + Vercel serverless function |
| **Deployment** | Vercel |
| **Testing** | Vitest + Testing Library |
| **Linting** | ESLint + typescript-eslint |

### Typography
- **Headings**: DM Serif Display (elegant serif)
- **Body**: DM Sans (clean humanist sans-serif)

### Design Tokens
The site uses a custom CSS variable system rooted in a forest-green and warm-gold palette:

```css
--primary:    40 55% 55%   /* Warm Gold      */
--secondary:  153 40% 18%  /* Forest Green   */
--background: 40 33% 97%   /* Warm Cream     */
--foreground: 150 30% 10%  /* Deep Forest    */
```

---

## 📁 Project Structure

```
ucocsa/
├── api/
│   └── og-blog.js              # Vercel serverless: dynamic OG tags for blog posts
├── public/
│   ├── backgrounds/            # Hymn page background images
│   ├── favicon.png
│   ├── hymns-icon-192.png
│   ├── manifest.webmanifest
│   └── og-image.jpg
├── src/
│   ├── assets/                 # Static assets (hero-bg, logo)
│   ├── components/
│   │   ├── admin/              # Admin-specific chart components
│   │   ├── ui/                 # shadcn/ui component library
│   │   ├── AdminLayout.tsx     # Admin panel shell
│   │   ├── AdminSidebar.tsx
│   │   ├── CountdownTimer.tsx  # Next service countdown
│   │   ├── ExecutiveTeam.tsx   # Circular testimonials carousel
│   │   ├── Footer.tsx
│   │   ├── Layout.tsx          # Public page shell
│   │   ├── MarkdownEditor.tsx  # Rich markdown editor with toolbar
│   │   ├── Navbar.tsx          # Responsive nav with dropdowns
│   │   ├── NotificationBell.tsx
│   │   ├── PrayerComments.tsx
│   │   ├── SEO.tsx             # Helmet-based meta tag component
│   │   ├── SharePoster.tsx     # PNG poster generator
│   │   └── VerseOfTheDay.tsx   # NET Bible API integration
│   ├── contexts/
│   │   └── AuthContext.tsx     # Supabase auth state
│   ├── data/
│   │   └── backgrounds.ts      # Bundled hymn bg image paths
│   ├── hooks/
│   │   ├── use-mobile.tsx
│   │   ├── use-toast.ts
│   │   ├── useAdminCheck.ts    # RPC-based admin role check
│   │   └── useInstallPrompt.ts # PWA install prompt logic
│   ├── integrations/supabase/
│   │   ├── client.ts
│   │   └── types.ts            # Auto-generated DB types
│   ├── lib/
│   │   └── utils.ts
│   ├── pages/
│   │   ├── admin/              # All admin panel pages
│   │   │   ├── AdminAnnouncements.tsx
│   │   │   ├── AdminBlog.tsx
│   │   │   ├── AdminDashboard.tsx
│   │   │   ├── AdminEvents.tsx
│   │   │   ├── AdminGallery.tsx
│   │   │   ├── AdminHymns.tsx
│   │   │   ├── AdminMembers.tsx
│   │   │   ├── AdminPrayers.tsx
│   │   │   ├── AdminPrograms.tsx
│   │   │   └── AdminTeam.tsx
│   │   ├── About.tsx
│   │   ├── Announcements.tsx
│   │   ├── Auth.tsx
│   │   ├── Blog.tsx
│   │   ├── BlogPost.tsx
│   │   ├── Contact.tsx
│   │   ├── Dashboard.tsx
│   │   ├── Events.tsx
│   │   ├── Gallery.tsx
│   │   ├── Give.tsx
│   │   ├── Hymns.tsx           # Full hymn library app
│   │   ├── Index.tsx           # Homepage
│   │   ├── Messages.tsx
│   │   ├── NotFound.tsx
│   │   ├── Prayer.tsx
│   │   ├── Profile.tsx
│   │   └── Resources.tsx
│   ├── App.tsx                 # Router + providers
│   ├── index.css               # Tailwind + CSS variables
│   └── main.tsx                # PWA registration + root render
├── scripts/
│   ├── check-bucket.js         # Supabase storage debug
│   └── test-db.js              # DB connectivity test
├── vercel.json                 # Routing rewrites
├── vite.config.ts              # Vite + PWA config
└── tailwind.config.ts
```

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- A Supabase project (free tier works)

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/your-org/ucocsa.git
cd ucocsa

# 2. Install dependencies
npm install

# 3. Set up environment variables (see below)
cp .env.example .env

# 4. Start the development server
npm run dev
```

The app will be available at `http://localhost:8080`.

### Available Scripts

| Script | Description |
|---|---|
| `npm run dev` | Start development server |
| `npm run build` | Production build |
| `npm run build:dev` | Development build |
| `npm run preview` | Preview production build |
| `npm run lint` | Run ESLint |
| `npm run test` | Run Vitest tests once |
| `npm run test:watch` | Run Vitest in watch mode |

---

## 🔑 Environment Variables

Create a `.env` file in the root directory:

```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your-anon-key
```

> **Note:** These variables are prefixed with `VITE_` and are exposed to the browser. Never use your `service_role` key here. The anon key is safe to expose as all data access is protected by Supabase Row Level Security (RLS) policies.

---

## 🗺 Pages & Routes

| Route | Page | Auth Required |
|---|---|---|
| `/` | Homepage with hero, countdown, gallery carousel, blog preview | No |
| `/about` | About UCOCSA, mission/vision, executive team | No |
| `/events` | Events calendar + service programs | No |
| `/resources` | Bible study resources and links | No |
| `/prayer` | Prayer wall and submission form | No |
| `/blog` | Blog post grid | No |
| `/blog/:slug` | Individual blog post with comments | No |
| `/contact` | Contact form, map, socials | No |
| `/give` | Giving/offerings information | No |
| `/gallery` | Photo albums and gallery | No |
| `/hymns` | Full hymn library PWA | No |
| `/announcements` | Published announcements | No |
| `/auth` | Sign in / Sign up | No |
| `/profile` | Own profile & articles | Yes |
| `/profile/:id` | Public profile of any member | No |
| `/dashboard` | Member dashboard | Yes |
| `/messages` | Direct messages & prayer groups | Yes |
| `/admin` | Admin dashboard | Admin Only |
| `/admin/events` | Event management | Admin Only |
| `/admin/prayers` | Prayer moderation | Admin Only |
| `/admin/members` | Member directory & CSV export | Admin Only |
| `/admin/blog` | Blog post editor | Admin Only |
| `/admin/announcements` | Announcement management | Admin Only |
| `/admin/gallery` | Gallery & photo moderation | Admin Only |
| `/admin/programs` | Service program management | Admin Only |
| `/admin/team` | Executive team management | Admin Only |
| `/admin/hymns` | Hymn library management | Admin Only |

---

## 🔐 Admin Panel

The admin panel is accessible at `/admin` and is protected by role-based access control. Only users with the `admin` role (stored in the `user_roles` table) can access these pages.

The admin panel includes:

- **Dashboard** — site-wide statistics, charts, and a cleanup utility to remove past events and expired announcements
- **Events** — full CRUD for community events
- **Service Programs** — create and publish detailed Sunday and MidWeek orders of service, with an alert system for programs that haven't been updated
- **Prayer Requests** — review, approve, and archive prayer submissions
- **Members** — view all registered users and export the full member list as a CSV
- **Blog** — a rich full-page Markdown editor with cover image upload, author linking, category selection, and publish/unpublish controls
- **Announcements** — create announcements with optional expiry dates
- **Gallery** — create albums, bulk-upload photos, approve/reject member photo submissions, toggle highlight and publish status
- **Executive Team** — manage the team carousel shown on the homepage and About page, with photo upload
- **Hymns** — full hymn library CRUD, with a pending-approval queue for member-submitted hymns

---

## 🗄 Database Schema

The app uses the following Supabase tables:

| Table | Description |
|---|---|
| `profiles` | User profiles linked to `auth.users` |
| `user_roles` | Role assignments (`admin`, `moderator`, `user`) |
| `events` | Community events |
| `service_programs` | Detailed Sunday/MidWeek service programs |
| `announcements` | Published site announcements |
| `blog_posts` | Blog articles with Markdown content |
| `blog_comments` | Nested blog post comments |
| `blog_likes` | Post likes |
| `prayer_requests` | Prayer submissions |
| `prayer_comments` | Comments on prayer requests |
| `praise_reports` | Praise / answered prayer submissions |
| `praise_comments` | Comments on praise reports |
| `hymns` | Hymn library (title, verses, author, YouTube ID) |
| `hymn_backgrounds` | Admin-managed background images for the hymn page |
| `gallery_albums` | Photo albums |
| `gallery_photos` | Individual photos with approval status |
| `team_members` | Executive committee members |
| `conversations` | Direct message and group chat threads |
| `conversation_participants` | Members in each conversation |
| `messages` | Individual messages in conversations |

### Key RPC Functions

| Function | Description |
|---|---|
| `has_role(_user_id, _role)` | Returns boolean — used by the admin guard |

### Storage Buckets

| Bucket | Contents |
|---|---|
| `gallery` | User and admin gallery photos |
| `blog-images` | Blog post cover images and inline images |
| `avatars` | User profile photos |
| `team-members` | Executive team member photos |

---

## 📱 PWA & Hymns App

The Hymns section is configured as a standalone Progressive Web App, installable separately from the main site.

**PWA Configuration:**
- `start_url`: `/hymns`
- `scope`: `/hymns`
- `display`: `standalone`
- App name: **UCOCSA Hymns**

**Service Worker Strategy (Workbox):**
- Hymn data from Supabase: `NetworkFirst` with 4-second timeout and 30-day offline cache
- Images: `StaleWhileRevalidate` with 30-day cache
- Navigation fallback to `/hymns`

**Install Prompts:**
- Android/Chrome: Native `beforeinstallprompt` event with a popup and dismissal cooldown
- iOS Safari: Custom instructional popup (Share → Add to Home Screen)
- The PWA never shows install prompts inside Lovable's preview iframe

**Offline Capability:**
Users who have previously visited `/hymns` can access the full hymnal without an internet connection, which is critical for low-connectivity environments in Malawi.

---

## 🌐 Deployment

The project is deployed on **Vercel**. The `vercel.json` configures two routing rules:

```json
{
  "rewrites": [
    { "source": "/blog/:slug", "destination": "/api/og-blog" },
    { "source": "/(.*)",       "destination": "/index.html"  }
  ]
}
```

- All `/blog/:slug` requests are handled by the serverless function `api/og-blog.js`, which injects dynamic Open Graph meta tags (title, description, image) by fetching post data from Supabase before serving the SPA shell. This enables rich link previews on WhatsApp, Twitter/X, and Facebook.
- All other routes fall through to `index.html` for client-side routing.

### Deploy Your Own

1. Fork this repository
2. Create a new Vercel project and connect your fork
3. Add the environment variables (`VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY`) in the Vercel project settings
4. Deploy — Vercel will auto-build on every push to `main`

---

## 🤝 Contributing

Contributions are welcome! Here are a few ways you can help:

- **Suggest hymns** — Log in to the site and use the "Suggest" button in the Hymns library. Submissions go through an admin approval queue.
- **Bug reports** — Open an issue describing the bug, steps to reproduce, and expected behavior.
- **Feature requests** — Open an issue with the `enhancement` label.
- **Code contributions** — Fork the repo, create a feature branch, make your changes, and open a pull request.

### Code Style

- TypeScript — strict mode is relaxed (`noImplicitAny: false`) to allow pragmatic typing
- Components use function declarations and `React.FC` where appropriate
- Mutations use TanStack Query's `useMutation`, queries use `useQuery`
- Tailwind utility classes are preferred; custom CSS is kept in `index.css`

---

## 📜 License

This project is the property of the **University of Malawi Church of Christ Student Association (UCOCSA)**. All rights reserved.

---

<div align="center">

Built with ❤️ for the UCOCSA community · [ucocsa.vercel.app](https://ucocsa.vercel.app)

*"Let everything that has breath praise the Lord." — Psalm 150:6*

</div>
