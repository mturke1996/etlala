# تصميم ميزة احتساب النسبة من المصروفات أو المدفوعات (Client Profit Percentage Base)

## 1. الملخص التنفيذي
تمكين مستخدمي النظام من تحديد أساس احتساب نسبة أتعاب الإدارة / صافي النسبة المتفق عليها في ملف العميل، بحيث يتم احتسابها افتراضياً من **مجموع المصروفات** (المصاريف الفعلية للمشروع)، مع إتاحة خيار التبديل إلى **إجمالي المدفوعات** اختيارياً. ينعكس ذلك على الملخص المالي في واجهة الويب (الموبايل وسطح المكتب) وبطاقات مؤشرات الأداء، وتنبيهات العجز المالي، وملفات تقارير الـ PDF بجودة ودقة احترافية.

---

## 2. نموذج البيانات (Data Model)
في ملف `src/types/index.ts`:
توسيع كائن العميل `Client` بإضافة خاصية اختيارية:
```typescript
export interface Client {
  // الحقول الحالية...
  profitPercentage?: number; // نسبة صافي النسبة المتفق عليها (%)
  profitBase?: 'expenses' | 'payments'; // أساس احتساب النسبة: 'expenses' (مجموع المصروفات - افتراضي) أو 'payments' (إجمالي المدفوعات)
}
```
- إذا كانت `profitBase` غير محددة في السجلات السابقة، يتم اعتماد `'expenses'` تلقائياً كقيمة افتراضية استناداً لطلب المستخدم.

---

## 3. المعادلات المالية (Financial Calculations)
في ملخص الحسابات `summary` بصفحة `ClientProfilePage.tsx`:

1. **النسبة والأساس:**
   ```typescript
   const pct = client?.profitPercentage || 0;
   const profitBase = client?.profitBase || 'expenses';
   ```

2. **قيمة النسبة المستحقة (Profit Fee):**
   - إذا كان الأساس هو المصروفات (`profitBase === 'expenses'`):
     ```typescript
     const profit = totalExpenses > 0 && pct > 0 ? (totalExpenses * pct) / 100 : 0;
     ```
   - إذا كان الأساس هو المدفوعات (`profitBase === 'payments'`):
     ```typescript
     const profit = totalPaid > 0 && pct > 0 ? (totalPaid * pct) / 100 : 0;
     ```

3. **الرصيد المتبقي (Remaining):**
   ```typescript
   const totalObligations = totalExpenses + totalDebts;
   const remaining = totalPaid - profit - totalObligations;
   ```

4. **حسابات العجز وعجز النسبة (Deficit & Agreed Percentage Deficit):**
   - العجز المالي العام:
     ```typescript
     const clientDeficit = Math.max(0, -remaining);
     ```
   - في حالة احتساب النسبة من **المدفوعات**:
     سداد العجز يمثل دفعة جديدة تخضع للنسبة، لذا يُحسب عجز النسبة:
     ```typescript
     const percentageRate = pct / 100;
     const agreedPercentageDeficit =
       clientDeficit > 0 && percentageRate > 0 && percentageRate < 1
         ? (clientDeficit * percentageRate) / (1 - percentageRate)
         : 0;
     const requiredCollection = clientDeficit + agreedPercentageDeficit;
     ```
   - في حالة احتساب النسبة من **المصروفات**:
     المصروفات هي الأساس الفعلي للنسبة، وقيمة النسبة على المصروفات محتسبة بالفعل ومخصومة ضمن الالتزامات داخل `remaining` و `clientDeficit`. وبالتالي لا يتولد عجز نسبة إضافي على مبالغ التحصيل نفسها:
     ```typescript
     const agreedPercentageDeficit = 0;
     const requiredCollection = clientDeficit;
     ```

---

## 4. واجهة المستخدم (UI/UX Design)

### أ. نافذة تحديد النسبة (Profit Dialog):
ترقية النافذة بأسلوب Soft UI المتوافق مع هوية إطلالة:
1. **ترويسة أنيقة:** تشتمل على عنوان واضح "تحديد النسبة المتفق عليها"، وأيقونة معبرة وزر إغلاق.
2. **محدد الأساس المالي (Segmented Selection Cards):**
   - بطاقة: **من مجموع المصروفات** (افتراضي) — إشارة واضحة بأنها تحتسب من المصاريف.
   - بطاقة: **من إجمالي المدفوعات** — تحتسب من دفعات وتحصيلات العميل.
3. **حقل إدخال النسبة المئوية:** حقل رقمي مدعم برمز `%` مع التحقق من النطاق (0 إلى 100).
4. **صندوق محاكاة تفاعلي حي (Live Preview Box):**
   - يعرض الأساس المختار وقيمته الحالية (مثال: إجمالي المصروفات: 20,000 د.ل).
   - النسبة المدخلة: 10%.
   - صافي النسبة المحسوبة: 2,000 د.ل تتغير فورياً أثناء الكتابة أو التبديل.
5. **أزرار الإجراء:** زر "حفظ النسبة" بلون زيتوني أنيق وزر "إلغاء".

### ب. بطاقات الملخص (KPI Cards):
- في الهاتف وسطح المكتب (Desktop Bento)، يظهر رقم النسبة البارز مع قيمة صافي النسبة بالدينار.

---

## 5. تقارير الـ PDF (`ClientReportsPDF.tsx`)
- تمرير `profitBase` إلى تقرير الـ PDF ضمن الملخص.
- الحفاظ على المظهر النظيف المحدد من المستخدم في شريط الملخص (`PdfSummaryStrip`):
  - التسمية: `النسبة المتفق عليها (X%)` أو مع عجز النسبة إذا وُجد.
  - القيمة المالية: صافي النسبة المحسوب وفق الأساس المختار بدقة كاملة وتنسيق احترافي عالي الجودة.

---

## 6. خطة الاختبار والتحقق (Verification Plan)
1. **فحص الأنواع وبناء المشروع:** التأكد من عدم وجود أي خطأ في Typescript (`npm run build` أو `npx tsc --noEmit`).
2. **اختبار التبديل وحساب النسبة من المصروفات:** التأكد من أن تغيير الأساس إلى المصروفات يحسب النسبة من `totalExpenses`.
3. **اختبار التبديل إلى المدفوعات:** التأكد من احتسابها من `totalPaid`.
4. **التحقق من إنشاء وتوليد ملفات PDF:** فحص مخرجات التقرير الشامل ومطابقتها للمبالغ الصحيحة.
