export function initComingSoon() {
  const form = document.getElementById('cs-form');
  if (!form) return;

  const email = form.querySelector('#cs-email');
  const industry = form.querySelector('#cs-industry');
  const otherWrap = form.querySelector('#cs-other-wrap');
  const otherInput = form.querySelector('#cs-industry-other');
  const btn = form.querySelector('button[type="submit"]');

  const syncOther = () => {
    const isOther = industry.value === 'Other';
    otherWrap.hidden = !isOther;
    otherInput.required = isOther;
    if (!isOther) otherInput.value = '';
  };
  industry.addEventListener('change', syncOther);
  syncOther();

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!email.value || !email.checkValidity()) {
      email.focus();
      return;
    }
    if (industry.value === 'Other' && !otherInput.value.trim()) {
      otherInput.focus();
      return;
    }

    btn.disabled = true;
    btn.textContent = 'Sending\u2026';

    try {
      const res = await fetch(form.action, {
        method: 'POST',
        headers: { 'Accept': 'application/json' },
        body: new FormData(form),
      });
      if (!res.ok) throw new Error('Request failed');
      btn.textContent = 'Thanks \u2014 we\u2019ll be in touch';
      email.disabled = true;
      industry.disabled = true;
      otherInput.disabled = true;
    } catch (_) {
      btn.disabled = false;
      btn.textContent = 'Try again';
    }
  });
}
