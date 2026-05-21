// Replace N8N_WEBHOOK_URL_PLACEHOLDER with the production n8n webhook URL before deploying.
const WEBHOOK_URL = 'N8N_WEBHOOK_URL_PLACEHOLDER';

export function initStartTrial() {
  const form = document.getElementById('trial-form');
  if (!form) return;

  const submitBtn = document.getElementById('trial-submit');
  const errorEl = document.getElementById('trial-error');
  const formCard = document.getElementById('trial-form-card');
  const successEl = document.getElementById('trial-success');

  const showSuccess = () => {
    formCard.hidden = true;
    successEl.hidden = false;
    successEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }

    const data = Object.fromEntries(new FormData(form).entries());

    // Honeypot: bots autofill every field; humans never see this one.
    // Silently drop without sending.
    if (data.botcheck) {
      showSuccess();
      return;
    }

    errorEl.hidden = true;
    submitBtn.disabled = true;
    const originalLabel = submitBtn.textContent;
    submitBtn.textContent = 'Sending…';

    const payload = {
      name: data.name,
      email: data.email,
      business_name: data.business_name,
      industry: data.industry,
      phone: data.phone,
      notes: data.notes || '',
      submitted_at: new Date().toISOString(),
    };

    try {
      const res = await fetch(WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error('non-2xx response');
      showSuccess();
    } catch (_) {
      errorEl.hidden = false;
      submitBtn.disabled = false;
      submitBtn.textContent = originalLabel;
    }
  });
}
