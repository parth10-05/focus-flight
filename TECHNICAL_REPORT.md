# AeroFocus Technical Report (Developer Handoff)

Last updated: 2026-04-10

## 1. Executive Summary

AeroFocus is a monorepo containing a focus-session web product and a supporting Chrome extension.

- Web app: mission-planning and session lifecycle UX
- Extension: browser-domain blocking and distraction telemetry capture
- Backend: Supabase for auth, persistence, and realtime updates

Primary strength:
- Clean separation between product surfaces (web vs extension) with a simple bridge contract.

Primary risk:
- Current data access and ownership controls are incomplete (RLS disabled, user ownership assumptions not fully implemented).

## 2. Repository and Ownership Map

Root-level workspace:
- `apps/web`: Product UI, auth, session orchestration, analytics views
- `apps/extension`: Blocking runtime and web-to-extension message handling
- `packages/config`: Shared config exports for Supabase URL/key fallback
- `supabase`: SQL schema, policies, and helper RPC

Package manager/runtime:
- pnpm workspace with package manager pinned to `pnpm@10.28.0`
- Root script `npm run dev` runs web workspace dev server

## 3. Runtime Architecture

## 3.1 Web Runtime

Main app entry and routing:
- `apps/web/src/main.tsx` mounts app
- `apps/web/src/App.tsx` defines route tree and auth guard

Auth/session behavior:
- `supabase.auth.getSession()` checked at startup
- `onAuthStateChange` updates local auth gate state
- Session tokens are forwarded to extension via `sendToExtension`

State:
- `apps/web/src/store/useFlightStore.ts` (Zustand)
- Store handles current flight, blocked domains, and lifecycle actions

Service layer:
- `apps/web/src/services/flightService.ts`
- `createFlight`, `getActiveFlight`, `completeFlight`, realtime subscription helper

Feature pages:
- PreFlight: create a flight, choose route, select blocked domains
- ActiveFlight: live timer, status controls, realtime updates, auto-complete on countdown end
- Debrief: single-flight summary from `flights` + `sessions_log`
- Logbook: paginated historical sessions
- Analytics: aggregate metrics and weekday distribution

## 3.2 Extension Runtime

Core service worker:
- `apps/extension/background.js`

Responsibilities:
- Load Supabase config from extension `.env`
- Receive session payloads (`SET_SESSION`, `CLEAR_SESSION`)
- Poll active flight every 15s
- Apply dynamic DNR redirect rules for blocked domains
- Clear rules if no active session/flight
- Auto-complete expired flights and initialize `sessions_log` when required
- Increment distraction count when blocked page is reached

Bridge and popup:
- `apps/extension/bridge.js`: forwards web `window.postMessage` events to runtime
- `apps/extension/popup.js`: displays active-flight timer and opens web UI quick actions

Manifest characteristics:
- Manifest V3
- Permissions: storage, tabs, scripting, declarativeNetRequest
- Host permissions: `<all_urls>`
- Content script includes local dev and deployed web origins

## 3.3 Web <-> Extension Integration Contract

From web to extension:
- `SET_SESSION`: `{ access_token, refresh_token, user_id }`
- `CLEAR_SESSION`
- `CHECK_FLIGHT_EXPIRY`

Transport:
- Preferred: `chrome.runtime.sendMessage(extensionId, message)` when extension id is configured
- Fallback: `window.postMessage` with source `AEROFOCUS_WEB_BRIDGE` consumed by extension content script

Integration risk:
- If `VITE_EXTENSION_ID` is not configured, fallback bridge path must be active in current page context.

## 4. Data Model and SQL Layer

Source files:
- `supabase/schema.sql`
- `supabase/policies.sql`

Tables:
- `flights`
  - `id`, `origin`, `destination`, `duration`, `start_time`, `end_time`, `status`
- `blocked_sites`
  - `id`, `flight_id` FK, `domain`
- `sessions_log`
  - `id`, `flight_id` FK, `actual_duration`, `distractions_blocked_count`
- `user_profiles`
  - `user_id` FK -> `auth.users(id)`, `display_name`, `last_blocked_sites`, `created_at`, `updated_at`

