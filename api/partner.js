// Partnership sign-up form -> email to support@sleetsystems.com via Resend.
// Requires RESEND_API_KEY set in the Vercel project (sleetsystems).

const esc = (s) =>
  String(s || "").replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ ok: false, error: "method not allowed" });
  }
  const { name, company, email, phone, message, website } = req.body || {};

  // honeypot field: real people never fill it in
  if (website) return res.status(200).json({ ok: true });

  if (!name || !email || !message) {
    return res.status(400).json({ ok: false, error: "missing required fields" });
  }
  if (String(name).length > 200 || String(email).length > 200 ||
      String(company || "").length > 200 || String(phone || "").length > 50 ||
      String(message).length > 5000) {
    return res.status(400).json({ ok: false, error: "field too long" });
  }

  const html = `
    <h2>Partnership request from sleetsystems.com</h2>
    <p><strong>Name:</strong> ${esc(name)}</p>
    <p><strong>Company:</strong> ${esc(company) || "—"}</p>
    <p><strong>Email:</strong> ${esc(email)}</p>
    <p><strong>Phone:</strong> ${esc(phone) || "—"}</p>
    <p><strong>Message:</strong></p>
    <p>${esc(message).replace(/\n/g, "<br>")}</p>
  `;

  const r = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: "Sleet Systems Website <noreply@sleetsystems.com>",
      to: ["support@sleetsystems.com"],
      reply_to: String(email),
      subject: `Partnership request — ${String(name).slice(0, 80)}`,
      html,
    }),
  });

  if (!r.ok) {
    console.error("resend error", r.status, await r.text());
    return res.status(502).json({ ok: false, error: "email send failed" });
  }
  return res.status(200).json({ ok: true });
}
