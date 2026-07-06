# Styling & UI Rules — Etlala

**Last updated:** 2026-07-06

**Canonical spec:** [DESIGN.md](../../../DESIGN.md) (v2) at repo root. This file is a *compressed* snapshot for the knowledge base; after visual or token changes, sync both `DESIGN.md` (if applicable) and this file.

## Theme & tokens
- MUI theming: `src/theme/index.ts`
- Code tokens: `src/theme/tokens.ts` (`premiumTokens` — light-first; dark derived in theme)
- Global styles: `src/index.css`
- If `DESIGN.md` and `tokens.ts` disagree, **reconcile** — usually `DESIGN.md` defines intent; `tokens.ts` is implementation.

## Atmosphere (2026-07 refresh — iOS-native premium)
- B2B ops / engineering: trust, calm, clarity; **iOS clean-white + hairline** language (rkeaz-group quality traits, Etlala colors).
- **Background:** clean white `#F8F8F8` (`premiumTokens.background`), very subtle ambient radial washes (`.etlala-app-ambient`, opacities ≤0.03).
- **Cards:** white, **1px hairline border** `rgba(31,37,33,0.06)` + double soft shadow (`0 1px 2px ~0.03` + `0 6–8px 20–26px ~0.04–0.05`), radius **20–22px** with subtle accent-tinted borders (no hard side stripes).
- **Avoid** heavy drop shadows, warm beige card gradients (replaced by `#FFFFFF → #FAFAF8`), purple/pink gradients.

## Color roles (unchanged palette)
- Primary olive green `#2F3E34` (`primaryDark #243028`), accent gold `#C2B280`; page `#F8F8F8`; paper `#FFFFFF`.
- Dark mode: `#121814` bg, `#1A221C` paper, text `#F4F1EC`.
- `containedPrimary` is now a **solid fill** (backgroundColor, not gradient) so page-level `bgcolor` overrides work.

## Typography
- **Arabic UI:** Cairo, Tajawal (weights 500–800). **Numbers:** Outfit + `tabular-nums`.

## RTL critical rule
- **No rtl stylis cache** → MUI `Stack` margin spacing lands on the wrong side (elements glue/overlap). Fixed globally: `MuiStack.defaultProps.useFlexGap = true` in `src/theme/index.ts`. Keep using Stack/gap; never rely on margin-based spacing for RTL rows.
- **Date pickers:** Arabic dayjs locale injects RLM marks → scrambled dates. Always set `format="DD/MM/YYYY"` + `inputProps: { dir: 'ltr', style: { textAlign: 'end' } }` on `DatePicker` text fields (done in Expenses/Debts/NewInvoice).

