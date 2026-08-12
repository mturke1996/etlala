const SW_URL = "/firebase-messaging-sw.js";
const STORAGE_ENABLED = "etlala-pwa-notifications-enabled";
const STORAGE_DEDUPE = "etlala-pwa-notif-sent-v1";
const DEDUPE_MAX = 120;

export function getPwaNotificationsUserEnabled(): boolean {
  try {
    const v = localStorage.getItem(STORAGE_ENABLED);
    if (v === null) return true;
    return v === "1";
  } catch {
    return true;
  }
}

export function setPwaNotificationsUserEnabled(on: boolean): void {
  try {
    localStorage.setItem(STORAGE_ENABLED, on ? "1" : "0");
  } catch {
    /* ignore */
  }
}

export function getNotificationPermission(): NotificationPermission {
  if (typeof Notification === "undefined") return "denied";
  return Notification.permission;
}

/** إشعارات الويب تحتاج سياقاً آمناً (HTTPS أو localhost) وواجهة Notification. */
export function isWebNotificationSupported(): boolean {
  if (typeof window === "undefined") return false;
  if (!window.isSecureContext) return false;
  return typeof Notification !== "undefined" && "requestPermission" in Notification;
}

export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (typeof Notification === "undefined" || !("requestPermission" in Notification)) {
    return "denied";
  }
  try {
    const r = await Notification.requestPermission();
    return r;
  } catch {
    return Notification.permission;
  }
}

export async function registerNotificationServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  if (!("serviceWorker" in navigator)) return null;
  try {
    const reg = await navigator.serviceWorker.register(SW_URL, {
      scope: "/",
      /** يقلّل احتمال خدمة قديمة من كاش المتصفح أثناء التطوير */
      updateViaCache: "none",
    });
    return reg;
  } catch (e) {
    console.warn("[SW] تعذّر تسجيل firebase-messaging-sw.js", e);
    return null;
  }
}

function loadDedupeSet(): Set<string> {
  try {
    const raw = localStorage.getItem(STORAGE_DEDUPE);
    if (!raw) return new Set();
    const arr = JSON.parse(raw) as string[];
    return new Set(Array.isArray(arr) ? arr : []);
  } catch {
    return new Set();
  }
}

function saveDedupeSet(s: Set<string>): void {
  try {
    const arr = [...s];
    const trimmed = arr.slice(-DEDUPE_MAX);
    localStorage.setItem(STORAGE_DEDUPE, JSON.stringify(trimmed));
  } catch {
    /* ignore */
  }
}

export function wasPwaNotificationSent(id: string): boolean {
  return loadDedupeSet().has(id);
}

export function markPwaNotificationSent(id: string): void {
  const s = loadDedupeSet();
  s.add(id);
  saveDedupeSet(s);
}

export type ShowEtlalaNotificationOptions = {
  tag: string;
  url?: string;
};

/**
 * يعرض إشعار نظام (PWA) إن وُجدت صلاحية وكان المستخدم مفعّل التنبيهات.
 * يفضّل استدعاؤها بعد `registerNotificationServiceWorker`.
 */
export async function showEtlalaNotification(
  title: string,
  body: string,
  opts: ShowEtlalaNotificationOptions,
): Promise<void> {
  if (!getPwaNotificationsUserEnabled()) return;
  if (typeof Notification === "undefined") return;
  if (Notification.permission !== "granted") return;

  const { tag, url = "/" } = opts;

  try {
    const reg = await navigator.serviceWorker.ready;
    await reg.showNotification(title, {
      body,
      tag,
      icon: "/logo-icon.jpg",
      badge: "/logo-icon.jpg",
      vibrate: [160, 70, 160],
      dir: "rtl",
      lang: "ar",
      data: { url },
    } as NotificationOptions);
  } catch {
    try {
      new Notification(title, { body, tag });
    } catch {
      /* ignore */
    }
  }
}
