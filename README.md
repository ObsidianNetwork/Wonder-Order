
# Wonder-Order

A multi-tenant, AI-powered contactless restaurant ordering platform. Built for restaurant owners who want a modern, mobile-first ordering experience for their customers -- managed from a single platform.

[![Next JS](https://img.shields.io/badge/Next.js_16-black?style=flat-square&logo=next.js&logoColor=white)](https://nextjs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=flat-square&logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![SCSS](https://img.shields.io/badge/SCSS-CC6699?style=flat-square&logo=sass&logoColor=white)](https://sass-lang.com/)

> Originally forked from [OrderWorder](https://github.com/itzzritik/OrderWorder). Rebuilt as a multi-tenant SaaS platform.

---

## How It Works

Wonder-Order is a **platform** that hosts multiple restaurant websites from a single deployment. Each restaurant gets:

- Their own landing page at `/{slug}`
- A mobile-first menu with QR code or manual table selection
- An admin dashboard to manage menu items, tables, orders, and settings
- Their own isolated database (full data separation)
- Customisable theme (colours, branding, currency)

**You** manage all clients from a platform admin dashboard at `/platform`.

---

## Architecture

```
Single Server (e.g. Unraid, VPS)
├── MongoDB
│   ├── wonder_platform         Platform admin, client configs, themes
│   ├── wonder_WO00001          Restaurant A's data (isolated)
│   ├── wonder_WO00002          Restaurant B's data (isolated)
│   └── ...
│
└── Wonder-Order (Next.js)
    ├── /platform               Your admin dashboard
    ├── /{slug}                 Restaurant landing page
    ├── /{slug}?table=1         Direct to menu (QR code flow)
    ├── /dashboard              Restaurant owner's dashboard
    └── /kitchen                Kitchen display
```

---

## Features

### Platform Admin (`/platform`)
- Create and manage restaurant clients
- Each client gets a unique ID (WO-00001) and optional ABN
- Activate, suspend, or cancel clients
- Reset client passwords
- Toggle feature flags per client (AI chat, QR scanning, online payment, etc.)
- Delete clients (removes all data including database)

### Restaurant Landing Page (`/{slug}`)
- Parallax hero section with cover image and restaurant branding
- Mobile-first design with system light/dark mode
- Customisable per client via CSS variables

### Customer Ordering
- **QR Code**: Scan table QR code to go straight to menu with ordering
- **Manual Entry**: Enter table number from the menu page
- **Browse Mode**: View the menu without a table (no ordering)
- Phone number input with auto-detected country flag and dial code
- Add items to cart, place orders, track order status

### Restaurant Dashboard (`/dashboard`)
- **Orders**: Accept/reject incoming orders, manage active orders, complete orders, view history with invoices
- **Menu Editor**: Add, edit, delete menu items. Manage categories. Toggle item visibility
- **Tables**: Set table count with a slider. Auto-generated QR codes for each table
- **Settings**: Edit restaurant profile, change password, pick theme colour
- **Auto-Accept**: Toggle to skip manual order approval (orders go straight to kitchen)

### AI Assistant
- Multi-provider AI (Groq, Cerebras, Google, SiliconFlow) via Vercel AI SDK
- Context-aware: dynamically injects live menu data into prompts
- Recommends menu items, answers ingredient/allergen questions
- Per-client feature flag to enable/disable

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript |
| Database | MongoDB (Mongoose) |
| Auth | NextAuth.js (JWT) |
| Styling | SCSS + CSS Variables (light/dark mode) |
| AI | Vercel AI SDK (multi-provider) |
| UI Library | XtremeUI |
| Linting | Biome |
| Package Manager | pnpm |

---

## Getting Started

### Prerequisites
- Node.js 18+
- pnpm (`npm i -g pnpm`)
- MongoDB instance

### Setup

```bash
# Install dependencies
pnpm install

# Create .env.local
cp .env.example .env.local  # or create manually (see below)

# Start dev server
pnpm play
# Open http://localhost:3000
```

### Environment Variables

```env
MONGODB_URI=mongodb://user:pass@host:port/dbname?authSource=admin
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=<random-string>
NEXT_PUBLIC_SITE_URL=http://localhost:3000

# AI providers (at least one required for AI chat)
AI_GROQ_KEY=<key>
AI_CEREBRAS_KEY=<key>
AI_GOOGLE_KEY=<key>
AI_SILICONFLOW_KEY=<key>
```

### First Run

1. Start the dev server: `pnpm play`
2. Seed the platform admin:
   ```bash
   curl -X POST http://localhost:3000/api/platform/seed \
     -H "Content-Type: application/json" \
     -d '{"email":"you@example.com","password":"yourpass","name":"Your Name"}'
   ```
3. Go to `http://localhost:3000/platform/login` and sign in
4. Create your first restaurant client from the platform dashboard
5. Visit `http://localhost:3000/{slug}` to see the restaurant

### Scripts

| Command | Description |
|---------|-------------|
| `pnpm play` | Dev server (port 3000) |
| `pnpm dev` | Dev server via Doppler (port 3050) |
| `pnpm build` | Production build |
| `pnpm start` | Start production server |
| `pnpm lint` | Lint and auto-fix (Biome) |
| `pnpm clean` | Reset node_modules, lockfile, .next and reinstall |

---

## Multi-Tenant Theming

Each client's appearance is controlled by CSS variables:

```css
:root {
  --wo-currency: '$';        /* Currency symbol */
  --wo-surface-0: #ffffff;   /* Page background */
  --wo-surface-1: #f8f8fa;   /* Card background */
  --wo-surface-border: #e8e8ee;
  --wo-text-primary: #1a1a2e;
  --wo-radius-lg: 16px;
  /* ... and more */
}
```

- **Light/dark mode**: Follows system preference automatically
- **Brand colour**: Set per client via the platform dashboard theme picker
- **Custom CSS**: Inject arbitrary CSS overrides per client
- **Currency**: Configurable per client (`$`, `€`, `£`, `¥`, etc.)

---

## Project Structure

```
src/
├── app/
│   ├── [restaurant]/        Customer-facing restaurant pages
│   ├── dashboard/           Restaurant admin dashboard
│   ├── kitchen/             Kitchen display (WIP)
│   ├── platform/            Platform admin dashboard
│   ├── scan/                QR code scanner
│   └── api/
│       ├── admin/           Restaurant admin API (menu, orders, tables, etc.)
│       ├── platform/        Platform admin API (clients, themes, features)
│       ├── order/           Customer order API
│       ├── chat/            AI chat API
│       └── auth/            NextAuth
├── components/              Shared React components
├── utils/
│   ├── database/
│   │   ├── schemas/         Mongoose schemas (shared across tenant DBs)
│   │   ├── models/
│   │   │   ├── platform/    Platform DB models (Client, Theme, etc.)
│   │   │   └── tenant.ts    Tenant model factory
│   │   ├── connect.ts       Platform DB connection
│   │   ├── tenantConnect.ts Per-client DB connections (cached)
│   │   └── tenantHelper.ts  Session-to-tenant resolver
│   ├── config/              App constants
│   ├── styles/              Theme variables, templates
│   └── ai/                  AI prompt engineering
└── proxy.ts                 Route protection middleware
```

---

## License

This project is for private/commercial use by the repository owner.
