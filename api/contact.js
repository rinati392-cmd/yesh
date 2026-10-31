// YESH. contact endpoint — Vercel / Netlify-style Node serverless function (Node 18+, no dependencies).
// Required env vars: RESEND_API_KEY, CONTACT_TO (your real inbox), CONTACT_FROM (a sender on a domain verified in Resend).
// Optional: ALLOWED_ORIGIN (e.g. https://yesh.co.il) — requests from other origins are rejected.

const WINDOW_MS = 10 * 60 * 1000;
const MAX_PER_WINDOW = 5;
const hits = new Map(); // best-effort per-instance rate limit

const TYPES = ['', 'מיתוג חברת נדל״ן', 'מיתוג פרויקט מגורים', 'מיתוג מתחם מסחרי', 'אתר וקמפיין', 'משהו אחר'];
const clean = (v, max) => String(v ?? '').replace(/[\u0000-\u001f\u007f]/g, ' ').trim().slice(0, max);
const isEmail = v => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v);
const isPhone = v => /^[+\d()\s-]{9,20}$/.test(v);

function send(res, status, body) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');
  res.end(JSON.stringify(body));
}

async function readBody(req) {
  if (req.body && typeof req.body === 'object') return req.body;
  if (typeof req.body === 'string') return JSON.parse(req.body);
  let raw = '';
  for await (const chunk of req) { raw += chunk; if (raw.length > 10_000) throw new Error('too large'); }
  return JSON.parse(raw || '{}');
}

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') { res.setHeader('Allow', 'POST'); return send(res, 405, { ok: false, error: 'method' }); }

  const origin = req.headers.origin || '';
  if (process.env.ALLOWED_ORIGIN && origin !== process.env.ALLOWED_ORIGIN) return send(res, 403, { ok: false, error: 'origin' });
  if (!String(req.headers['content-type'] || '').includes('application/json')) return send(res, 415, { ok: false, error: 'type' });

  const ip = String(req.headers['x-forwarded-for'] || req.socket?.remoteAddress || '').split(',')[0].trim();
  const now = Date.now();
  const recent = (hits.get(ip) || []).filter(t => now - t < WINDOW_MS);
  if (recent.length >= MAX_PER_WINDOW) return send(res, 429, { ok: false, error: 'rate' });
  hits.set(ip, [...recent, now]);

  let body;
  try { body = await readBody(req); } catch { return send(res, 400, { ok: false, error: 'body' }); }

  // Bots: honeypot filled or submitted faster than a human can type. Pretend success, send nothing.
  if (clean(body.website, 200) || Number(body.elapsed) < 2500) return send(res, 200, { ok: true });

  const name = clean(body.name, 80);
  const company = clean(body.company, 120);
  const contact = clean(body.contact, 120);
  const type = clean(body.type, 60);
  const message = clean(String(body.message ?? '').replace(/\r/g, ''), 2000);

  if (name.length < 2) return send(res, 422, { ok: false, error: 'name' });
  if (!isEmail(contact) && !isPhone(contact)) return send(res, 422, { ok: false, error: 'contact' });
  if (body.consent !== true) return send(res, 422, { ok: false, error: 'consent' });
  if (!TYPES.includes(type)) return send(res, 422, { ok: false, error: 'type' });

  const { RESEND_API_KEY, CONTACT_TO, CONTACT_FROM } = process.env;
  if (!RESEND_API_KEY || !CONTACT_TO || !CONTACT_FROM) return send(res, 503, { ok: false, error: 'not-configured' });

  const text = [
    `שם: ${name}`, `חברה: ${company || '—'}`, `יצירת קשר: ${contact}`, `סוג פרויקט: ${type || '—'}`,
    `פרטים:\n${message || '—'}`, '', `הסכמה לפרטיות: כן · ${new Date(now).toISOString()}`,
  ].join('\n');

  try {
    const r = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${RESEND_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: CONTACT_FROM, to: [CONTACT_TO], subject: `פנייה חדשה מאתר YESH. — ${name}`, text,
        ...(isEmail(contact) ? { reply_to: contact } : {}),
      }),
    });
    if (!r.ok) return send(res, 502, { ok: false, error: 'mail' });
    return send(res, 200, { ok: true });
  } catch {
    return send(res, 502, { ok: false, error: 'mail' });
  }
};