## Components
- Buttons: root minHeight 48 / radius 18px; `sizeSmall` 40 / 14px; `sizeLarge` 52 / 20px; press `scale(0.97)`.
- Header action button on dark hero: `etlalaHeroActionButtonSx` (light cream `rgba(243,237,223,0.98)`, dark-green text, radius 12px, minHeight 38, thin accent border + light inset). **Uses `background` shorthand** to beat containedPrimary. Used on Clients/Expenses/Users/Debts/Letters.
- `IconButton`: fully circular (999px), 44×44 (small 40×40). Home header buttons: 42px, quiet tint `alpha(#1F2521, 0.05)`, hairline border, **no drop shadow**, gap 10px.
- Chips: pill `borderRadius 999px`, weight 600.
- Inputs: radius 16px; bottom sheets/dialogs use clean radii (`24px` desktop, `26px` sheet top), hairline border, and calm neutral gradient surfaces.
- `EtlalaAccentSurface` / `EtlalaNavRow`: radius 20px, accent-tinted hairline border (no inline-start stripe), soft double shadow, hover only on `(hover:hover)`.
- Section headings (`EtlalaSectionTitle`) now use a compact accent dot + halo instead of vertical side bars.
- `EtlalaEmptyState`: white, **dashed hairline**, no shadow.
- Expense list rows: 3-line anatomy — title+amount / chip+client / hairline footer (date • invoice | creator).
- Expenses page is **lightweight**: no recharts (pure-CSS top-categories bars), list paginated 30 rows + «عرض المزيد» pill; new-expense form = shared `QuickExpenseSheet`.
- Login page: clean white (bg default), gold arch logo (`/logo-arch-gold.jpg`) in 108px white squircle (radius 30px), fields 54px filled `#F4F4F2` radius 16px focus-ring `alpha(primary,0.32)`, CTA 54px solid primary radius 16px.
- Home dashboard stats: compact KPI cards without decorative side stripes; net card title uses `CircleDollarSign`; numbers use financial stack (`Sora/Montserrat/Outfit`) with tabular lining numerals.
- Home dashboard hero: enlarged visual footprint (`mx` negative + `aspectRatio: "1024 / 780"`) with subtle `contrast(1.04) saturate(1.02)` for clearer baked-in text; still uses `fetchPriority="high"` + preload from `index.html`.
- Home dashboard navigation sections merged into one list (`القوائم`) instead of separate "القوائم الرئيسية" + "اختصارات إضافية".
- Home dashboard notification sheet: premium drawer redesign with cleaner header controls, category filters (`الكل`/`عاجل`/`الفريق`/`النشاط`), stronger card hierarchy, and per-notification dismiss action (`تمت المراجعة`) while preserving protected notices.
- Payments page: header action `تحصيل جديد` (to invoices), cleaner KPI header tiles, and financial numeric stack for totals.
- Debts add dialog and client-profile payment/debt/profit/edit/balance dialogs now rely on the global premium modal system (removed old hardcoded dark/light backgrounds and hardcoded green CTA colors).
- Invoices page hero CTA now explicitly shows `فاتورة جديدة` (all breakpoints) for clearer add-invoice discoverability.
- `NewInvoicePage`: validation/errors use toast feedback (no browser alerts), and top save action follows the shared polished hero-action style.
- `QuickExpenseSheet`: live amount preview card + explicit section headings + refined action button radii for a cleaner modern add-expense flow.
- `ClientExpenseFormDialog`: upgraded with premium header hierarchy, live total preview, sectioned content surfaces, and clearer submit labels (`حفظ المصروف` / `حفظ التعديلات`).

## Layout / navigation shell (`src/components/Layout.tsx`)
- App frame: `APP_FRAME_MAX_WIDTH = 430px`, centered on ≥sm with frame shadow.
- Bottom nav: fixed, height **64px** + safe-area, blur 22px, 5 equal items, active capsule refined to 44×26 + improved hover/press feedback. **No center FAB.**
- **FAB**: 58×58, radius 20px, subtle hairline + richer elevation, `insetInlineEnd: 16` (= left in RTL), floats `bottom: 64px + safe + 14px`, z 1190, **opens `QuickExpenseSheet` in place (state, no navigation — instant)**; hidden when route has sticky CTA (`/invoices/new`) or no `expenses` access.
- Sticky CTA bars sit at `bottom: calc(64px + safe)` (`etlalaIssueStickyBarSx`, NewInvoicePage).
- `PageScaffold`: refined premium gradient headers (softer shadows, cleaner bottom edge, subtler overlay), compact frosted back button (42px / radius 14), and cleaner default title sizing.
- Global windows polish via theme: `MuiDialog`/`MuiDrawer`/`MuiMenu`/`MuiPopover` use hairline borders, calmer shadows, and cleaner paper surfaces; `MuiDialog.paperFullScreen` also has dedicated premium full-screen surface styling.

## PWA
- SW = `public/firebase-messaging-sw.js` only (FCM + manifest/logo precache, **no bundle/navigation caching**). Bump `CACHE_STATIC` (now v4) when `manifest.json` or icon paths change.
- PWA/iPhone icon quality: app icons switched to high-res square source `/logo-hero-3d.png` (1024x1024) in `manifest.json`, Apple touch icons, SW notification icons, and favicon to avoid blurry install icons on modern iPhones.
- iOS zoom guards: viewport `maximum-scale=1`, inputs ≥16px on coarse pointers.
- Added `format-detection` meta guard in `index.html` to prevent Safari auto-link styling (phone/date/email/address) from distorting app-like UI.

## Accessibility / UX
- Contrast 4.5:1+; `prefers-reduced-motion`; 44px touch targets (min 40 visual for compact header actions).
- Global CSS no longer disables all transitions; motion is now disabled only under `prefers-reduced-motion: reduce`.

## When to update this file
Update after you change colors, typography, component patterns, layout shell, or `DESIGN.md` / theme files.