Function:
- `increment_distractions(flight_id uuid)` increments matching row in `sessions_log`

Observed schema mismatch:
- Auth flow in web checks active flights by `flights.user_id`, but `user_id` column is currently absent from table DDL.

## 5. Security and Access Control Status

Current posture:
- `supabase/policies.sql` disables RLS on all current tables.

Impact:
- Table reads/writes are not constrained by per-user ownership policy.
- Extension poll currently fetches any `status=active` flight in scope of provided key/session.

Recommended remediation sequence:
1. Add ownership fields (`flights.user_id` and cascaded ownership strategy for related tables).
2. Backfill existing data where possible.
3. Enable RLS on all user data tables.
4. Add explicit SELECT/INSERT/UPDATE/DELETE policies based on `auth.uid()`.
5. Update extension poll query to include owner/user filter.
6. Regression test web and extension against least-privilege policies.

## 6. Known Technical Issues

1. Build reliability note indicates Supabase realtime type resolution failures in web production build.
2. Data ownership model is partially implemented in app logic but not in DB schema.
3. RLS disabled globally in current SQL policy file.
4. Mixed TS and JS mirror files increase maintenance overhead and drift risk.

## 7. Operational Runbook

## 7.1 Local Setup

1. Install dependencies:
```bash
npx pnpm@10.28.0 install
```
2. Configure env files for web and extension from examples.
3. Start web app:
```bash
npm run dev
```
4. Load extension unpacked from `apps/extension`.

## 7.2 Functional Smoke Test

1. Sign up/login in web app.
2. Create preflight with at least one blocked domain.
3. Confirm redirect to active flight page.
4. Open blocked domain in browser and verify extension redirects to blocked page.
5. End session and verify debrief/logbook/analytics update.

## 7.3 Supabase Initialization

Apply SQL in order:
1. `supabase/schema.sql`
2. `supabase/policies.sql`

## 8. Testing Coverage and Gaps

Current state:
- No explicit automated unit/integration/e2e test suite observed in repository root scripts.

Suggested minimum test baseline:
1. Unit tests for `flightService` error paths and active-flight guard.
2. Integration tests for auth redirect flow in `App.tsx` and `Auth.tsx`.
3. Extension integration test harness for message handling and rule updates.
4. SQL policy tests for ownership and row isolation once RLS is enabled.

## 9. Next Developer Priorities

P0 (security and correctness):
1. Introduce `flights.user_id` and ownership propagation.
2. Re-enable RLS and ship policies.
3. Ensure extension poll and web queries are ownership-scoped.

P1 (stability):
1. Resolve Supabase realtime type/build issue.
2. Add CI checks for web build and SQL drift.

P2 (maintainability):
1. Consolidate JS/TS duplication strategy (either generation or migration completion).
2. Introduce a service contract doc for bridge message types.
3. Add developer-facing architecture diagrams.

## 10. Handoff Checklist

Before transfer:
1. Confirm environment examples are current for both app surfaces.
2. Confirm Vercel settings in README still match production.
3. Validate extension allowed origins match deployed web URL(s).
4. Run full smoke test with fresh user account.
5. Record unresolved blockers in issue tracker with owner and ETA.

During transfer session:
1. Walk through web route map and auth guard behavior.
2. Walk through extension poll/rule lifecycle in `background.js`.
3. Explain current data-security gap and planned remediation sequence.
4. Share deployment and rollback steps for web and SQL migrations.

After transfer:
1. New owner runs setup and smoke test independently.
2. New owner validates Supabase console access and migration workflow.
3. New owner signs off on P0 execution plan.

## 11. Reference File Index

Core app and routing:
- `apps/web/src/App.tsx`
- `apps/web/src/main.tsx`

Business logic:
- `apps/web/src/services/flightService.ts`
- `apps/web/src/services/userProfileService.ts`
- `apps/web/src/store/useFlightStore.ts`

Extension integration:
- `apps/web/src/lib/extensionBridge.ts`
- `apps/extension/background.js`
- `apps/extension/bridge.js`
- `apps/extension/popup.js`
- `apps/extension/manifest.json`

Database:
- `supabase/schema.sql`
- `supabase/policies.sql`
