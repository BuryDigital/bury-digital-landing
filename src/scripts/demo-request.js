// Landing-page missed-call demo. Inserts a row into Supabase `demo_requests`
// using the publishable anon key (RLS policy `anon_insert_demo_requests` allows
// the insert — the key is safe to ship client-side). A downstream n8n worker
// picks up rows with status='pending' and sends the Twilio demo SMS.
//
// No service keys or Twilio credentials live here — only the public URL +
// publishable anon key, read from Vite env vars.

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Cooldown after a successful send, to stop accidental / abusive re-sends.
const COOLDOWN_MS = 60 * 1000;
const COOLDOWN_KEY = 'bd_demo_last_sent';

// Example enquiry types per industry — shown under the dropdown so the demo
// feels specific, and mirrors the per-industry SMS flow the user receives.
const INDUSTRY_HINTS = {
  real_estate: 'seller appraisal, property enquiry, rental enquiry',
  builders: 'quote request, renovation enquiry, site inspection',
  lawyers: 'consultation enquiry, matter type, urgency',
  plumbers: 'quote request, urgent job, service booking',
  electricians: 'quote request, urgent fault, install booking',
};

// Normalise an Australian mobile to E.164 (+61). Accepts spaces, dashes and
// brackets, plus 04…, +61…, and 61… prefixes. Returns null if not a valid
// AU mobile (must be an 04xx mobile, not a landline).
// e.g. "0412 345 678" -> "+61412345678"
function normaliseAuMobile(raw) {
  const cleaned = (raw || '').replace(/[\s()\-.]/g, '');
  let m;
  if ((m = cleaned.match(/^0(4\d{8})$/))) return '+61' + m[1];
  if ((m = cleaned.match(/^\+?61(4\d{8})$/))) return '+61' + m[1];
  return null;
}

export function initDemoRequest() {
  const form = document.getElementById('dr-form');
  if (!form) return;

  const card = document.getElementById('dr-card');
  const phoneInput = document.getElementById('dr-phone');
  const industrySelect = document.getElementById('dr-industry');
  const hintEl = document.getElementById('dr-hint');
  const phoneError = document.getElementById('dr-phone-error');
  const sendError = document.getElementById('dr-send-error');
  const successEl = document.getElementById('dr-success');
  const submitBtn = document.getElementById('dr-submit');

  // Keep the per-industry example line in sync with the dropdown.
  const renderHint = () => {
    const examples = INDUSTRY_HINTS[industrySelect.value];
    hintEl.innerHTML = examples ? `<strong>Sample enquiries:</strong> ${examples}` : '';
  };
  industrySelect.addEventListener('change', renderHint);
  renderHint();

  const clearPhoneError = () => {
    phoneError.hidden = true;
    phoneError.textContent = '';
    phoneInput.classList.remove('dr-invalid');
  };
  const showPhoneError = (msg) => {
    phoneError.textContent = msg;
    phoneError.hidden = false;
    phoneInput.classList.add('dr-invalid');
    phoneInput.focus();
  };
  phoneInput.addEventListener('input', clearPhoneError);

  const remainingCooldown = () => {
    const last = Number(localStorage.getItem(COOLDOWN_KEY) || 0);
    if (!last) return 0;
    return Math.max(0, COOLDOWN_MS - (Date.now() - last));
  };

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    clearPhoneError();
    sendError.hidden = true;

    // Honeypot: bots fill every field. Fake success, send nothing.
    if (form.botcheck && form.botcheck.value) {
      showSuccess();
      return;
    }

    // Empty / invalid number → clear inline error, no submission.
    const raw = phoneInput.value.trim();
    if (!raw) {
      showPhoneError('Enter your mobile number to get the demo.');
      return;
    }
    const normalised = normaliseAuMobile(raw);
    if (!normalised) {
      showPhoneError('Enter a valid Australian mobile number, e.g. 04XX XXX XXX.');
      return;
    }

    // Client-side cooldown after a successful send.
    const wait = remainingCooldown();
    if (wait > 0) {
      showPhoneError(`Demo already on its way — try again in ${Math.ceil(wait / 1000)}s.`);
      return;
    }

    if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
      sendError.hidden = false;
      return;
    }

    // Loading state.
    submitBtn.disabled = true;
    const originalLabel = submitBtn.textContent;
    submitBtn.textContent = 'Sending…';

    try {
      const res = await fetch(`${SUPABASE_URL}/rest/v1/demo_requests`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          apikey: SUPABASE_ANON_KEY,
          Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
          Prefer: 'return=minimal',
        },
        body: JSON.stringify({
          phone: normalised,
          industry: industrySelect.value,
          source: 'landing_page',
        }),
      });
      if (!res.ok) throw new Error(`non-2xx response: ${res.status}`);
      localStorage.setItem(COOLDOWN_KEY, String(Date.now()));
      showSuccess();
    } catch (_) {
      sendError.hidden = false;
      submitBtn.disabled = false;
      submitBtn.textContent = originalLabel;
    }
  });

  function showSuccess() {
    form.hidden = true;
    successEl.hidden = false;
    card.classList.add('dr-card--done');
  }
}
