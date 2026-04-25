import type { AppNotificationItem } from "../notifications/buildAppNotifications";

const STORAGE_KEY = "etlala-notif-dismiss-map-v1";
const MAX_KEYS = 400;

/** لا يُمسَح عبر «مسح الكل» — تبقى لأسباب أمنية/واجهة */
export const NOTIFICATION_IDS_EXCLUDED_FROM_CLEAR = new Set([
  "session-lock",
  "stats-hidden",
  "all-clear",
]);

export function loadDismissMap(): Record<string, string> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const p = JSON.parse(raw) as Record<string, string>;
    return p && typeof p === "object" ? p : {};
  } catch {
    return {};
  }
}

export function saveDismissMap(map: Record<string, string>): void {
  try {
    const keys = Object.keys(map);
    const trimmed =
      keys.length <= MAX_KEYS
        ? map
        : keys.slice(-MAX_KEYS).reduce<Record<string, string>>((acc, k) => {
            acc[k] = map[k];
            return acc;
          }, {});
    localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));
  } catch {
    /* ignore */
  }
}

/** إظهار العنصر إن لم يُخزَّن توقيعه، أو إذا تغيّر الوضع (مبلغ عجز جديد مثلاً) */
export function filterUndismissedNotifications(
  items: AppNotificationItem[],
  dismissMap: Record<string, string>,
): AppNotificationItem[] {
  return items.filter((n) => {
    if (n.id === "all-clear") return true;
    const stored = dismissMap[n.id];
    if (stored === undefined) return true;
    const current = n.dismissSignature ?? n.id;
    return current !== stored;
  });
}

export function mergeDismissAfterClear(
  itemsToDismiss: AppNotificationItem[],
  previous: Record<string, string>,
): Record<string, string> {
  const next = { ...previous };
  for (const n of itemsToDismiss) {
    if (NOTIFICATION_IDS_EXCLUDED_FROM_CLEAR.has(n.id)) continue;
    next[n.id] = n.dismissSignature ?? n.id;
  }
  return next;
}
