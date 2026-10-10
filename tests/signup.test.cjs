const { test } = require('node:test');
const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const { join } = require('node:path');
const vm = require('node:vm');

// Execute the real handler with in-memory Firebase and email adapters. No credentials,
// real accounts, network requests, or sales emails are used by these tests.
async function runSignup(body) {
  const effects = { users: [], records: [], emails: [] };
  const context = vm.createContext({
    console,
    process: { env: {} },
    fetch: async (_url, request) => {
      effects.emails.push(JSON.parse(request.body));
      return { ok: true };
    },
  });
  const mocks = {
    'firebase-admin/app': {
      getApps: () => [{}], cert: x => x, initializeApp: () => {},
    },
    'firebase-admin/auth': {
      getAuth: () => ({ createUser: async user => { effects.users.push(user); return { uid: 'test-uid' }; } }),
    },
    'firebase-admin/firestore': {
      getFirestore: () => ({ collection: name => ({ doc: uid => ({ set: async record => {
        effects.records.push({ name, uid, record });
      } }) }) }),
    },
  };
  const source = new vm.SourceTextModule(readFileSync(join(__dirname, '../api/signup.js'), 'utf8'), { context });
  await source.link(name => {
    const values = mocks[name];
    assert.ok(values, `Unexpected import: ${name}`);
    return new vm.SyntheticModule(Object.keys(values), function () {
      for (const [key, value] of Object.entries(values)) this.setExport(key, value);
    }, { context });
  });
  await source.evaluate();
  const response = { status(code) { this.code = code; return this; }, json(value) { this.body = value; return this; } };
  await source.namespace.default({ method: 'POST', body }, response);
  return { effects, response };
}

const base = { name: 'Test Owner', store: 'Test Store', email: 'test@example.com', password: 'local-test-only', phone: '5555550100' };
for (const answer of ['Yes', 'I have one that needs updating', 'Not sure yet', 'No']) {
  test(`website interest "${answer}" reaches the saved request and sales email`, async () => {
    const { effects, response } = await runSignup({ ...base, websiteInterest: answer });
    assert.equal(response.code, 200);
    assert.equal(effects.users.length, 1);
    assert.equal(effects.records[0].name, 'signupRequests');
    assert.equal(effects.records[0].record.websiteInterest, answer);
    assert.match(effects.emails[0].html, /Do they need a website\?/);
    assert.ok(effects.emails[0].html.includes(answer));
    assert.equal(effects.records[0].record.password, undefined);
  });
}
test('skipping the questionnaire and older clients still work', async () => {
  const { effects, response } = await runSignup(base);
  assert.equal(response.code, 200);
  assert.equal(effects.records[0].record.websiteInterest, '');
  assert.match(effects.emails[0].html, /Do they need a website\?<\/strong> — \(skipped\)/);
});
for (const answer of ['<script>alert(1)</script>', {}, ['Yes'], true, 'x'.repeat(1000)]) {
  test(`invalid website interest is rejected before account creation: ${JSON.stringify(answer).slice(0,45)}`, async () => {
    const { effects, response } = await runSignup({ ...base, websiteInterest: answer });
    assert.equal(response.code, 400);
    assert.equal(effects.users.length, 0);
    assert.equal(effects.records.length, 0);
    assert.equal(effects.emails.length, 0);
  });
}
test('the website honeypot stays separate from the real website question', async () => {
  const { effects, response } = await runSignup({ ...base, website: 'bot value', websiteInterest: 'Yes' });
  assert.equal(response.code, 200);
  assert.equal(effects.users.length, 0);
  assert.equal(effects.emails.length, 0);
});
