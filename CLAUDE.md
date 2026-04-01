# Wonder-Order (working name: Ordrd)

## What This Is
Multi-tenant restaurant ordering platform. One deployment hosts multiple restaurant clients, each with their own database, theme, and landing page. Platform admin manages all clients from `/platform`.

## Architecture
- **Framework**: Next.js 16 (App Router), TypeScript, SCSS
- **Database**: MongoDB via Mongoose. Platform DB (`wonder_platform`) + per-client tenant DBs (`wonder_WO00001`, etc.)
- **Auth**: NextAuth.js with JWT. Three providers: `platform` (admin), `restaurant` (owner/kitchen), `customer`
- **Multi-tenant**: `src/utils/database/tenantConnect.ts` manages per-client DB connections. `tenantHelper.ts` resolves session -> tenant models
- **Theme**: CSS variables (`--wo-*`) in `src/utils/styles/theme.scss`. Light/dark via `prefers-color-scheme`. Brand colour from xtreme-ui `themeController()`
- **Linting**: Biome (`pnpm lint`)
- **Package manager**: pnpm only

## Current Branch: `tailwind`
Migrating away from xtreme-ui to Tailwind CSS + shadcn/ui (or custom components). The `main` branch has the working xtreme-ui version.

## Pending Migration: xtreme-ui Removal
xtreme-ui is used in ~50 files. Components to replace:
- **Button** (25+ files) - most used
- **Icon** (12 files) - Font Awesome icon wrapper
- **Textfield** (7 files) - form input
- **Spinner** (6 files) - loading indicator
- **Lottie** (5 files) - animation player
- **Avatar** (2 files)
- **ActionCard** (1 file)
- **ThemePicker/ThemeSelect** (1 file) - colour picker
- **XProvider/useXTheme/themeController** (6 files) - theme system
- **Gliff** (1 file) - font loader
- **Utilities**: `capitalize`, `isEqual`, `isValidThemeColor`, `useScreenType`

The theme system (`themeController`, `XProvider`, `useXTheme`) is the hardest part - it injects CSS variables for brand colours. Need to replace with our own CSS variable injection.

## Key Files
- `src/utils/database/connect.ts` - Platform DB connection
- `src/utils/database/tenantConnect.ts` - Per-client DB connections
- `src/utils/database/tenantHelper.ts` - Session-to-tenant resolver
- `src/utils/database/models/tenant.ts` - Tenant model factory
- `src/utils/database/schemas/` - Mongoose schemas (shared across DBs)
- `src/utils/database/models/platform/` - Platform models (Client, PlatformAdmin, ClientTheme, FeatureFlags, Counter)
- `src/utils/config/constants.ts` - App name, locale defaults
- `src/utils/styles/theme.scss` - CSS variable theme system (--wo-*)
- `src/utils/styles/templates/scroll.scss` - Snap scroll + reveal animations
- `src/utils/hooks/useScrollReveal.ts` - IntersectionObserver for scroll reveals
- `src/proxy.ts` - Route protection middleware
- `src/utils/helper/authHelper.ts` - NextAuth config with 3 providers

## Routes
- `/` - Main homepage (hero + login)
- `/platform` - Platform admin dashboard
- `/platform/login` - Platform admin login (also works from main login)
- `/platform/clients/new` - Create restaurant client
- `/platform/clients/[clientId]` - Client detail (features, password reset, delete)
- `/[restaurant]` - Restaurant landing page (hero + footer)
- `/[restaurant]?tab=menu` - Customer menu page
- `/[restaurant]?tab=menu&table=1` - Menu with ordering enabled
- `/dashboard` - Restaurant admin dashboard
- `/scan` - QR code scanner
- `/kitchen` - Kitchen display (WIP)

## Dev Setup
```bash
pnpm install
# .env.local needs: MONGODB_URI, NEXTAUTH_URL, NEXTAUTH_SECRET, NEXT_PUBLIC_SITE_URL
pnpm play  # dev server on port 3000
```

## Seed Platform Admin
```bash
curl -X POST http://localhost:3000/api/platform/seed -H "Content-Type: application/json" -d '{"email":"you@example.com","password":"pass","name":"Name"}'
```

## User Preferences
- Mobile-first design focus
- Australian market (default +61 dial code, $ currency)
- Parallax scroll: snap on mobile (touch), smooth on desktop (mouse)
- Login: single form that tries restaurant first, then platform admin
- Keep it simple -- don't over-engineer or add unnecessary sections
- No Indian references (was forked from Indian project)
- Currency symbol via CSS variable `--wo-currency` (overridable per client)
- Phone input: auto-detect country flag from timezone
- Tables: simple numbered system with slider, QR codes auto-generated
- Auto-accept orders: toggle per restaurant
