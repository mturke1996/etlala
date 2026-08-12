import dayjs from "dayjs";

export type MonthlyTrendPoint = {
  key: string;
  label: string;
  collected: number;
  spent: number;
  net: number;
};

export type ExpenseMixItem = {
  key: string;
  amount: number;
  share: number;
};

export type InvoiceExposure = {
  openCount: number;
  openAmount: number;
  overdueCount: number;
};

export type MonthPulse = {
  collected: number;
  spent: number;
  net: number;
  prevCollected: number;
  prevSpent: number;
  collectedDelta: number | null;
  spentDelta: number | null;
  coverage: number | null;
};

type DatedAmount = {
  amount?: number;
  date?: string;
  paymentDate?: string;
  createdAt?: string;
  category?: string;
};

type InvoiceLike = {
  status?: string;
  total?: number;
};

const monthKeyOf = (row: DatedAmount) => {
  const raw = row.paymentDate || row.date || row.createdAt;
  const d = raw ? dayjs(raw) : null;
  return d && d.isValid() ? d.format("YYYY-MM") : null;
};

const pctChange = (curr: number, prev: number) =>
  prev > 0 ? ((curr - prev) / prev) * 100 : null;

export function buildMonthlyTrend(
  payments: DatedAmount[],
  expenses: DatedAmount[],
  months = 12,
): MonthlyTrendPoint[] {
  const start = dayjs().startOf("month").subtract(months - 1, "month");
  return Array.from({ length: months }, (_, i) => {
    const month = start.add(i, "month");
    const key = month.format("YYYY-MM");
    const collected = payments.reduce((sum, row) => {
      return monthKeyOf(row) === key ? sum + (row.amount || 0) : sum;
    }, 0);
    const spent = expenses.reduce((sum, row) => {
      return monthKeyOf(row) === key ? sum + (row.amount || 0) : sum;
    }, 0);
    return {
      key,
      label: month.locale("ar").format("MMM"),
      collected,
      spent,
      net: collected - spent,
    };
  });
}

export function buildExpenseMix(
  expenses: DatedAmount[],
  limit = 5,
): ExpenseMixItem[] {
  const map = new Map<string, number>();
  for (const row of expenses) {
    const key = row.category || "other";
    map.set(key, (map.get(key) || 0) + (row.amount || 0));
  }
  const ranked = [...map.entries()].sort((a, b) => b[1] - a[1]);
  const top = ranked.slice(0, limit);
  const rest = ranked.slice(limit).reduce((sum, [, amount]) => sum + amount, 0);
  const total = ranked.reduce((sum, [, amount]) => sum + amount, 0) || 1;
  const items: ExpenseMixItem[] = top.map(([key, amount]) => ({
    key,
    amount,
    share: amount / total,
  }));
  if (rest > 0) {
    items.push({ key: "other", amount: rest, share: rest / total });
  }
  return items;
}

export function buildInvoiceExposure(invoices: InvoiceLike[]): InvoiceExposure {
  const open = invoices.filter((row) =>
    ["sent", "partially_paid", "overdue"].includes(row.status || ""),
  );
  return {
    openCount: open.length,
    openAmount: open.reduce((sum, row) => sum + (row.total || 0), 0),
    overdueCount: invoices.filter((row) => row.status === "overdue").length,
  };
}

export function buildMonthPulse(
  payments: DatedAmount[],
  expenses: DatedAmount[],
): MonthPulse {
  const trend = buildMonthlyTrend(payments, expenses, 2);
  const current = trend[1] || trend[0];
  const prev = trend[0];
  const collected = current?.collected || 0;
  const spent = current?.spent || 0;
  const prevCollected = prev?.collected || 0;
  const prevSpent = prev?.spent || 0;
  return {
    collected,
    spent,
    net: collected - spent,
    prevCollected,
    prevSpent,
    collectedDelta: pctChange(collected, prevCollected),
    spentDelta: pctChange(spent, prevSpent),
    coverage: collected > 0 ? spent / collected : null,
  };
}
