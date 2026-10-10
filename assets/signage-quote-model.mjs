export const services = {
  'menu-boards': { name: 'Menu boards', formats: ['Printed boards', 'Digital screens', 'Both', 'Not sure yet'] },
  'light-boxes': { name: 'Light boxes', formats: ['Indoor', 'Outdoor', 'Both', 'Not sure yet'] },
  'shelf-strips': { name: 'Shelving strips', formats: ['Shelf-edge inserts', 'Adhesive strips', 'Not sure yet'] },
};
export const projectOptions = {
  help: ['Design only', 'Design and production', 'Design, production and installation', 'Help me decide'],
  artwork: ['Logo and artwork ready', 'Logo ready; need artwork', 'Need a logo and design', 'Not sure yet'],
  timeline: ['As soon as possible', 'Within a month', 'In 1–3 months', 'Just exploring'],
};
const text = (value, max, required = false) => typeof value === 'string' && value.trim().length <= max && (!required || value.trim().length > 0);
const fail = (field, error) => ({ ok: false, field, error });

// Shared by the browser and server. The server always validates independently.
export function validateQuote(body) {
  if (!body || typeof body !== 'object' || Array.isArray(body)) return fail('', 'Please complete the quote form.');
  if (!Array.isArray(body.services) || body.services.length < 1 || body.services.length > 3 ||
      new Set(body.services).size !== body.services.length || body.services.some(key => typeof key !== 'string' || !Object.hasOwn(services, key))) {
    return fail('services', 'Choose at least one type of signage.');
  }
  const items = {};
  for (const key of body.services) {
    const item = body.items?.[key];
    if (!item || typeof item !== 'object' || Array.isArray(item)) return fail(`${key}-format`, `Tell us about your ${services[key].name.toLowerCase()}.`);
    if (!services[key].formats.includes(item.format)) return fail(`${key}-format`, 'Choose an option, including “Not sure yet” if you need help.');
    if (!text(item.dimensions ?? '', 200)) return fail(`${key}-dimensions`, 'Keep measurements under 200 characters.');
    const quantity = item.quantity ?? '';
    if (typeof quantity !== 'string' || (quantity !== '' && (!/^\d{1,4}$/.test(quantity) || Number(quantity) < 1 || Number(quantity) > 1000))) {
      return fail(`${key}-quantity`, 'Enter a quantity from 1 to 1,000, or leave it blank.');
    }
    items[key] = { format: item.format, dimensions: (item.dimensions ?? '').trim(), quantity };
  }
  for (const [field, options] of Object.entries(projectOptions)) {
    if (!options.includes(body[field])) return fail(field, 'Choose an option, including the help or exploring option if you’re unsure.');
  }
  for (const [field, max, required, label] of [
    ['name', 120, true, 'your name'], ['business', 160, true, 'your business name'],
    ['email', 200, true, 'your email'], ['phone', 50, false, 'your phone number'],
    ['location', 160, true, 'your city and state'], ['budget', 100, false, 'your budget'],
    ['notes', 3000, false, 'your project notes'], ['reference', 1000, false, 'your reference link'],
  ]) {
    if (!text(body[field] ?? '', max, required)) return fail(field, `Check ${label}${required ? ' — this is required' : ''} (up to ${max} characters).`);
  }
  if (!/^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/.test(body.email.trim())) return fail('email', 'Enter a valid email address.');
  const reference = (body.reference ?? '').trim();
  if (reference) {
    try {
      const url = new URL(reference);
      if (!['https:', 'http:'].includes(url.protocol) || url.username || url.password) throw new Error();
    } catch { return fail('reference', 'Use a full website or photo link starting with https://.'); }
  }
  const value = { services: [...body.services], items };
  for (const field of [...Object.keys(projectOptions), 'name', 'business', 'email', 'phone', 'location', 'budget', 'notes', 'reference']) value[field] = (body[field] ?? '').trim();
  value.email = value.email.toLowerCase();
  return { ok: true, value };
}
