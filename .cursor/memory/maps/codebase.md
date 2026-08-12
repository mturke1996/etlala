# Codebase Map — Etlala

**Last updated:** 2026-08-12

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
  - **`DashboardHomePage`:** الرئيسية — إحصائيات + قوائم؛ على **≥lg (1200px)** شبكة هيرو+KPIs ثلاثية الأعمدة وقوائم متعددة الأعمدة
  - **`ExpensesPage`:** خفيفة — بدون recharts، ترقيم 30 صف + `QuickExpenseSheet`
  - **`LoginPage`:** أبيض نظيف iOS — squircle logo، حقول 54px
  - **`ClientProfilePage`:** ملخص مالي تحت الهيرو
- `src/components/`
  - **`Layout.tsx`** — `< lg`: إطار جوال 430px + شريط سفلي؛ **`≥ lg`:** `DesktopSidebar` + محتوى كامل (`etlala-desktop-shell`)
  - **`layout/DesktopSidebar.tsx`** — تنقل جانبي احترافي (سطح المكتب)
  - **`layout/PageScaffold.tsx`** — هيكل الصفحات؛ `maxWidth` يتوسّع إلى `xl` على سطح المكتب
  - `expense/QuickExpenseSheet.tsx` — shared "مصروف جديد" sheet used by Layout FAB + ExpensesPage (client select, qty×price, date)
  - `etlala/` — mobile UI (`EtlalaMobileUi`)
  - `invoices/` — `InvoiceListItem` (dense mobile row + month header for `InvoicesPage`)
  - `client/` — client profile / session UI
  - `pdf/` — PDF stack (from rkeaz-group pattern, Etlala branding):
    - Templates: `InvoicePDF`, `LetterPDF`, `ClientReportsPDF` (5 report types)
    - Kit: `pdfKit.tsx`, `PdfTable.tsx`, `pdfBrand.ts`, `pdfCompanyInfo.ts`, `arabicPDF.ts`
    - Runtime: `pdfFonts.ts`, `fetch-brand-assets.ts`, `prepare-pdf-tree.tsx`, `pdf-logo-context.tsx`, `lazyPdf.ts`
    - Service: `src/utils/pdfService.ts` (generate/download/share + font preload + brand assets)
    - Formatters: `src/utils/pdfFormatters.ts` (qty/unit columns for expense PDFs)
  - Other shared: `LoadingScreen`, `Logo`, `HeroLogo`, `PrintableInvoice`, `AppLockGuard`, etc.
- `src/layout/navConfig.ts` — مصدر واحد لعناصر التنقل (جوال + سطح مكتب)
- `src/hooks/useIsDesktopLayout.ts` — `useMediaQuery(lg)` للتبديل بين تخطيط الجوال وسطح المكتب
- `src/store/` — Zustand stores (`useAuthStore`, `useDataStore`, `useThemeStore`, `useAppLockStore`, `useGlobalFundStore`, …)
- `src/theme/` — MUI theme + `tokens.ts` (premium color tokens)
- `src/index.css` — global CSS
- `src/services/` — e.g. `firebaseService.ts`
- `src/lib/` — app utilities (FCM, PWA dismissals, …)
- `src/utils/` — formatters, calculations, PDF helpers, custody helpers
- `src/types/` — shared TS types
- `src/constants/` — e.g. `companyInfo.ts`
- `src/notifications/` — in-app / PWA notification building

## Build / deploy

- **Hosting = Vercel**, project `etlala.ly` (scope `mturke1996s-projects`), production URL `https://etlala-ly-mu.vercel.app` — the user's phone PWA loads this. `firebase.json` hosting section is **vestigial** (Firebase Hosting for `etlala-a9ace` returns 404, and the local firebase CLI account `rkeazgroup@gmail.com` has no access anyway; Firebase is used for Firestore/Auth/FCM only).
- **Deploy is manual from this machine:** `vercel deploy --prod --yes` (CLI ≥47 required; npm global installs flake with ETIMEDOUT on this network — a working CLI 54 lives at `C:\tmp\vc\node_modules\.bin\vercel.cmd`, installed via pnpm). **Local edits are invisible on the user's phone until deployed.**
- `vercel.json` (added 2026-07-06): SPA rewrite `/(.*) → /index.html` (deep links previously 404'd), immutable cache for `/assets/`, `no-cache` for the SW.
- `vite.config.ts` manualChunks: recharts/xlsx removed from bundle (no longer imported)

## Conventions (current)

- **State:** Zustand in `src/store/`
- **Styling:** MUI + theme; global tokens in `src/theme/tokens.ts`; follow `DESIGN.md` for color roles and components
- **PDF:** shared styles/fonts under `src/components/pdf/`
- **RTL / Arabic:** primary UX language; use established layout components where possible

## When to update this file

Update when you add or rename top-level folders, new feature areas, or change how routing / Firebase is organized.
