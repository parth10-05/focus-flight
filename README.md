# AeroFocus

AeroFocus is a focus-session app with:

- Web dashboard (React + Vite)
- Chrome extension for blocking distracting domains
- Supabase for auth and data

## What Is AeroFocus?

AeroFocus is a mission-style deep-work system that helps users run distraction-free focus sessions.

- Plan a session in the web app (duration, blocked sites, route preset or custom mission)
- Start the session and track live status (active flight, timer, telemetry-like metrics)
- Automatically block configured distracting domains through the Chrome extension
- End the session and review history in logbook, debrief, and analytics views

## Quick Start

1. Install deps

```bash
npx pnpm@10.28.0 install
```

2. Configure env files

- Web: copy [apps/web/.env.example](apps/web/.env.example) to `apps/web/.env`
- Extension: copy [apps/extension/.env.example](apps/extension/.env.example) to `apps/extension/.env`

3. Run web app

```bash
npm run dev
```

4. Load extension

- Open `chrome://extensions`
- Enable Developer mode
- Click Load unpacked
- Select [apps/extension](apps/extension)

## Project Structure

- [apps/web](apps/web): React web app
- [apps/extension](apps/extension): Chrome extension (Manifest V3)
- [packages/config](packages/config): shared config exports
- [supabase/schema.sql](supabase/schema.sql): database schema
- [supabase/policies.sql](supabase/policies.sql): RLS/policy setup

## Environment Variables

### Web (`apps/web/.env`)

Required:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

Optional:

- `VITE_EXTENSION_ID`

### Extension (`apps/extension/.env`)

Required:

- `EXT_SUPABASE_URL`
- `EXT_SUPABASE_ANON_KEY`

## Common Commands

From repo root:

```bash
# Web dev
npm run dev

# Web production build
npx pnpm@10.28.0 -C apps/web build

# Preview build
npx pnpm@10.28.0 -C apps/web preview
```

## Supabase Setup

Run SQL files in this order:

1. [supabase/schema.sql](supabase/schema.sql)
2. [supabase/policies.sql](supabase/policies.sql)

## Vercel Deployment (Web)

Use these settings:

- Root Directory: `apps/web`
- Install Command: `pnpm install --frozen-lockfile`
- Build Command: `pnpm run build`
- Output Directory: `dist`

Set env vars in Vercel:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `VITE_EXTENSION_ID` (optional)

## Notes

- Shared app shell/navbar is in [apps/web/src/components/layouts/AppShell.tsx](apps/web/src/components/layouts/AppShell.tsx).
- Preset routes live in [apps/web/src/data/flightRoutes.ts](apps/web/src/data/flightRoutes.ts).
- If pnpm warns about ignored scripts, run:

```bash
npx pnpm@10.28.0 approve-builds
```
