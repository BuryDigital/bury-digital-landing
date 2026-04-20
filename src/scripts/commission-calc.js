const MONTHLY_PRICE_AUD = 297;
const STANDARD_RATE = 0.25;
const PERFORMANCE_RATE = 0.30;
const PERFORMANCE_THRESHOLD = 20;

function rateFor(clientCount) {
  return clientCount >= PERFORMANCE_THRESHOLD ? PERFORMANCE_RATE : STANDARD_RATE;
}

function tierLabel(clientCount) {
  return clientCount >= PERFORMANCE_THRESHOLD ? 'Performance 30%' : 'Standard 25%';
}

export function initCommissionCalc() {
  const slider = document.getElementById('calc');
  const countEl = document.getElementById('calc-n');
  const amountEl = document.getElementById('calc-amt');
  const annualEl = document.getElementById('calc-annual');
  const tierRows = document.querySelectorAll('.tier-row');
  if (!slider || !countEl || !amountEl || !annualEl) return;

  function render() {
    const n = +slider.value;
    const monthly = Math.round(n * MONTHLY_PRICE_AUD * rateFor(n));
    countEl.textContent = n;
    amountEl.textContent = '$' + monthly.toLocaleString();
    annualEl.textContent = '= $' + (monthly * 12).toLocaleString() + ' / year at ' + tierLabel(n);
    if (tierRows.length >= 2) {
      tierRows[0].classList.toggle('active', n < PERFORMANCE_THRESHOLD);
      tierRows[1].classList.toggle('active', n >= PERFORMANCE_THRESHOLD);
    }
  }

  slider.addEventListener('input', render);
  render();
}
