# Styling & UI Rules — Etlala

**Last updated:** 2026-04-27

**Canonical spec:** [DESIGN.md](../../../DESIGN.md) (v2) at repo root. This file is a *compressed* snapshot for the knowledge base; after visual or token changes, sync both `DESIGN.md` (if applicable) and this file.

## Theme & tokens
- MUI theming: `src/theme/index.ts`
- Code tokens: `src/theme/tokens.ts` (`premiumTokens` — light-first; dark derived in theme)
- Global styles: `src/index.css`
- If `DESIGN.md` and `tokens.ts` disagree, **reconcile** — usually `DESIGN.md` defines intent; `tokens.ts` is implementation.

## Atmosphere (from DESIGN.md)
- B2B ops / engineering: trust, calm, clarity; **Swiss + Soft UI** + subtle biophilic olive green.
- **Background:** warm beige + subtle dot grid + light radial; **no** default Unsplash on login.
- **Cards:** 16px radius, **4px colored strip** on inline-start, elevation 1–2.
- **Avoid** purple/pink "AI" gradients.

## Color roles (summary)
- Primary: olive greens (`#3d4f3d` / hover `#2f3d2f` in spec); surfaces `#ffffff` / page `#f4f1ea`; text `#1e2a1e` / muted `#5c6b5c`.
- Dark mode: ~`#141916` bg, ~`#1a221a` paper, text `#eceae4`.

## Typography
- **Arabic UI:** Cairo, Tajawal (weights 500–800).
- **Numbers / short EN:** Outfit where needed.

## Terminology (UI copy)
- User-facing **صافي النسبة** replaces «الربح» for the earnings line; home stat card shows **full amount** + optional margin % (see `DESIGN.md` §8).

## Components
- Buttons: primary contained; theme يفرض **minHeight** ~48 افتراضياً، **44** لـ `sizeSmall` و**52** لـ `sizeLarge`؛ `text` له hover خفيف؛ `IconButton` **44×44** (صغير 40)؛ تعطيل أوضح (`opacity` ~0.55–0.58).
- `PageScaffold`: gradient header + 1px cream bottom line + top shine.
- Tables: muted header, row hover.
- Icons: MUI only; **no emoji** in critical alerts.

## Layout
- Spacing scale: 4, 8, 12, 16, 24, 32.
- Container: `maxWidth="sm"` for mobile-first shell.
- Bottom bar: 70px + safe area.

## Accessibility / UX
- Contrast 4.5:1+; `prefers-reduced-motion`; 44px touch targets.

## When to update this file
Update after you change colors, typography, component patterns, layout shell, or `DESIGN.md` / theme files.
