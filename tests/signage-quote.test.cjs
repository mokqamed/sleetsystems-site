const { test } = require('node:test');
const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const { join } = require('node:path');
const vm = require('node:vm');

const base = () => ({
  services: ['menu-boards'], items: { 'menu-boards': { format: 'Not sure yet', dimensions: '', quantity: '' } },
  help: 'Help me decide', artwork: 'Not sure yet', timeline: 'Just exploring',
  name: 'Test Owner', business: 'Test Café', email: 'owner@example.com', location: 'Brooklyn, NY',
});
async function send(body, options = {}) {
  const emails = [];
  const context = vm.createContext({ URL, AbortSignal, process: { env: options.noKey ? {} : { RESEND_API_KEY: 'fake-test-key' } }, fetch: async (url, init) => {
    assert.equal(url, 'https://api.resend.com/emails');
    emails.push(JSON.parse(init.body));
    if (options.networkFailure) throw new Error('offline');
    return { ok: !options.providerFailure, status: options.providerFailure ? 429 : 200 };
  } });
  const handler = new vm.SourceTextModule(readFileSync(join(__dirname, '../api/signage-quote.js'), 'utf8'), { context });
  await handler.link(async name => {
    assert.equal(name, '../assets/signage-quote-model.mjs');
    const model = new vm.SourceTextModule(readFileSync(join(__dirname, '../assets/signage-quote-model.mjs'), 'utf8'), { context });
    await model.link(() => { throw new Error('Unexpected import'); });
    return model;
  });
  await handler.evaluate();
  const response = { headers: {}, setHeader(key, value) { this.headers[key] = value; }, status(code) { this.code = code; return this; }, json(body) { this.body = body; return this; } };
  await handler.namespace.default({ method: options.method || 'POST', headers: { origin: options.origin || 'https://www.sleetpos.com' }, body }, response);
  return { response, emails };
}
test('a combined signage request delivers all selected details to sales with customer reply-to', async () => {
  const body = { ...base(), services: ['menu-boards', 'light-boxes', 'shelf-strips'],
    items: { 'menu-boards': { format: 'Digital screens', quantity: '2', dimensions: '48 × 24 inches' }, 'light-boxes': { format: 'Outdoor', quantity: '1', dimensions: '6 feet wide' }, 'shelf-strips': { format: 'Shelf-edge inserts', quantity: '12', dimensions: '4 feet long' } },
    notes: 'Green and cream\nInclude coffee offers.', reference: 'https://example.com/menu', phone: '555-0100', budget: '$500–1,000',
  };
  const { response, emails } = await send(body);
  assert.equal(response.code, 200);
  assert.deepEqual(emails[0].to, ['sales@sleetsystems.com']);
  assert.equal(emails[0].reply_to, body.email);
  for (const expected of ['Menu boards', 'Digital screens', '48 × 24 inches', 'Light boxes', 'Outdoor', '6 feet wide', 'Shelving strips', '4 feet long', 'Include coffee offers.', 'https://example.com/menu', '555-0100', '$500–1,000', 'Just exploring']) assert.ok(emails[0].html.includes(expected), expected);
});
test('unknown measurements and optional contact details do not block a real inquiry', async () => {
  const { response, emails } = await send(base());
  assert.equal(response.code, 200); assert.equal(emails.length, 1);
});
test('answers are trimmed, email normalized, HTML escaped and unselected items excluded', async () => {
  const body = { ...base(), email: ' OWNER@example.com ', name: '<img src=x onerror=alert(1)>', notes: '<script>bad</script>', items: { ...base().items, 'light-boxes': { format: 'IGNORE UNSELECTED' } } };
  const { response, emails } = await send(body);
  assert.equal(response.code, 200); assert.equal(emails[0].reply_to, 'owner@example.com');
  assert.ok(emails[0].html.includes('&lt;script&gt;bad&lt;/script&gt;'));
  assert.ok(!emails[0].html.includes('<img')); assert.ok(!emails[0].html.includes('IGNORE UNSELECTED'));
});
for (const [name, change] of [
  ['no service', b => { b.services = []; }], ['unknown service', b => { b.services = ['__proto__']; }],
  ['duplicate service', b => { b.services = ['menu-boards', 'menu-boards']; }],
  ['missing details', b => { b.items = {}; }], ['incorrect format', b => { b.items['menu-boards'].format = 'Outdoor'; }],
  ['invalid quantity', b => { b.items['menu-boards'].quantity = '-1'; }], ['excessive quantity', b => { b.items['menu-boards'].quantity = '1001'; }],
  ['empty name', b => { b.name = '  '; }], ['invalid email', b => { b.email = 'not-an-email'; }],
  ['email line break', b => { b.email = 'owner@example.com\nbcc:x@example.com'; }],
  ['object contact field', b => { b.phone = {}; }], ['long notes', b => { b.notes = 'x'.repeat(3001); }],
  ['script link', b => { b.reference = 'javascript:alert(1)'; }], ['embedded credentials', b => { b.reference = 'https://user:password@example.com'; }],
  ['invalid timing', b => { b.timeline = 'Surprise'; }],
]) test(`${name} is rejected before sending an email`, async () => {
  const body = base(); change(body); const { response, emails } = await send(body);
  assert.equal(response.code, 400); assert.equal(emails.length, 0); assert.equal(response.body.ok, false);
});
test('bots, unsupported methods, malformed bodies and cross-site submissions never send', async () => {
  for (const [body, options, code] of [[{ ...base(), website: 'spam' }, {}, 200], [base(), { method: 'GET' }, 405], ['bad body', {}, 400], [[], {}, 400], [base(), { origin: 'https://unrelated.example' }, 403], [{ ...base(), notes: 'x'.repeat(25000) }, {}, 413]]) {
    const { response, emails } = await send(body, options);
    assert.equal(response.code, code); assert.equal(emails.length, 0);
  }
});
test('provider, network and configuration failures never report successful delivery', async () => {
  for (const options of [{ providerFailure: true }, { networkFailure: true }, { noKey: true }]) {
    const { response } = await send(base(), options);
    assert.ok(response.code >= 500); assert.equal(response.body.ok, false);
  }
});
