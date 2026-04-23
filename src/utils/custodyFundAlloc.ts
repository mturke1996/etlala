import dayjs from 'dayjs';

/**
 * تقريب نقدي: يمنع بقايا فاصلة تمنع اكتشاف عجز صغير وترحيله.
 * يجب استخدامه مع خوارزمية صندوق العهد (نفس منطق FundPage).
 */
export const round2 = (n: number) => {
  const x = Number(n);
  if (Number.isNaN(x) || !Number.isFinite(x)) return 0;
  return Math.round(x * 100) / 100;
};

type CustodyRow = {
  createdAt: string;
  amount: number;
  spent: number;
  remaining: number;
  debtRolledOut?: boolean;
};

type ExpenseRow = { createdAt: string; amount: number };

/**
 * تخصيص مصروفات المستخدم على عهداته (إيداعات) ثم ترحيل العجز للعهدة التالية
 * — منطق مطابق لـ `FundPage` (حلقات until الاستقرار، وليست for واحدة).
 */
export function computeUserFundAllocTotals(
  depositRows: { createdAt: string; amount: number }[],
  expenseRows: ExpenseRow[]
): { deposited: number; spent: number; remaining: number } {
  if (depositRows.length === 0) {
    if (expenseRows.length === 0) {
      return { deposited: 0, spent: 0, remaining: 0 };
    }
    const totalExp = round2(
      expenseRows.reduce(
        (s, e) => s + (Number.isFinite(e.amount) ? e.amount : 0),
        0
      )
    );
    // لا عهدات: كامل المصروف = عجز (سلبي)
    return { deposited: 0, spent: totalExp, remaining: -totalExp };
  }

  const custodies: CustodyRow[] = [...depositRows]
    .sort((a, b) => dayjs(a.createdAt).valueOf() - dayjs(b.createdAt).valueOf())
    .map((tx) => ({
      createdAt: tx.createdAt,
      amount: round2(tx.amount),
      spent: 0,
      remaining: round2(tx.amount),
      debtRolledOut: false,
    }));

  const allExp = [...expenseRows].sort(
    (a, b) => dayjs(a.createdAt).valueOf() - dayjs(b.createdAt).valueOf()
  );

  allExp.forEach((exp) => {
    let rem = exp.amount;
    const expTime = dayjs(exp.createdAt);
    for (let i = 0; i < custodies.length; i++) {
      const c = custodies[i];
      if (rem <= 0) break;
      if (expTime.isBefore(dayjs(c.createdAt))) continue;

      if (c.remaining <= 0) {
        const hasNextCustody = custodies
          .slice(i + 1)
          .some((nc) => !expTime.isBefore(dayjs(nc.createdAt)));
        if (hasNextCustody) continue;
      }

      const take = Math.min(rem, Math.max(c.remaining, 0));
      if (take > 0) {
        c.spent += take;
        c.remaining -= take;
        rem -= take;
      }

      if (rem > 0) {
        const hasNextCustody = custodies
          .slice(i + 1)
          .some((nc) => !expTime.isBefore(dayjs(nc.createdAt)));
        if (!hasNextCustody) {
          c.spent += rem;
          c.remaining -= rem;
          rem = 0;
        }
      }
    }
  });

  custodies.forEach((c) => {
    c.spent = round2(c.spent);
    c.remaining = round2(c.amount - c.spent);
  });

  // ترحيل عجز عهدة إلى التالية (يمكن أن يحتاج عدة مرات — لا تكفي for واحدة)
  let moved = true;
  let pass = 0;
  while (moved && pass < 32) {
    moved = false;
    pass += 1;
    for (let i = 0; i < custodies.length - 1; i++) {
      const current = custodies[i];
      const next = custodies[i + 1];
      const r = current.remaining;
      if (r < 0) {
        const deficit = -r;
        const ns = round2(next.spent + deficit);
        next.spent = ns;
        next.remaining = round2(next.amount - ns);
        current.remaining = 0;
        current.debtRolledOut = true;
        moved = true;
      }
    }
  }

  custodies.forEach((c) => {
    if (!c.debtRolledOut) {
      c.spent = round2(c.spent);
      c.remaining = round2(c.amount - c.spent);
    }
  });

  const deposited = round2(custodies.reduce((s, c) => s + c.amount, 0));
  const spent = round2(custodies.reduce((s, c) => s + c.spent, 0));
  const remaining = round2(custodies.reduce((s, c) => s + c.remaining, 0));
  return { deposited, spent, remaining };
}
