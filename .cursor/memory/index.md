# Memory Index — Etlala (إطلالة)

## Current state

React + Vite + TypeScript PWA; MUI; Firebase. Arabic RTL — **mobile-first** (<1200px) + **desktop shell** (≥lg sidebar) from same codebase.

## Recent sessions

- 2026-08-12 — Desktop professional layout (sidebar, xl content) without changing mobile UX → `sessions/2026-08-12.md` instant QuickExpenseSheet FAB, lightweight ExpensesPage (no recharts, 30-row pagination), clean-white LoginPage, full-ratio hero; **root cause of "nothing changed" = site hosted on Vercel `etlala.ly`, local work undeployed → deployed to production + added `vercel.json` SPA rewrites** → `sessions/2026-07-06.md`
- 2026-07-05 — PDF upgrade from rkeaz-group (pdfKit, lazy load, Tajawal, branded headers) → `sessions/2026-07-05.md`
- 2026-04-27 — Bootstrapped `.cursor/memory` + knowledge-base rule → `sessions/2026-04-27.md`

## Decisions (ADRs)

- (None yet — add `decisions/ADR-001-<slug>.md` for durable choices.)

## Known bugs / gotchas

- (None — add `bugs/<slug>.md` when needed.)

## Codebase map

- [maps/codebase.md](maps/codebase.md) — directory layout, entry points, conventions
- [maps/styling.md](maps/styling.md) — styling rules summary + pointers to `DESIGN.md` / theme

## Data model

- (Add `maps/data-model.md` when you document Firestore shape.)
