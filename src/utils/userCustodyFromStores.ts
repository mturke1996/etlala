import type { Expense, GlobalFundTransaction } from "../types";
import { computeUserFundAllocTotals } from "./custodyFundAlloc";

type UserStats = { deposited: number; withdrawn: number; remaining: number };

/**
 * نفس منطق عهدة المستخدم في لوحة التحكم / صندوق العهدة:
 * إيداعات الصندوق + مصروفات مرتبطة بـ userId (أو بـ createdBy كاسم).
 */
export function getCustodySnapshotForUser(
  userId: string,
  userDisplayName: string | undefined,
  transactions: GlobalFundTransaction[],
  expenses: Expense[],
  getUserStats: (uid: string) => UserStats,
): { deposited: number; spent: number; remaining: number } | null {
  const deposits = transactions.filter(
    (t) =>
      t.type === "deposit" &&
      ((userId && t.userId === userId) ||
        (userDisplayName && t.userName === userDisplayName)),
  );

  if (deposits.length === 0) {
    const storeStats = userId ? getUserStats(userId) : null;
    if (storeStats && storeStats.deposited > 0) {
      return {
        deposited: storeStats.deposited,
        spent: storeStats.withdrawn,
        remaining: storeStats.remaining,
      };
    }
    return null;
  }

  const depositRows = deposits.map((t) => ({
    createdAt: t.createdAt,
    amount: t.amount,
  }));
  const expenseRows = expenses
    .filter(
      (e) =>
        (userId && e.userId === userId) ||
        (userDisplayName && e.createdBy === userDisplayName),
    )
    .map((e) => ({ createdAt: e.createdAt, amount: e.amount }));

  return computeUserFundAllocTotals(depositRows, expenseRows);
}

/** كل المستخدمين الذين لديهم إيداع عهدة في الصندوق */
export function collectFundUserIds(transactions: GlobalFundTransaction[]): string[] {
  const ids = new Set<string>();
  transactions.forEach((t) => {
    if (t.type === "deposit" && t.userId) ids.add(t.userId);
  });
  return [...ids];
}
