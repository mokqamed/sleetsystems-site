import { services, validateQuote } from './signage-quote-model.mjs';

const form = document.getElementById('signage-quote-form');
const steps = [...form.querySelectorAll('[data-quote-step]')];
const progress = [...form.querySelectorAll('.quote-progress li')];
const error = document.getElementById('quote-error');
const next = form.querySelector('[data-quote-next]');
const back = form.querySelector('[data-quote-back]');
const success = document.querySelector('[data-quote-success]');
let step = 0;
let sending = false;
const value = name => form.elements.namedItem(name)?.value ?? '';
const selected = () => [...form.querySelectorAll('input[name="services"]:checked')].map(input => input.value);

function syncItems() {
  for (const item of form.querySelectorAll('[data-quote-item]')) {
    item.hidden = !selected().includes(item.dataset.quoteItem);
    item.disabled = item.hidden;
  }
}
function payload() {
  const data = { services: selected(), items: {} };
  for (const key of data.services) {
    data.items[key] = { format: value(`${key}-format`), dimensions: value(`${key}-dimensions`), quantity: value(`${key}-quantity`) };
  }
  for (const name of ['help', 'artwork', 'timeline', 'name', 'business', 'email', 'phone', 'location', 'budget', 'notes', 'reference', 'website']) data[name] = value(name);
  return data;
}
function review() {
  const data = payload();
  const list = form.querySelector('[data-quote-review]');
  list.replaceChildren();
  const rows = data.services.map(key => [services[key].name, [data.items[key].format, data.items[key].dimensions || 'Size to be discussed', data.items[key].quantity ? `Quantity: ${data.items[key].quantity}` : 'Quantity to be discussed'].join(' · ')]);
  rows.push(['Help needed', data.help], ['Artwork', data.artwork], ['Timing', data.timeline]);
  if (data.notes) rows.push(['Notes', data.notes]);
  if (data.reference) rows.push(['Reference', data.reference]);
  for (const [label, text] of rows) {
    const row = document.createElement('div');
    const dt = document.createElement('dt');
    const dd = document.createElement('dd');
    dt.textContent = label;
    dd.textContent = text;
    row.append(dt, dd);
    list.append(row);
  }
}
function showStep(index, focus = true) {
  step = index;
  steps.forEach((panel, i) => { panel.hidden = i !== index; });
  progress.forEach((item, i) => { if (i === index) item.setAttribute('aria-current', 'step'); else item.removeAttribute('aria-current'); });
  error.hidden = true;
  back.hidden = step === 0;
  next.textContent = step === 2 ? 'Send quote request' : 'Continue';
  if (step === 2) review();
  if (focus) {
    form.closest('.quote-form-panel').scrollIntoView({ block: 'start' });
    steps[step].querySelector('legend').focus({ preventScroll: true });
  }
}
function showError(message, field) {
  const target = field === 'services' ? form.querySelector('input[name="services"]') : document.getElementById(`q-${field}`);
  const parentStep = target?.closest('[data-quote-step]');
  if (parentStep) showStep(Number(parentStep.dataset.quoteStep), false);
  error.textContent = message;
  error.hidden = false;
  if (target) target.focus();
}
function validateStep() {
  if (step === 0 && !selected().length) {
    showError('Choose at least one type of signage.', 'services');
    return false;
  }
  for (const input of steps[step].querySelectorAll('input, select, textarea')) {
    if (input.matches(':disabled')) continue;
    if (!input.checkValidity()) { input.reportValidity(); return false; }
  }
  return true;
}
for (const link of document.querySelectorAll('[data-quote-service]')) {
  link.addEventListener('click', () => {
    if (sending || form.hidden) return;
    const input = form.querySelector(`input[name="services"][value="${link.dataset.quoteService}"]`);
    if (input) input.checked = true;
    syncItems();
    showStep(0, false);
    steps[0].querySelector('legend').focus({ preventScroll: true });
  });
}
form.addEventListener('change', event => {
  if (event.target.name === 'services') syncItems();
  error.hidden = true;
});
back.addEventListener('click', () => { if (!sending) showStep(step - 1); });
form.querySelector('[data-quote-edit]').addEventListener('click', () => { if (!sending) showStep(0); });
form.addEventListener('submit', async event => {
  event.preventDefault();
  if (sending || !validateStep()) return;
  if (step < 2) { syncItems(); showStep(step + 1); return; }
  const data = payload();
  const checked = validateQuote(data);
  if (!checked.ok) { showError(checked.error, checked.field); return; }
  sending = true;
  form.setAttribute('aria-busy', 'true');
  // Preserve answers while awaiting a response, and prevent accidental duplicate requests.
  const controls = [...form.querySelectorAll('input:not(:disabled), select:not(:disabled), textarea:not(:disabled), button:not(:disabled)')];
  controls.forEach(control => { control.disabled = true; });
  next.textContent = 'Sending…';
  error.hidden = true;
  try {
    const response = await fetch(form.action, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data), signal: AbortSignal.timeout(20000),
    });
    const result = await response.json();
    if (!response.ok || result.ok !== true) {
      throw new Error(result.error || 'Your request could not be sent. Please try again or email sales@sleetsystems.com.');
    }
    form.hidden = true;
    success.hidden = false;
    success.focus();
  } catch (e) {
    const message = e instanceof TypeError || e.name === 'TimeoutError' || e.name === 'SyntaxError'
      ? 'We couldn’t confirm your request was sent. Your answers are still here. Try again or email sales@sleetsystems.com.'
      : e.message;
    showError(message);
  } finally {
    sending = false;
    form.removeAttribute('aria-busy');
    controls.forEach(control => { control.disabled = false; });
    next.textContent = 'Send quote request';
  }
});
syncItems();
showStep(0, false);
form.hidden = false;
