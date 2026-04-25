/**
 * إرسال إشعارات FCM عند إنشاء سجلات في Firestore — يعمل والتطبيق مغلق.
 * النشر: من جذر المشروع → npm install في مجلد functions ثم firebase deploy --only functions
 */
const { onDocumentCreated } = require("firebase-functions/v2/firestore");
const { initializeApp } = require("firebase-admin/app");
const { getFirestore } = require("firebase-admin/firestore");
const { getMessaging } = require("firebase-admin/messaging");

initializeApp();
const db = getFirestore();
const messaging = getMessaging();

const REGION = "europe-west1";

async function tokenMapFromFirestore() {
  const snap = await db.collection("fcmTokens").get();
  /** @type {Map<string, FirebaseFirestore.DocumentReference[]>} */
  const tokenToRefs = new Map();
  snap.docs.forEach((doc) => {
    const t = doc.data().token;
    if (!t || typeof t !== "string") return;
    if (!tokenToRefs.has(t)) tokenToRefs.set(t, []);
    tokenToRefs.get(t).push(doc.ref);
  });
  return tokenToRefs;
}

/**
 * @param {string} title
 * @param {string} body
 * @param {Record<string, string>} [data]
 */
async function sendMulticast(title, body, data = {}) {
  const tokenToRefs = await tokenMapFromFirestore();
  const tokens = [...tokenToRefs.keys()];
  if (tokens.length === 0) return;

  const dataPayload = {};
  Object.entries(data).forEach(([k, v]) => {
    dataPayload[k] = String(v);
  });

  for (let i = 0; i < tokens.length; i += 400) {
    const batch = tokens.slice(i, i + 400);
    const res = await messaging.sendEachForMulticast({
      tokens: batch,
      notification: { title, body },
      data: dataPayload,
    });
    res.responses.forEach((r, idx) => {
      if (r.success) return;
      const code = r.error?.code || "";
      if (
        code.includes("registration-token-not-registered") ||
        code.includes("invalid-registration-token")
      ) {
        const bad = batch[idx];
        const refs = tokenToRefs.get(bad) || [];
        refs.forEach((ref) => ref.delete().catch(() => {}));
      }
    });
  }
}

exports.onExpenseCreate = onDocumentCreated(
  { document: "expenses/{id}", region: REGION },
  async (event) => {
    const d = event.data?.data();
    if (!d) return;
    const who = d.createdBy || "مستخدم";
    const desc = String(d.description || "").slice(0, 120);
    await sendMulticast("مصروف جديد", `${who}: ${desc || "—"}`, {
      url: "/expenses",
    });
  },
);

exports.onInvoiceCreate = onDocumentCreated(
  { document: "invoices/{id}", region: REGION },
  async (event) => {
    const d = event.data?.data();
    if (!d) return;
    const who = d.createdBy || "مستخدم";
    const num = d.invoiceNumber || "";
    await sendMulticast("فاتورة جديدة", `${who} — ${num}`, {
      url: "/invoices",
    });
  },
);

exports.onPaymentCreate = onDocumentCreated(
  { document: "payments/{id}", region: REGION },
  async (event) => {
    const d = event.data?.data();
    if (!d) return;
    const who = d.createdBy || "مستخدم";
    const amt = d.amount != null ? String(d.amount) : "";
    await sendMulticast("دفعة جديدة", `${who} — ${amt} د.ل`, {
      url: "/payments",
    });
  },
);

exports.onClientCreate = onDocumentCreated(
  { document: "clients/{id}", region: REGION },
  async (event) => {
    const d = event.data?.data();
    if (!d) return;
    const who = d.createdBy || "مستخدم";
    const name = d.name || "";
    await sendMulticast("عميل جديد", `${who}: ${name}`, {
      url: "/clients",
    });
  },
);

exports.onFundTxCreate = onDocumentCreated(
  { document: "global_fund_transactions/{id}", region: REGION },
  async (event) => {
    const d = event.data?.data();
    if (!d) return;
    const type = d.type === "deposit" ? "إيداع عهدة" : "حركة عهدة";
    const uname = d.userName || "";
    const amt = d.amount != null ? String(d.amount) : "";
    await sendMulticast(type, `${uname} — ${amt} د.ل`, { url: "/fund" });
  },
);
