# Codebase Map — Etlala

**Last updated:** 2026-04-27

## Stack

- **Client:** Vite, React, TypeScript, MUI, Zustand (`src/store/`)
- **Backend:** Firebase (Firestore rules/indexes, `functions/` Node Cloud Functions)
- **PWA:** `public/manifest.json`, `public/firebase-messaging-sw.js` (FCM + تخزين مسبق خفيف لـ `manifest` والأيقونة فقط، بدون اعتراض التنقل)، `src/lib/pwaNotifications.ts`، `src/notifications/`

## Entry points

- `index.html` — root HTML
- `src/main.tsx` — bootstrap
- `src/App.tsx` — routes / shell
- `src/config/firebase.ts` — Firebase init

## Top-level layout

- `public/` — static assets, fonts (e.g. Amiri), PWA assets, hero images
- `functions/` — Firebase Cloud Functions (`index.js`, own `package.json`)
- `scripts/` — one-off / font tooling
- `DESIGN.md` — visual design spec (Stitch-style); **keep in sync with UI work**

## `src/` modules

- `src/pages/` — route-level screens (e.g. `HomePage`, `InvoicesPage`, `ClientProfilePage`, `LoginPage`, `DashboardHomePage`, …)
  - **`DashboardHomePage`:** بطاقة عليا **صافي النسبة** — المبلغ الكامل (`CustodyMoneyLine` للمحصل−مصروفات) + سطر **هامش من المحصّل %**؛ موجة SVG؛ بطاقتا المحصّل/المصروفات بشرائط لون وتدرجات مميّزة (Swiss / soft UI)
  - **`ClientProfilePage`:** لوحة الملخص المالي تحت الهيرو؛ أول خلية **النسبة المتفق عليها** (`profitPercentage`) مع «صافي المحسوب» كسطر فرعي
- `src/components/`
  - `Layout.tsx`, `PageScaffold.tsx` — shell / page frame
  - `etlala/` — mobile UI (`EtlalaMobileUi`)
  - `client/` — client profile / session UI
  - `pdf/` — PDF documents (`InvoicePDF`, `LetterPDF`, `ClientReportsPDF`, shared `pdfStyles`, `pdfFonts`)
  - Other shared: `LoadingScreen`, `Logo`, `HeroLogo`, `PrintableInvoice`, `AppLockGuard`, etc.
- `src/store/` — Zustand stores (`useAuthStore`, `useDataStore`, `useThemeStore`, `useAppLockStore`, `useGlobalFundStore`, …)
- `src/theme/` — MUI theme + `tokens.ts` (premium color tokens)
- `src/index.css` — global CSS
- `src/services/` — e.g. `firebaseService.ts`
- `src/lib/` — app utilities (FCM, PWA dismissals, …)
- `src/utils/` — formatters, calculations, PDF helpers, custody helpers
- `src/types/` — shared TS types
- `src/constants/` — e.g. `companyInfo.ts`
- `src/notifications/` — in-app / PWA notification building

## Conventions (current)

- **State:** Zustand in `src/store/`
- **Styling:** MUI + theme; global tokens in `src/theme/tokens.ts`; follow `DESIGN.md` for color roles and components
- **PDF:** shared styles/fonts under `src/components/pdf/`
- **RTL / Arabic:** primary UX language; use established layout components where possible

## When to update this file

Update when you add or rename top-level folders, new feature areas, or change how routing / Firebase is organized.
