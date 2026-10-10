// Signage inquiries use the site's existing Resend setup. No customer account is created.
import { validateQuote, services } from '../assets/signage-quote-model.mjs';

const escapeHtml = value => String(value).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const row = (label, value) => `<p><strong>${label}:</strong> ${escapeHtml(value || 'Not provided').replace(/\n/g, '<br>')}</p>`;

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ ok: false, error: 'Use the quote form to send a request.' });
  }
  const origin = req.headers?.origin;
  if (origin && !['https://www.sleetpos.com', 'https://sleetpos.com', 'https://sleetsystems.com', 'https://www.sleetsystems.com'].includes(origin)) {
    return res.status(403).json({ ok: false, error: 'Please send your request from the Sleet website.' });
  }
  const body = req.body;
  if (!body || typeof body !== 'object' || Array.isArray(body)) return res.status(400).json({ ok: false, error: 'Please complete the quote form.' });
  if (JSON.stringify(body).length > 24000) return res.status(413).json({ ok: false, error: 'Your request is too long. Please shorten the notes.' });
  if (typeof body.website === 'string' && body.website) return res.status(200).json({ ok: true });
  const result = validateQuote(body);
  if (!result.ok) return res.status(400).json(result);
  if (!process.env.RESEND_API_KEY) return res.status(503).json({ ok: false, error: 'The form is temporarily unavailable. Please email sales@sleetsystems.com.' });
  const q = result.value;
  const html = `<h2>Store signage quote request</h2>` +
    row('Name', q.name) + row('Business', q.business) + row('Email', q.email) + row('Phone', q.phone) + row('City / state', q.location) +
    q.services.map(key => `<h3>${services[key].name}</h3>` + row('Type / placement', q.items[key].format) + row('Dimensions', q.items[key].dimensions) + row('Quantity', q.items[key].quantity)).join('') +
    '<hr>' + row('Help needed', q.help) + row('Artwork', q.artwork) + row('Timing', q.timeline) + row('Budget', q.budget) + row('Reference link', q.reference) + row('Notes', q.notes);
  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
      signal: AbortSignal.timeout(10000),
      body: JSON.stringify({
        from: 'Sleet Systems Website <noreply@sleetsystems.com>',
        to: ['sales@sleetsystems.com'], reply_to: q.email,
        subject: `Signage quote — ${q.business.replace(/[\r\n]/g, ' ').slice(0, 80)}`,
        html,
      }),
    });
    if (!response.ok) throw new Error(`Email provider status ${response.status}`);
    return res.status(200).json({ ok: true });
  } catch {
    // Avoid logging the customer's contact details or the provider response body.
    return res.status(502).json({ ok: false, error: 'Your request could not be sent. Try again or email sales@sleetsystems.com.' });
  }
}
