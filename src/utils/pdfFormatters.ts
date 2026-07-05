/** تنسيقات مساعدة لجداول PDF ونموذج المصروف (كمية × سعر وحدة) */

export const CURRENCY_SYMBOL = 'د.ل';

/** تحويل الفاصلة العربية و٫ إلى ASCII قبل التحقق */
export function sanitizeDecimalTyping(value: string): string {
  return value
    .replace(/\u066B/g, '.')
    .replace(/[\u060C،]/g, ',')
    .replace(/\s/g, '');
}

export function formatDecimalNumber(amount: number, maxFractionDigits = 6): string {
  if (!Number.isFinite(amount)) return '0';
  const sign = amount < 0 ? '-' : '';
  const abs = Math.abs(amount);

  if (Number.isInteger(abs)) {
    return sign + abs.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  }

  const fixed = abs.toFixed(maxFractionDigits).replace(/\.?0+$/, '');
  const [intPart, fracPart] = fixed.split('.');
  const intFormatted = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  return sign + (fracPart ? `${intFormatted}.${fracPart}` : intFormatted);
}

export function formatCurrencyDisplay(amount: number): string {
  const sign = amount < 0 ? '-' : '';
  const abs = Math.abs(amount);
  const formatted = Number.isInteger(abs)
    ? abs.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')
    : formatDecimalNumber(abs);
  return `${sign}${formatted}\u00A0${CURRENCY_SYMBOL}`;
}

export function multiplyQuantityPrice(quantity: number, unitPrice: number): number {
  const qStr = String(quantity);
  const pStr = String(unitPrice);
  const qFrac = qStr.includes('.') ? qStr.split('.')[1].length : 0;
  const pFrac = pStr.includes('.') ? pStr.split('.')[1].length : 0;
  if (qFrac + pFrac === 0) return quantity * unitPrice;
  const scale = 10 ** (qFrac + pFrac);
  const qInt = Math.round(quantity * 10 ** qFrac);
  const pInt = Math.round(unitPrice * 10 ** pFrac);
  return (qInt * pInt) / scale;
}

export const EXPENSE_MEASURE_UNIT_GROUPS: { title: string; units: readonly string[] }[] = [
  { title: 'وزن', units: ['kg', 'quintal', 'ton'] },
  { title: 'طول ومساحة', units: ['m', 'm2', 'm3', 'km'] },
  { title: 'عدد وتغليف', units: ['piece', 'sack', 'bag', 'lot'] },
];

const MEASURE_UNIT_LABELS: Record<string, string> = {
  m2: 'م²',
  m3: 'م³',
  m: 'متر',
  km: 'كيلومتر',
  kg: 'كيلو',
  quintal: 'قنطار',
  ton: 'طن',
  sack: 'شوال',
  piece: 'قطعة',
  lot: 'مقطوعية',
  bag: 'كيس',
};

export function formatMeasureUnit(unit?: string): string {
  if (!unit?.trim()) return '';
  return MEASURE_UNIT_LABELS[unit] || unit;
}

export function formatQuantityDisplay(quantity: number, unit?: string): string {
  const q = formatDecimalNumber(quantity);
  const u = formatMeasureUnit(unit);
  return u ? `${q}\u00A0${u}` : q;
}

export function expenseHasQuantityLine(e: { quantity?: number; unitPrice?: number }): boolean {
  return (e.quantity ?? 0) > 0 && e.unitPrice != null && !Number.isNaN(e.unitPrice);
}

export function formatExpenseNotesOnly(notes?: string): string {
  return notes?.trim() || '';
}

export function formatExpensePdfUnitPrice(e: {
  quantity?: number;
  unitPrice?: number;
}): string | number {
  if (!expenseHasQuantityLine(e)) return '—';
  return e.unitPrice!;
}

/** أثناء الكتابة — يقبل , . ، ٫ والأرقام */
export function isPartialDecimalInput(value: string): boolean {
  if (value === '' || value === '-') return true;
  const s = sanitizeDecimalTyping(value);
  return /^-?[\d.,]+$/.test(s);
}

function stripThousandsSeparators(s: string): string {
  if (/^-?\d{1,3}(,\d{3})+(\.\d+)?$/.test(s)) return s.replace(/,/g, '');
  if (/^-?\d{1,3}(\.\d{3})+(,\d+)?$/.test(s)) {
    const lastComma = s.lastIndexOf(',');
    if (lastComma >= 0) return s.slice(0, lastComma).replace(/\./g, '') + '.' + s.slice(lastComma + 1);
    return s.replace(/\./g, '');
  }
  return s;
}

/** تحويل «12,5» أو «12.5» أو «1,234.50» أو «1٬234» إلى رقم */
export function parseDecimalInput(raw: unknown): number | undefined {
  if (raw == null || raw === '') return undefined;
  let s = sanitizeDecimalTyping(String(raw));
  if (!s || s === '-' || s === '.' || s === ',') return undefined;

  s = stripThousandsSeparators(s);

  const hasComma = s.includes(',');
  const hasDot = s.includes('.');

  if (hasComma && hasDot) {
    const lastComma = s.lastIndexOf(',');
    const lastDot = s.lastIndexOf('.');
    if (lastComma > lastDot) {
      s = s.replace(/\./g, '').replace(',', '.');
    } else {
      s = s.replace(/,/g, '');
    }
  } else if (hasComma) {
    const parts = s.split(',');
    const after = parts[1] ?? '';
    if (parts.length === 2 && after.length === 3 && /^\d+$/.test(after) && /^-?\d{1,3}$/.test(parts[0])) {
      s = s.replace(/,/g, '');
    } else {
      s = s.replace(',', '.');
    }
  }

  const n = parseFloat(s);
  return Number.isFinite(n) ? n : undefined;
}

/** قيمة رقمية من حقل النموذج (نص أو رقم) */
export function parseFormAmount(raw: unknown): number {
  return parseDecimalInput(raw) ?? 0;
}
