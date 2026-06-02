// POST /api/demo — Cloudflare Pages Function (server-side only).
//
// Browser never talks to n8n or Supabase directly. This route validates +
// normalises the input, throttles per-phone using the Supabase SERVICE ROLE
// key, then forwards to the n8n "Start Demo" webhook. Secrets
// (N8N_DEMO_WEBHOOK_URL, N8N_DEMO_SECRET, SUPABASE_SERVICE_ROLE_KEY) come from
// the Pages Function env binding (context.env) — never process.env, never the
// client.

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
  // Pages Function env binding — NOT process.env.
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

  // TODO: revert verbose errors before launch
  // Config check — report which server vars are missing (presence only, never
  // the values themselves).
  if (!SERVICE_KEY || !N8N_URL || !N8N_SECRET) {
    const detail = {
      SUPABASE_SERVICE_ROLE_KEY: Boolean(SERVICE_KEY),
      N8N_DEMO_WEBHOOK_URL: Boolean(N8N_URL),
      N8N_DEMO_SECRET: Boolean(N8N_SECRET),
    };
    console.log('[/api/demo] stage=config detail=', detail);
    return json({ status: 'error', stage: 'config', detail }, 500);
  }

  // 4. Throttle: count demo_requests for this phone in the last 24h.
  let count = 0;
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
    if (!countRes.ok) {
      const txt = (await countRes.text().catch(() => '')) || '';
      const detail = `Supabase HTTP ${countRes.status}: ${txt.slice(0, 300)}`;
      console.log('[/api/demo] stage=throttle detail=', detail);
      return json({ status: 'error', stage: 'throttle', detail }, 500);
    }
    const cr = countRes.headers.get('content-range'); // e.g. "0-0/5" or "*/0"
    if (cr && cr.includes('/')) {
      const n = parseInt(cr.split('/')[1], 10);
      if (Number.isFinite(n)) count = n;
    } else {
      const rows = await countRes.json().catch(() => []);
      count = Array.isArray(rows) ? rows.length : 0;
    }
  } catch (err) {
    const detail = err instanceof Error ? err.message : String(err);
    console.log('[/api/demo] stage=throttle (exception) detail=', detail);
    return json({ status: 'error', stage: 'throttle', detail }, 500);
  }

  if (count >= THROTTLE_LIMIT) {
    return json(
      { status: 'throttled', message: "You've hit the demo limit for this number today, try again tomorrow." },
      429,
    );
  }

  // 5. Forward to n8n — network/fetch stage.
  let fwd;
  try {
    fwd = await fetch(N8N_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-demo-secret': N8N_SECRET },
      body: JSON.stringify({ phone: normalised, industry, name: name || undefined }),
    });
  } catch (err) {
    const detail = err instanceof Error ? err.message : String(err);
    console.log('[/api/demo] stage=n8n_fetch detail=', detail);
    return json({ status: 'error', stage: 'n8n_fetch', detail }, 502);
  }

  // n8n response-status stage.
  if (!fwd.ok) {
    const txt = (await fwd.text().catch(() => '')) || '';
    const detail = `n8n HTTP ${fwd.status}: ${txt.slice(0, 300)}`;
    console.log('[/api/demo] stage=n8n_status detail=', detail);
    return json({ status: 'error', stage: 'n8n_status', detail }, 502);
  }

  return json({ status: 'ok', message: 'Sent — check your phone in a few seconds.' }, 200);
}
