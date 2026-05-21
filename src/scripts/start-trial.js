const WEBHOOK_URL = 'https://ocbury.app.n8n.cloud/webhook/trial-signup';

export function initStartTrial() {
  const form = document.getElementById('trial-form');
  if (!form) return;

  const submitBtn = document.getElementById('trial-submit');
  const errorEl = document.getElementById('trial-error');
  const formCard = document.getElementById('trial-form-card');
  const successEl = document.getElementById('trial-success');
  const industrySelect = document.getElementById('tf-industry');
  const otherWrapper = document.getElementById('tf-industry-other-wrapper');
  const otherInput = document.getElementById('tf-industry-other');

  const showSuccess = () => {
    formCard.hidden = true;
    successEl.hidden = false;
    successEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  // Show/hide the "What type of business?" field based on industry selection.
  // Uses style.display because the .field rule sets display:flex with higher
  // specificity than [hidden], so the `hidden` attribute alone wouldn't hide
  // it. 'flex' on show matches the other fields' label/input gap exactly.
  industrySelect.addEventListener('change', () => {
    if (industrySelect.value === 'Other') {
      otherWrapper.style.display = 'flex';
      otherInput.required = true;
      otherInput.focus();
    } else {
      otherWrapper.style.display = 'none';
      otherInput.required = false;
      otherInput.value = '';
    }
  });

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
    if (data.industry === 'Other' && data.industry_other) {
      payload.industry_other = data.industry_other;
    }

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
