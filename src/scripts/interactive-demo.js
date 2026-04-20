import { DEMO_SCRIPTS, INDUSTRY_HUES } from './demo-scripts.js';

const DEFAULT_HUE = 210;
const STAMP_TEXT = 'Qualified in 48 seconds';

function initials(fullName) {
  return fullName.split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase();
}

function renderThread(container, thread) {
  container.innerHTML = '';
  thread.forEach(([who, text]) => {
    const bubble = document.createElement('div');
    bubble.className = 'bub ' + who;
    bubble.textContent = text;
    container.appendChild(bubble);
  });
  const stamp = document.createElement('div');
  stamp.className = 'stamp';
  stamp.textContent = STAMP_TEXT;
  container.appendChild(stamp);
}

function renderSummary(container, data, hue) {
  const avInitials = initials(data.name);
  container.innerHTML = `
    <div class="who">
      <div class="av" style="background:hsl(${hue} 40% 18%); color:hsl(${hue} 60% 72%);">${avInitials}</div>
      <div><div class="n">${data.name}</div><div class="p">${data.phone} · ${data.suburb}</div></div>
      <div style="margin-left:auto;"><span class="pill pill-new"><span class="pd"></span>Qualified</span></div>
    </div>
    <div class="demo-summary-grid">
      ${data.summary.map(([k, v, cls]) => `<div class="demo-summary-cell"><div class="k">${k}</div><div class="v ${cls || ''}">${v}</div></div>`).join('')}
    </div>
    <div style="display:flex; gap:8px; margin-top:auto;">
      <button class="btn btn-primary" style="flex:1;">Call back</button>
      <button class="btn btn-outline">View thread</button>
    </div>
  `;
}

export function initInteractiveDemo() {
  const tabs = document.getElementById('demo-tabs');
  const smsEl = document.getElementById('demo-sms');
  const sumEl = document.getElementById('demo-sum');
  const bizEl = document.getElementById('demo-biz');
  if (!tabs || !smsEl || !sumEl || !bizEl) return;

  function select(industry) {
    const data = DEMO_SCRIPTS[industry];
    if (!data) return;
    bizEl.textContent = data.biz;
    renderThread(smsEl, data.thread);
    renderSummary(sumEl, data, INDUSTRY_HUES[industry] ?? DEFAULT_HUE);
  }

  tabs.addEventListener('click', (e) => {
    const button = e.target.closest('.demo-tab');
    if (!button) return;
    tabs.querySelectorAll('.demo-tab').forEach((t) => t.classList.remove('active'));
    button.classList.add('active');
    select(button.dataset.ind);
  });

  select('seller');
}
