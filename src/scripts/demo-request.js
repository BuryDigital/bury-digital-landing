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

  const phoneInput = document.getElementById('dr-phone');
  const errorEl = document.getElementById('dr-error');
  const resultEl = document.getElementById('dr-result');
  const resultMsg = document.getElementById('dr-result-msg');
  const submitBtn = document.getElementById('dr-submit');

  const showError = (msg) => { errorEl.textContent = msg; errorEl.hidden = false; };
  const clearError = () => { errorEl.hidden = true; errorEl.textContent = ''; };
  phoneInput.addEventListener('input', clearError);

  // Custom themed industry dropdown (search + keyboard nav), built from the
  // shared INDUSTRIES list. Selected value lives on the hidden #dr-industry input.
  const industry = initIndustryCombo(clearError);

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    clearError();

    const phone = phoneInput.value.trim();
    const industryValue = industry.value();
    if (!phone) { showError('Enter your mobile number to get the demo.'); return; }
    if (!industryValue) { showError('Choose your industry.'); industry.open(); return; }

    // Loading state.
    submitBtn.disabled = true;
    const originalLabel = submitBtn.textContent;
    submitBtn.textContent = 'Sending…';

    try {
      const res = await fetch('/api/demo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, industry: industryValue }),
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

// Accessible, themed industry picker: a trigger button + a popover panel with
// a search box and a scrollable listbox. Replaces the native <select> so the
// popup can be styled to match the page (native popups can't be in most
// browsers). Falls back gracefully — if the markup is absent it does nothing.
function initIndustryCombo(onChange) {
  const root = document.getElementById('dr-combo');
  const btn = document.getElementById('dr-industry-btn');
  const valueEl = document.getElementById('dr-combo-value');
  const panel = document.getElementById('dr-combo-panel');
  const search = document.getElementById('dr-combo-search');
  const list = document.getElementById('dr-combo-list');
  const emptyEl = document.getElementById('dr-combo-empty');
  const hidden = document.getElementById('dr-industry');

  if (!root || !btn || !panel || !list || !hidden) {
    return { value: () => '', open: () => {}, };
  }

  // Build one <li role="option"> per industry.
  const options = INDUSTRIES.map(({ v, l }, i) => {
    const li = document.createElement('li');
    li.className = 'dr-combo-option';
    li.id = `dr-opt-${i}`;
    li.setAttribute('role', 'option');
    li.setAttribute('aria-selected', 'false');
    li.dataset.value = v;
    li.dataset.label = l.toLowerCase();
    li.textContent = l;
    list.appendChild(li);
    return li;
  });

  let active = -1; // index into the currently-visible options for keyboard nav

  const visible = () => options.filter((o) => !o.hidden);

  const setActive = (idx) => {
    const vis = visible();
    options.forEach((o) => o.classList.remove('is-active'));
    active = idx;
    if (idx >= 0 && idx < vis.length) {
      const el = vis[idx];
      el.classList.add('is-active');
      search.setAttribute('aria-activedescendant', el.id);
      el.scrollIntoView({ block: 'nearest' });
    } else {
      search.removeAttribute('aria-activedescendant');
    }
  };

  const filter = (q) => {
    const term = q.trim().toLowerCase();
    let shown = 0;
    for (const o of options) {
      const match = !term || o.dataset.label.includes(term);
      o.hidden = !match;
      if (match) shown += 1;
    }
    emptyEl.hidden = shown > 0;
    setActive(shown > 0 ? 0 : -1);
  };

  const isOpen = () => !panel.hidden;

  const open = () => {
    if (isOpen()) return;
    panel.hidden = false;
    btn.setAttribute('aria-expanded', 'true');
    root.classList.add('is-open');
    search.value = '';
    filter('');
    // Pre-highlight the current selection if there is one.
    const selIdx = visible().findIndex((o) => o.dataset.value === hidden.value);
    setActive(selIdx >= 0 ? selIdx : 0);
    search.focus();
    document.addEventListener('pointerdown', onDocPointer, true);
  };

  const close = ({ focusBtn = false } = {}) => {
    if (!isOpen()) return;
    panel.hidden = true;
    btn.setAttribute('aria-expanded', 'false');
    root.classList.remove('is-open');
    document.removeEventListener('pointerdown', onDocPointer, true);
    if (focusBtn) btn.focus();
  };

  const select = (li) => {
    if (!li) return;
    hidden.value = li.dataset.value;
    valueEl.textContent = li.textContent;
    valueEl.classList.remove('is-placeholder');
    options.forEach((o) => o.setAttribute('aria-selected', 'false'));
    li.setAttribute('aria-selected', 'true');
    if (typeof onChange === 'function') onChange();
    close({ focusBtn: true });
  };

  function onDocPointer(e) {
    if (!root.contains(e.target)) close();
  }

  btn.addEventListener('click', () => (isOpen() ? close({ focusBtn: true }) : open()));
  btn.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowDown' || e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      open();
    }
  });

  search.addEventListener('input', () => filter(search.value));
  search.addEventListener('keydown', (e) => {
    const vis = visible();
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (vis.length) setActive((active + 1) % vis.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (vis.length) setActive((active - 1 + vis.length) % vis.length);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      select(vis[active]);
    } else if (e.key === 'Escape') {
      e.preventDefault();
      close({ focusBtn: true });
    } else if (e.key === 'Tab') {
      close();
    }
  });

  // Pointer-driven highlight + selection on the options.
  list.addEventListener('mousemove', (e) => {
    const li = e.target.closest('.dr-combo-option');
    if (li && !li.hidden) setActive(visible().indexOf(li));
  });
  list.addEventListener('click', (e) => {
    const li = e.target.closest('.dr-combo-option');
    if (li) select(li);
  });

  return { value: () => hidden.value, open };
}
