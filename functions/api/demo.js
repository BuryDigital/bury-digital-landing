// POST /api/demo — Cloudflare Pages Function (server-side only).
//
// Browser never talks to n8n or Supabase directly. This route validates +
// normalises the input, throttles per-phone using the Supabase SERVICE ROLE
// key, then forwards to the n8n "Start Demo" webhook. Secrets
// (N8N_DEMO_WEBHOOK_URL, N8N_DEMO_SECRET, SUPABASE_SERVICE_ROLE_KEY) live in
// context.env and are never sent to the client.

import { INDUSTRIES } from '../../src/data/industries.js';

const VALID_INDUSTRIES = new Set(INDUSTRIES.map((i) => i.v));
const DEFAULT_SUPABASE_URL = 'https://sibyvtphxadrqnwamgdt.supabase.co';
const THROTTLE_LIMIT = 3;      // per phone
const THROTTLE_WINDOW_MS = 24 * 60 * 60 * 1000;

function json(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

// Normalise to E.164 AU EXACTLY as the workflow logs it, so throttle counts
// match: strip whitespace; leading "0" -> "+61"+rest; leading "+" kept as-is;
// otherwise "+61"+value. Must end up matching /^\+61\d{9}$/.
function normaliseAuPhone(raw) {
  let p = String(raw ?? '').replace(/\s/g, '');
  if (p.startsWith('0')) p = '+61' + p.slice(1);
  else if (p.startsWith('+')) { /* keep */ }
  else p = '+61' + p;
  return /^\+61\d{9}$/.test(p) ? p : null;
}

export async function onRequestPost(context) {
  const { request, env } = context;

  // 1. Parse body.
  let body;
  try {
    body = await request.json();
  } catch {
    return json({ status: 'error', message: 'Invalid request body.' }, 400);
  }
  const { phone, industry, name } = body || {};

  // 2. Validate industry.
  if (typeof industry !== 'string' || !VALID_INDUSTRIES.has(industry)) {
    return json({ status: 'error', message: 'Unknown industry.' }, 400);
  }

  // 3. Normalise phone.
  const normalised = normaliseAuPhone(phone);
  if (!normalised) {
    return json({ status: 'error', message: 'Enter a valid Australian mobile number.' }, 400);
  }

  const SUPABASE_URL = env.SUPABASE_URL || DEFAULT_SUPABASE_URL;
  const SERVICE_KEY = env.SUPABASE_SERVICE_ROLE_KEY;
  const N8N_URL = env.N8N_DEMO_WEBHOOK_URL;
  const N8N_SECRET = env.N8N_DEMO_SECRET;

  // Missing server config — generic error, never reveal which var.
  if (!SERVICE_KEY || !N8N_URL || !N8N_SECRET) {
    return json({ status: 'error', message: 'Demo is temporarily unavailable.' }, 500);
  }

  // 4. Throttle: count demo_requests for this phone in the last 24h.
  try {
    const since = new Date(Date.now() - THROTTLE_WINDOW_MS).toISOString();
    const url = `${SUPABASE_URL}/rest/v1/demo_requests`
      + `?select=id&phone=eq.${encodeURIComponent(normalised)}`
      + `&created_at=gte.${encodeURIComponent(since)}`;
    const countRes = await fetch(url, {
      headers: {
        apikey: SERVICE_KEY,
        Authorization: `Bearer ${SERVICE_KEY}`,
        Prefer: 'count=exact',
        Range: '0-0',
      },
    });
    let count = 0;
    const cr = countRes.headers.get('content-range'); // e.g. "0-0/5" or "*/0"
    if (cr && cr.includes('/')) {
      const n = parseInt(cr.split('/')[1], 10);
      if (Number.isFinite(n)) count = n;
    } else if (countRes.ok) {
      const rows = await countRes.json();
      count = Array.isArray(rows) ? rows.length : 0;
    }
    if (count >= THROTTLE_LIMIT) {
      return json(
        { status: 'throttled', message: "You've hit the demo limit for this number today, try again tomorrow." },
        429,
      );
    }
  } catch {
    return json({ status: 'error', message: 'Demo is temporarily unavailable.' }, 500);
  }

  // 5. Forward to n8n. 2xx = success.
  try {
    const fwd = await fetch(N8N_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-demo-secret': N8N_SECRET },
      body: JSON.stringify({ phone: normalised, industry, name: name || undefined }),
    });
    if (!fwd.ok) {
      return json({ status: 'error', message: 'Something went wrong sending the demo.' }, 502);
    }
  } catch {
    return json({ status: 'error', message: 'Something went wrong sending the demo.' }, 502);
  }

  return json({ status: 'ok', message: 'Sent — check your phone in a few seconds.' }, 200);
}
