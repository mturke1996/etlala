import type { Client, Expense, GlobalFundTransaction, Invoice, Payment } from "../types";
import { round2 } from "../utils/custodyFundAlloc";
import { formatCurrency } from "../utils/formatters";
import {
  collectFundUserIds,
  getCustodySnapshotForUser,
} from "../utils/userCustodyFromStores";

export type AppNotificationKind =
  | "urgent"
  | "info"
  | "success"
  | "lock"
  | "team"
  | "activity";

export type AppNotificationItem = {
  id: string;
  kind: AppNotificationKind;
  title: string;
  body: string;
  /** مسار للانتقال من البطاقة أو من نقرة الإشعار */
  actionPath?: string;
  actionLabel?: string;
  at?: string;
  /** مفتاح فريد لإشعار PWA (منع التكرار) */
  pwaTag?: string;
  /** إظهار تنبيه نظام عند أول ظهور */
  notifySystem?: boolean;
  /** لتتبع «مسح الكل»: إن تغيّر التوقيع يُعاد إظهار التنبيه */
  dismissSignature?: string;
};

type UserStatsFn = (uid: string) => {
  deposited: number;
  withdrawn: number;
  remaining: number;
};

type BuildArgs = {
  userId: string | undefined;
  userDisplayName: string | undefined;
  userEmail: string | undefined;
  isLocked: boolean;
  sessionUnlocked: boolean;
  canSeeStats: boolean;
  canOpenFund: boolean;
  /** مراقبة عهدة بقية الفريق (صلاحية إحصائيات / إدارة) */
  isTeamCustodyViewer: boolean;
  transactions: GlobalFundTransaction[];
  expenses: Expense[];
  invoices: Invoice[];
  payments: Payment[];
  clients: Client[];
  getUserStats: UserStatsFn;
  /** خريطة uid → اسم للعرض */
  fundUserNameById: Record<string, string>;
};

function currentUserLabel(name?: string, email?: string): string {
  return (name || email || "").trim().toLowerCase();
}

function isFromOtherUser(
  createdBy: string | undefined,
  myName: string | undefined,
  myEmail: string | undefined,
): boolean {
  if (!createdBy || !createdBy.trim()) return false;
  const a = createdBy.trim().toLowerCase();
  const me = currentUserLabel(myName, myEmail);
  if (!me) return true;
  if (a === me) return false;
  if (myEmail && a === myEmail.trim().toLowerCase()) return false;
  if (myName && a === myName.trim().toLowerCase()) return false;
  return true;
}

const ACTIVITY_MAX = 8;
const ACTIVITY_SINCE_MS = 1000 * 60 * 60 * 24 * 5; /* 5 أيام */

