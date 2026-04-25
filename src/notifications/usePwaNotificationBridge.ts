import { useEffect, useRef } from "react";
import type { AppNotificationItem } from "./buildAppNotifications";
import {
  getNotificationPermission,
  getPwaNotificationsUserEnabled,
  markPwaNotificationSent,
  registerNotificationServiceWorker,
  showEtlalaNotification,
  wasPwaNotificationSent,
} from "../lib/pwaNotifications";

/**
 * يسجّل عامل الخدمة ويطلق إشعارات النظام عند ظهور عناصر جديدة بعد أول مزامنة
 * (تجنّب إزعاج المستخدم بعشرات الإشعارات عند فتح التطبيق).
 */
export function usePwaNotificationBridge(items: AppNotificationItem[]) {
  const seeded = useRef(false);
  const prevPwaTags = useRef<Set<string>>(new Set());

  useEffect(() => {
    void registerNotificationServiceWorker();
  }, []);

  useEffect(() => {
    if (!getPwaNotificationsUserEnabled()) return;
    if (getNotificationPermission() !== "granted") return;

    const tagged = items.filter(
      (i) => i.notifySystem && i.pwaTag && i.id !== "all-clear",
    );
    const tagSet = new Set(tagged.map((i) => i.pwaTag!));

    if (!seeded.current) {
      seeded.current = true;
      tagged.forEach((i) => {
        if (i.pwaTag && !wasPwaNotificationSent(i.pwaTag)) {
          markPwaNotificationSent(i.pwaTag);
        }
      });
      prevPwaTags.current = tagSet;
      return;
    }

    for (const tag of tagSet) {
      if (prevPwaTags.current.has(tag)) continue;
      const n = tagged.find((i) => i.pwaTag === tag);
      if (!n?.pwaTag) continue;
      if (wasPwaNotificationSent(n.pwaTag)) continue;
      markPwaNotificationSent(n.pwaTag);
      void showEtlalaNotification(n.title, n.body, {
        tag: n.pwaTag,
        url: n.actionPath || "/",
      });
    }
    prevPwaTags.current = tagSet;
  }, [items]);
}
