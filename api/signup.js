// Real account sign-up: creates a Firebase Auth user (no store attached — the
// dashboard bounces store-less logins, so the account is inert until Mohammed
// approves it in sleet-admin), records the questionnaire in signupRequests/,
// and emails everything to sales@sleetsystems.com via Resend.
//
// Required env in the Vercel project (sleetsystems):
//   FIREBASE_SERVICE_ACCOUNT — the service-account JSON, verbatim
//   RESEND_API_KEY

import { initializeApp, cert, getApps } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";

const esc = (s) =>
  String(s || "").replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

function ensureApp() {
  if (!getApps().length) {
    initializeApp({
      credential: cert(JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)),
    });
  }
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ ok: false, error: "method not allowed" });
  }
  const {
    name, store, email, phone, password,
    storeType, registers, currentPos, timeline, notes, website,
  } = req.body || {};

  // honeypot field: real people never fill it in
  if (website) return res.status(200).json({ ok: true });

  if (!name || !store || !email || !password) {
    return res.status(400).json({ ok: false, error: "missing required fields" });
  }
  if (String(password).length < 8 || String(password).length > 200) {
    return res.status(400).json({ ok: false, error: "password must be at least 8 characters" });
  }
  for (const v of [name, store, email, storeType, registers, currentPos, timeline]) {
    if (String(v || "").length > 200) {
      return res.status(400).json({ ok: false, error: "field too long" });
    }
  }
  if (String(phone || "").length > 50 || String(notes || "").length > 5000) {
    return res.status(400).json({ ok: false, error: "field too long" });
  }

  ensureApp();

  // ── Create the Auth user. No custom claims and no store doc: the dashboard
  // signs out any login without a storeId claim, so the account stays inert. ──
  let uid;
  try {
    const rec = await getAuth().createUser({
      email: String(email).trim().toLowerCase(),
      password: String(password),
      displayName: String(name).slice(0, 100),
      emailVerified: false,
    });
    uid = rec.uid;
  } catch (e) {
    if (e && e.code === "auth/email-already-exists") {
      return res.status(409).json({ ok: false, error: "email exists" });
    }
    if (e && e.code === "auth/invalid-email") {
      return res.status(400).json({ ok: false, error: "invalid email" });
    }
    console.error("createUser failed", e);
    return res.status(500).json({ ok: false, error: "could not create account" });
  }

  // ── Pending request record for the sleet-admin approval list. ──
  const request = {
    uid,
    name: String(name),
    store: String(store),
    email: String(email).trim().toLowerCase(),
    phone: String(phone || ""),
    storeType: String(storeType || ""),
    registers: String(registers || ""),
    currentPos: String(currentPos || ""),
    timeline: String(timeline || ""),
    notes: String(notes || ""),
    status: "pending",
    createdAt: Date.now(),
    source: "sleetsystems.com",
  };
  try {
    await getFirestore().collection("signupRequests").doc(uid).set(request);
  } catch (e) {
    console.error("signupRequests write failed (account still created)", e);
  }

  // ── Notify sales@. Best-effort: the account exists either way. ──
  try {
    const html = `
      <h2>New account sign-up from sleetsystems.com</h2>
      <p>The login account was created and is <strong>pending approval</strong> —
         it cannot reach a store until you attach one in sleet-admin.</p>
      <p><strong>Name:</strong> ${esc(name)}</p>
      <p><strong>Store:</strong> ${esc(store)}</p>
      <p><strong>Email:</strong> ${esc(email)}</p>
      <p><strong>Phone:</strong> ${esc(phone) || "—"}</p>
      <hr>
      <p><strong>Store type:</strong> ${esc(storeType) || "— (skipped)"}</p>
      <p><strong>Registers needed:</strong> ${esc(registers) || "—"}</p>
      <p><strong>Using today:</strong> ${esc(currentPos) || "—"}</p>
      <p><strong>When they want to start:</strong> ${esc(timeline) || "—"}</p>
      <p><strong>Anything else:</strong></p>
      <p>${esc(notes || "—").replace(/\n/g, "<br>")}</p>
      <hr>
      <p><strong>Auth UID:</strong> ${esc(uid)}</p>
    `;
    const r = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "Sleet Systems Website <noreply@sleetsystems.com>",
        to: ["sales@sleetsystems.com"],
        reply_to: String(email),
        subject: `New account sign-up — ${String(store).slice(0, 80)}`,
        html,
      }),
    });
    if (!r.ok) console.error("resend error", r.status, await r.text());
  } catch (e) {
    console.error("resend send failed", e);
  }

  return res.status(200).json({ ok: true });
}
