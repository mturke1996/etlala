import { getToken, onMessage, type Messaging } from "firebase/messaging";
import { doc, setDoc } from "firebase/firestore";
import { db, getFirebaseMessaging } from "../config/firebase";
import {
  getNotificationPermission,
  getPwaNotificationsUserEnabled,
  registerNotificationServiceWorker,
} from "./pwaNotifications";

const VAPID_KEY = import.meta.env.VITE_FCM_VAPID_KEY as string | undefined;

const REGISTER_THROTTLE_MS = 30 * 60 * 1000;

function regThrottleKey(uid: string) {
  return `etlala-fcm-reg-ts-${uid}`;
}

/**
 * تسجيل جهاز FCM وحفظ الرمز في Firestore — بعد السماح بالإشعارات.
 * الإشعارات والتطبيق مغلق تتطلب نشر Cloud Functions (مجلد `functions`).
 */
export async function registerDeviceForFcmPush(
  authUid: string,
  force = false,
): Promise<boolean> {
  if (!authUid) return false;
  if (!VAPID_KEY || !VAPID_KEY.trim()) {
    console.warn(
      "[FCM] أضف VITE_FCM_VAPID_KEY (مفتاح VAPID من Firebase Console → Cloud Messaging → Web Push).",
    );
    return false;
  }
  if (getNotificationPermission() !== "granted") return false;
  if (!getPwaNotificationsUserEnabled()) return false;

  if (!force) {
    try {
      const last = Number(
        localStorage.getItem(regThrottleKey(authUid)) || "0",
      );
      if (Date.now() - last < REGISTER_THROTTLE_MS) return true;
    } catch {
      /* ignore */
    }
  }

  const messaging = await getFirebaseMessaging();
  if (!messaging) return false;

  try {
    const reg = await registerNotificationServiceWorker();
    if (!reg) return false;

    const token = await getToken(messaging, {
      vapidKey: VAPID_KEY.trim(),
      serviceWorkerRegistration: reg,
    });
    if (!token) return false;

    const docId = `${authUid}_${token.replace(/[/\\]/g, "_")}`;
    await setDoc(
      doc(db, "fcmTokens", docId),
      {
        uid: authUid,
        token,
        updatedAt: new Date().toISOString(),
        ua:
          typeof navigator !== "undefined"
            ? navigator.userAgent.slice(0, 240)
            : "",
      },
      { merge: true },
    );
    try {
      localStorage.setItem(regThrottleKey(authUid), String(Date.now()));
    } catch {
      /* ignore */
    }
    return true;
  } catch (e) {
    console.warn("[FCM] تعذر الحصول على الرمز أو حفظه", e);
    return false;
  }
}

export function subscribeForegroundFcmMessages(
  messaging: Messaging,
  onPayload: (title: string, body: string, url?: string) => void,
): () => void {
  return onMessage(messaging, (payload) => {
    const title =
      payload.notification?.title ||
      payload.data?.title ||
      "إطلالة";
    const body =
      payload.notification?.body ||
      payload.data?.body ||
      "";
    const url = payload.data?.url;
    onPayload(title, body, url);
  });
}