export function buildAppNotifications(a: BuildArgs): AppNotificationItem[] {
  const list: AppNotificationItem[] = [];

  if (a.isLocked && !a.sessionUnlocked) {
    list.push({
      id: "session-lock",
      kind: "lock",
      title: "جلسة القفل",
      body: "أدخل رمز التطبيق للوصول للأقسام المحمية (العملاء، الصندوق، وغيرها) إن وُجدت بصلاحيتك.",
      dismissSignature: "lock",
    });
  }

  if (!a.canSeeStats) {
    list.push({
      id: "stats-hidden",
      kind: "info",
      title: "إحصائيات الشاشة الرئيسية",
      body: "مؤشرات صافي النسبة والمحصّل وعموم المصروفات معطّلة بإعدادات الأمان. يبقى بإمكانك استخدام باقي الأقسام المفعّلة لك.",
      dismissSignature: "stats",
    });
  }

  const mySnap =
    a.userId || a.userDisplayName
      ? getCustodySnapshotForUser(
          a.userId || "",
          a.userDisplayName,
          a.transactions,
          a.expenses,
          a.getUserStats,
        )
      : null;

  if (mySnap && mySnap.remaining < 0) {
    list.push({
      id: "custody-deficit-self",
      kind: "urgent",
      title: "عجز في عهدتك",
      body: `المتبقي المطلوب تسويته: ‎${formatCurrency(Math.abs(mySnap.remaining))}‎. راجع صندوق العهدة.`,
      actionPath: a.canOpenFund ? "/fund" : undefined,
      actionLabel: a.canOpenFund ? "فتح صندوق العهدة" : undefined,
      pwaTag: `pwa-custody-deficit-${a.userId || "me"}`,
      notifySystem: true,
      dismissSignature: `def:${round2(mySnap.remaining)}`,
    });
  } else if (
    mySnap &&
    mySnap.remaining === 0 &&
    mySnap.deposited > 0 &&
    mySnap.spent > 0
  ) {
    list.push({
      id: "custody-depleted-self",
      kind: "info",
      title: "نفاد رصيد العهدة الحالية",
      body: "استُهلك رصيد عهدتك الحالية بالكامل. يمكن طلب تمويل جديد عند الحاجة.",
      actionPath: a.canOpenFund ? "/fund" : undefined,
      actionLabel: a.canOpenFund ? "صندوق العهدة" : undefined,
      pwaTag: `pwa-custody-depleted-${a.userId || "me"}`,
      notifySystem: true,
      dismissSignature: "depleted",
    });
  } else if (
    mySnap &&
    mySnap.remaining > 0 &&
    mySnap.remaining < 300
  ) {
    list.push({
      id: "custody-low-self",
      kind: "info",
      title: "تنبيه ميزانية عهدة",
      body: `رصيدك المتبقي أقل من 300 ‎د.ل‎. خطط لإعادة التمويل عند الحاجة.`,
      dismissSignature: `low:${round2(mySnap.remaining)}`,
    });
  }

  if (a.isTeamCustodyViewer) {
    const uids = collectFundUserIds(a.transactions);
    for (const uid of uids) {
      if (a.userId && uid === a.userId) continue;
      const name = a.fundUserNameById[uid] || "مستخدم";
      const snap = getCustodySnapshotForUser(
        uid,
        name,
        a.transactions,
        a.expenses,
        a.getUserStats,
      );
      if (!snap) continue;
      if (snap.remaining < 0) {
        list.push({
          id: `team-custody-deficit-${uid}`,
          kind: "team",
          title: `عجز عهدة — ${name}`,
          body: `المتبقي المطلوب تسويته: ‎${formatCurrency(Math.abs(snap.remaining))}‎.`,
          actionPath: "/fund",
          actionLabel: "صندوق العهدة",
          pwaTag: `pwa-team-deficit-${uid}`,
          notifySystem: true,
          dismissSignature: `tdef:${uid}:${round2(snap.remaining)}`,
        });
      } else if (
        snap.remaining === 0 &&
        snap.deposited > 0 &&
        snap.spent > 0
      ) {
        list.push({
          id: `team-custody-depleted-${uid}`,
          kind: "team",
          title: `انتهت عهدة — ${name}`,
          body: "نفد رصيد العهدة الحالية لهذا المستخدم.",
          actionPath: "/fund",
          actionLabel: "صندوق العهدة",
          pwaTag: `pwa-team-depleted-${uid}`,
          notifySystem: true,
          dismissSignature: `tdep:${uid}`,
        });
      }
    }
  }

  /* نشاط حديث من زملاء (ليس أنت) — يتطلب معرف المستخدم لتفادي إشعارات خاطئة */
  const myName = a.userDisplayName;
  const myEmail = a.userEmail;
  const since = Date.now() - ACTIVITY_SINCE_MS;

  type Act = {
    id: string;
    at: string;
    title: string;
    body: string;
    path: string;
  };
  const acts: Act[] = [];

  if (a.userId) {
  for (const inv of a.invoices) {
    if (!isFromOtherUser(inv.createdBy, myName, myEmail)) continue;
    const t = new Date(inv.createdAt).getTime();
    if (t < since) continue;
    acts.push({
      id: `act-inv-${inv.id}`,
      at: inv.createdAt,
      title: "فاتورة جديدة",
      body: `${inv.createdBy || "زميل"} أضاف فاتورة ${inv.invoiceNumber}`,
      path: `/invoices/${inv.id}`,
    });
  }
  for (const pay of a.payments) {
    if (!isFromOtherUser(pay.createdBy, myName, myEmail)) continue;
    const t = new Date(pay.createdAt).getTime();
    if (t < since) continue;
    acts.push({
      id: `act-pay-${pay.id}`,
      at: pay.createdAt,
      title: "دفعة جديدة",
      body: `${pay.createdBy || "زميل"} سجّل دفعة بقيمة ${formatCurrency(pay.amount)}`,
      path: "/payments",
    });
  }
  for (const ex of a.expenses) {
    const byOtherUid = ex.userId && ex.userId !== a.userId;
    const byOtherName =
      ex.createdBy && isFromOtherUser(ex.createdBy, myName, myEmail);
    if (!byOtherUid && !byOtherName) continue;
    const t = new Date(ex.createdAt).getTime();
    if (t < since) continue;
    const expActor =
      ex.createdBy ||
      (ex.userId ? a.fundUserNameById[ex.userId] : "") ||
      "زميل";
    acts.push({
      id: `act-exp-${ex.id}`,
      at: ex.createdAt,
      title: "مصروف جديد",
      body: `${expActor} سجّل مصروفًا ${ex.description?.slice(0, 40) || ""}`,
      path: "/expenses",
    });
  }
  for (const cl of a.clients) {
    if (!isFromOtherUser(cl.createdBy, myName, myEmail)) continue;
    const t = new Date(cl.createdAt).getTime();
    if (t < since) continue;
    acts.push({
      id: `act-cli-${cl.id}`,
      at: cl.createdAt,
      title: "عميل جديد",
      body: `${cl.createdBy || "زميل"} أضاف العميل ${cl.name}`,
      path: "/clients",
    });
  }

  acts.sort((x, y) => new Date(y.at).getTime() - new Date(x.at).getTime());
  const top = acts.slice(0, ACTIVITY_MAX);
  for (const x of top) {
    list.push({
      id: x.id,
      kind: "activity",
      title: x.title,
      body: x.body,
      at: x.at,
      actionPath: x.path,
      actionLabel: "عرض",
      pwaTag: `pwa-${x.id}`,
      notifySystem: true,
      dismissSignature: x.at,
    });
  }
  }

  if (list.length === 0) {
    list.push({
      id: "all-clear",
      kind: "success",
      title: "لا تنبيهات حالياً",
      body: "لا إشعارات مالية أو نشاط يحتاج متابعتك. سيتم التحديث تلقائياً عند حدوث تغيير.",
    });
  }

  return list;
}
