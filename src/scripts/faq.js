export function initFaq() {
  const list = document.getElementById('faq-list');
  if (!list) return;
  list.addEventListener('click', (e) => {
    const button = e.target.closest('.faq-q');
    if (!button) return;
    const item = button.parentElement;
    const isOpen = item.classList.toggle('open');
    button.setAttribute('aria-expanded', String(isOpen));
  });
}
