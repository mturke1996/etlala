/* Service worker موحّد: FCM (إشعارات وهو التطبيق مغلق) + رسائل من التطبيق */
importScripts("https://www.gstatic.com/firebasejs/10.7.2/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.7.2/firebase-messaging-compat.js");

self.addEventListener("install", (event) => {
  event.waitUntil(self.skipWaiting());
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

firebase.initializeApp({
  apiKey: "AIzaSyAu21I6fAD1dz0_jFbVhopNMuU5YI8_XSM",
  authDomain: "etlala-a9ace.firebaseapp.com",
  projectId: "etlala-a9ace",
  storageBucket: "etlala-a9ace.firebasestorage.app",
  messagingSenderId: "256742530346",
  appId: "1:256742530346:web:8a3e072dc59574db08d253",
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  const title =
    payload.notification?.title ||
    payload.data?.title ||
    "إطلالة";
  const body =
    payload.notification?.body ||
    payload.data?.body ||
    "";
  const url = (payload.data && payload.data.url) || "/";
  const options = {
    body,
    icon: "/logo-icon.jpg",
    badge: "/logo-icon.jpg",
    tag: payload.data?.tag || "etlala-fcm",
    data: { url },
    vibrate: [160, 70, 160],
    dir: "rtl",
    lang: "ar",
  };
  return self.registration.showNotification(title, options);
});

self.addEventListener("message", (event) => {
  const data = event.data;
  if (!data || data.type !== "SHOW_NOTIFICATION") return;
  const title = data.title || "إطلالة";
  const options = {
    body: data.body || "",
    icon: data.icon || "/logo-icon.jpg",
    badge: data.badge || "/logo-icon.jpg",
    tag: data.tag || "etlala-general",
    vibrate: [160, 70, 160],
    dir: "rtl",
    lang: "ar",
    data: data.data || { url: "/" },
  };
  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const url =
    (event.notification.data && event.notification.data.url) || "/";
  const target = new URL(url, self.location.origin).href;
  event.waitUntil(
    self.clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((clientList) => {
        for (const client of clientList) {
          if (client.url.startsWith(self.location.origin) && "focus" in client) {
            if ("navigate" in client) {
              return client.navigate(target).then(() => client.focus());
            }
            return client.focus();
          }
        }
        if (self.clients.openWindow) return self.clients.openWindow(target);
      }),
  );
});
