# DESIGN.md — Etlala (إطلالة) — v2

## 1. Visual Theme & Atmosphere

**لوحة B2B operations / engineering — ثقة، هدوء، وضوح، ولمعان محكوم.**  
كثافة متوسطة، مساحات بيضاء سخية (8pt grid). أسلوب: **Swiss + Soft UI** (UI/UX Pro Max) + لمسة **biophilic** عبر الأخضر الزيتوني.  
**الخلفية:** لون بيج دافئ + **شبكة نقاط شبه شفافة** (dot grid) + غلاف إضاءة radial خفيف — **بدون** صور Unsplash الافتراضية في تسجيل الدخول (أداء + هوية).  
**البطاقات:** حافة علوية أو بداية سطر (inline-start) ملوّنة رقيقة (4px) + ظل المستوى 1–2.  
لا تدرجات بنفسجي/زهري «AI».

**Keywords:** نظيف، موثوق، دافئ، عربي RTL، أرقام Outfit.

## 2. Color Palette & Roles

| Token | Hex | Role |
|--------|-----|------|
| primary | #3d4f3d | أزرار أساسية، تركيز (أعمق قليلاً من v1 للوضوح) |
| primary-hover | #2f3d2f | hover |
| surface / paper | #ffffff | بطاقات ولوحات |
| background | #f4f1ea | خلفية الصفحة (أدفأ وأوضح من v1) |
| foreground | #1e2a1e | نص رئيسي (تباين أعلى) |
| foreground-muted | #5c6b5c | نص ثانوي |
| border | rgba(61,79,61,0.1) | حدود شعرية |
| accent-cream | #c8c0b0 | شريط هيدر سفلي، تفاصيل |
| line | #d4c5a3 | تدرجات داخلية خفيفة |
| success | #0d9668 | محصّل / OK |
| danger | #c73e3e | أخطاء / عجز (أحمر معتدل) |

**Dark mode:** خلفية ~#141916، ورق ~#1a221a، نص #eceae4، حدود شفافة، primary أفتح قليلاً للقراءة.

## 3. Typography

**Body:** `Cairo`, `Tajawal` — أوزان 500–800 للواجهة العربية.  
**أرقام/إنكليزي قصير:** `Outfit` حيث يلزم.  
H1: 800، تتبع مضغوط قليلاً؛ الـ body: 15–16px، تباعد أسطر مريح.

## 4. Component Stylings (ملخص v2)

- **أزرار:** contained primary بتدرج زيتوني، `minHeight` 44px، focus-visible حلقة 3px باهتة، مدة 200ms.  
- **بطاقات قوائم (Home / تنقل):** `border-radius` 16px، **شريط لون 4px** عند `borderInlineStart` بلون الوحدة، ظل 0 4px 20px / 0.08.  
- **هيدر:** `PageScaffold` — تدرج علوي + **خط كريمي سفلي** 1px + shine علوي.  
- **جداول:** رأس باهت + صف hover (MuiTable*).  
- **أيقونات:** MUI icons فقط — **لا emoji** في واجهة التنبيهات الحرجة.

## 5. Layout Principles

- Spacing: 4, 8, 12, 16, 24, 32.  
- Container: `maxWidth="sm"` للتطبيق المحمول أولاً.  
- شريط سفلي ثابت: 70px + safe area.

## 6. Depth & Elevation (v2)

| Level | Use |
|-------|-----|
| 0 | خلفية الصفحة + dot pattern |
| 1 | بطاقات قوائم، inputs |
| 2 | مودال، هيرو يرتفع فوق المحتوى |
| 3 | شريط سفلي (blur + خط علوي) |

## 7. Do's and Don'ts

- **Do:** تباين 4.5:1+، `prefers-reduced-motion`، لمس 44px، تدرجات خضراء/كريم/رمادية فقط.  
- **Don't:** بنفسجي AI، Unsplash كخلفية إجبارية، emoji كبديل عن الأيقونات في التنبيهات.
