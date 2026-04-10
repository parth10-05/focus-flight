# AeroFocus

AeroFocus is a mission-themed deep-work platform with:

- A React + Vite web app for session planning and tracking
- A Chrome Extension (Manifest V3) for browser-domain blocking
- Supabase for authentication and persistence

This README is the high-level project summary for maintainers. For implementation-level handoff details, see [TECHNICAL_REPORT.md](TECHNICAL_REPORT.md).

## Product Summary

The core user flow is:

1. Authenticate in the web app.
2. Configure a focus session in PreFlight (route, duration, blocked domains).
3. Start the flight and track a live mission timer in ActiveFlight.
4. Let the extension enforce blocked domains during the active session.
5. End the session and review outcomes in Debrief, Logbook, and Analytics.

## Monorepo Overview

- [apps/web](apps/web): React application (main product UI)
- [apps/extension](apps/extension): Chrome extension runtime (blocker + bridge)
- [packages/config](packages/config): shared config exports
- [supabase/schema.sql](supabase/schema.sql): database schema and SQL function
- [supabase/policies.sql](supabase/policies.sql): RLS toggles and policy bootstrap

Workspace is managed with pnpm workspaces from [pnpm-workspace.yaml](pnpm-workspace.yaml).

## Tech Stack

- Frontend: React 18, React Router v6, Zustand, Tailwind CSS, Vite
- Backend-as-a-service: Supabase (Auth, PostgREST, Realtime)
- Extension platform: Chrome Extension Manifest V3, Declarative Net Request
- Language: TypeScript-first codebase with JS mirrors in several folders

## Architecture at a Glance

### Web App Responsibilities

- Authentication and route protection
- Session creation and lifecycle control
- Mission telemetry UI (timer, synthetic metrics, status)
- Reporting pages (debrief, logbook, analytics)
- Session sync to extension via runtime message bridge

### Extension Responsibilities

- Receives auth session and polls Supabase for active flights
- Builds/removes dynamic blocking rules based on `blocked_sites`
- Redirects blocked navigation to `blocked.html`
- Increments distraction counter when blocked page is shown
- Auto-completes expired flights and clears rules

### Supabase Responsibilities

- Stores flights, blocked domains, session logs, and user profile defaults
- Exposes realtime updates for flight state changes
- Exposes RPC function `increment_distractions(flight_id uuid)`

## Current Data Model

Key tables in [supabase/schema.sql](supabase/schema.sql):

- `flights`: session metadata (`origin`, `destination`, `duration`, `status`, timestamps)
- `blocked_sites`: domains associated with a flight
- `sessions_log`: session outcomes (`actual_duration`, `distractions_blocked_count`)
- `user_profiles`: display name and saved blocked-site defaults

## Quick Start

1. Install dependencies:

```bash
npx pnpm@10.28.0 install
```

2. Configure env files:

- Web: copy [apps/web/.env.example](apps/web/.env.example) to `apps/web/.env`
- Extension: copy [apps/extension/.env.example](apps/extension/.env.example) to `apps/extension/.env`

3. Start web app:

```bash
npm run dev
```

4. Load extension:

1. Open `chrome://extensions`
2. Enable Developer mode
3. Click Load unpacked
4. Select [apps/extension](apps/extension)

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

Optional:

- `EXT_WEB_APP_URL` (used by popup quick-action)

## Common Commands

Run from repository root:

```bash
# Web development
npm run dev

# Web production build
npx pnpm@10.28.0 -C apps/web build

# Web production preview
npx pnpm@10.28.0 -C apps/web preview

# If pnpm warns about ignored scripts
npx pnpm@10.28.0 approve-builds
```

## Deployment (Web on Vercel)

Recommended settings:

- Root Directory: `apps/web`
- Install Command: `pnpm install --frozen-lockfile`
- Build Command: `pnpm run build`
- Output Directory: `dist`

Required Vercel env vars:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

Optional Vercel env var:

- `VITE_EXTENSION_ID`

## Known Risks and Active Gaps

- Build stability: current notes indicate intermittent web build failure related to Supabase realtime type resolution.
- Data security posture: [supabase/policies.sql](supabase/policies.sql) disables RLS for all current tables.
- Ownership filtering mismatch: some auth-aware queries assume `flights.user_id`, but that column is not present in [supabase/schema.sql](supabase/schema.sql).
- Extension polling scope: current extension poll fetches active flights without an explicit user filter.

These items are tracked in more detail in [TECHNICAL_REPORT.md](TECHNICAL_REPORT.md).

## Mobile App (apps/mobile)

- AeroFocus includes a dedicated Expo + Expo Router mobile application in [apps/mobile](apps/mobile).
- The mobile app supports mission planning, active-session HUD, logbook/debrief, profile settings, reminders, and Android app-blocking integration.
- Native capabilities (background fetch, notifications, accessibility service integration) require native builds, not Expo Go.
- Full setup and EAS build instructions are documented in [apps/mobile/README.md](apps/mobile/README.md).

## Key File Pointers

- App routing and auth gate: [apps/web/src/App.tsx](apps/web/src/App.tsx)
- Flight domain service: [apps/web/src/services/flightService.ts](apps/web/src/services/flightService.ts)
- Session store: [apps/web/src/store/useFlightStore.ts](apps/web/src/store/useFlightStore.ts)
- Extension runtime logic: [apps/extension/background.js](apps/extension/background.js)
- Web-extension bridge: [apps/web/src/lib/extensionBridge.ts](apps/web/src/lib/extensionBridge.ts)
