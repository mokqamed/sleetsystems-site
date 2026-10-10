const { test } = require('node:test');
const assert = require('node:assert/strict');
const { spawnSync } = require('node:child_process');
const { join } = require('node:path');

test('the quote function loads with explicit module rules and validates before delivery', () => {
  // The VM unit tests bypass Node's module loader. Disable syntax detection and
  // CommonJS require(ESM) so a missing module declaration cannot hide locally.
  const result = spawnSync(process.execPath, [
    '--no-experimental-detect-module', '--no-experimental-require-module',
    '--input-type=module', '-e', `
      import assert from 'node:assert/strict';
      import handler from './api/signage-quote.js';
      globalThis.fetch = () => { throw new Error('Unexpected delivery attempt'); };
      for (const [method, body, expected] of [['GET', undefined, 405], ['POST', { services: [] }, 400]]) {
        const res = {
          setHeader() {},
          status(code) { this.code = code; return this; },
          json(body) { this.body = body; return this; },
        };
        await handler({ method, body, headers: {} }, res);
        assert.equal(res.code, expected);
        assert.equal(res.body.ok, false);
      }
    `,
  ], { cwd: join(__dirname, '..'), encoding: 'utf8' });
  assert.equal(result.status, 0, result.stderr || result.error?.message);
});
