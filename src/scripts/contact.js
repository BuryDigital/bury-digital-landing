export function initContact() {
  const toast = document.getElementById('toast');
  const targets = document.querySelectorAll('[data-copy]');
  if (!toast || targets.length === 0) return;

  let timer;

  async function copyText(text) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      const ta = document.createElement('textarea');
      ta.value = text;
      ta.setAttribute('readonly', '');
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      let ok = false;
      try { ok = document.execCommand('copy'); } catch { ok = false; }
      ta.remove();
      return ok;
    }
  }

  function showToast() {
    toast.classList.add('show');
    clearTimeout(timer);
    timer = setTimeout(() => toast.classList.remove('show'), 1800);
  }

  targets.forEach((el) => {
    el.addEventListener('click', async () => {
      const ok = await copyText(el.dataset.copy);
      if (ok) showToast();
    });
  });
}
