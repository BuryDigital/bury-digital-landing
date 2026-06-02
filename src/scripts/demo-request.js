// Landing-page missed-call demo. The browser only ever talks to the
// same-origin /api/demo route (a Cloudflare Pages Function) — never n8n or
// Supabase directly. The server validates, throttles, and forwards to n8n.

import { INDUSTRIES } from '../data/industries.js';

const MESSAGES = {
  ok: 'Sent — check your phone in a few seconds.',
  throttled: "You've hit the demo limit for this number today, try again tomorrow.",
  error: 'Something went wrong sending the demo. Please try again.',
};

export function initDemoRequest() {
  const form = document.getElementById('dr-form');
  if (!form) return;

  const select = document.getElementById('dr-industry');
  const phoneInput = document.getElementById('dr-phone');
  const errorEl = document.getElementById('dr-error');
  const resultEl = document.getElementById('dr-result');
  const resultMsg = document.getElementById('dr-result-msg');
  const submitBtn = document.getElementById('dr-submit');

  // Populate the industry dropdown from the shared INDUSTRIES list.
  for (const { v, l } of INDUSTRIES) {
    const opt = document.createElement('option');
    opt.value = v;
    opt.textContent = l;
    select.appendChild(opt);
  }

  const showError = (msg) => { errorEl.textContent = msg; errorEl.hidden = false; };
  const clearError = () => { errorEl.hidden = true; errorEl.textContent = ''; };
  phoneInput.addEventListener('input', clearError);
  select.addEventListener('change', clearError);

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    clearError();

    const phone = phoneInput.value.trim();
    const industry = select.value;
    if (!phone) { showError('Enter your mobile number to get the demo.'); return; }
    if (!industry) { showError('Choose your industry.'); return; }

    // Loading state.
    submitBtn.disabled = true;
    const originalLabel = submitBtn.textContent;
    submitBtn.textContent = 'Sending…';

    try {
      const res = await fetch('/api/demo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, industry }),
      });

      if (res.ok) {
        // Success — replace the form with the confirmation.
        form.hidden = true;
        resultMsg.textContent = MESSAGES.ok;
        resultEl.hidden = false;
        return;
      }

      // Keep the form so the user can adjust / retry.
      showError(res.status === 429 ? MESSAGES.throttled : MESSAGES.error);
    } catch (_) {
      showError(MESSAGES.error);
    }

    submitBtn.disabled = false;
    submitBtn.textContent = originalLabel;
  });
}
