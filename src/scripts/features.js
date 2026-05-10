export function initFeatureTabs() {
  const tabs = document.getElementById('feat-tabs');
  if (!tabs) return;
  tabs.addEventListener('click', (e) => {
    const chip = e.target.closest('[data-feat]');
    if (!chip) return;
    tabs.querySelectorAll('[data-feat]').forEach((c) => c.classList.remove('active'));
    chip.classList.add('active');
    const feat = chip.dataset.feat;
    document.querySelectorAll('[id^="feat-qs-"]').forEach((p) => {
      p.hidden = p.id !== `feat-qs-${feat}`;
    });
  });
}
