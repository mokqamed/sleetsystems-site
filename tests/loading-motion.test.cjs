const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

function partnerForm() {
  const html = fs.readFileSync(path.join(__dirname, '../product/partnerships/index.html'), 'utf8');
  const script = [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].map(m => m[1]).find(s => s.includes('partnerForm'));
  let submit, resolve;
  const attrs = new Map();
  const button = { disabled: false, textContent: 'Send', setAttribute: (k,v) => attrs.set(k,v), removeAttribute: k => attrs.delete(k) };
  const status = {};
  const form = { addEventListener: (_, fn) => { submit = fn; }, reset() { this.wasReset = true; } };
  for (const [key,value] of Object.entries({name:'Owner',company:'Shop',email:'owner@example.com',phone:'',message:'Please contact me',website:''})) form[key] = {value};
  const document = { getElementById: id => ({partnerForm:form,partnerSubmit:button,partnerStatus:status})[id] };
  vm.runInNewContext(script, {document, fetch: () => new Promise(r => { resolve=r; })});
  return {button,attrs,status,form,submit: () => submit({preventDefault(){}}), resolve: response => resolve(response)};
}
const flush = () => new Promise(resolve => setImmediate(resolve));

test('the loader tracks an actual pending request and stops on success', async () => {
  const p = partnerForm(); p.submit();
  assert.equal(p.attrs.get('aria-busy'),'true');
  assert.equal(p.button.disabled,true);
  assert.equal(p.button.textContent,'Sending…');
  p.resolve({ok:true,json:async()=>({})}); await flush();
  assert.equal(p.attrs.has('aria-busy'),false);
  assert.equal(p.button.textContent,'Sent');
  assert.equal(p.form.wasReset,true);
});
test('a failed request removes motion and leaves the existing retry usable', async () => {
  const p = partnerForm(); p.submit();
  p.resolve({ok:false,status:500}); await flush();
  assert.equal(p.attrs.has('aria-busy'),false);
  assert.equal(p.button.disabled,false);
  assert.equal(p.button.textContent,'Send');
  assert.match(p.status.textContent,/Something went wrong/);
});
test('invalid input never starts a loading state', () => {
  const p = partnerForm(); p.form.name.value=''; p.submit();
  assert.equal(p.attrs.has('aria-busy'),false);
  assert.equal(p.button.disabled,false);
  assert.match(p.status.textContent,/Please fill in/);
});
