const { test } = require('node:test');
const assert = require('node:assert/strict');
const model = import('../assets/cafe-demo-model.mjs');

test('a sample basket totals product quantities in cents', async () => {
  const { cartSummary } = await model;
  const result = cartSummary({ latte: 2, croissant: 1 });
  assert.equal(result.count, 3);
  assert.equal(result.total, 1250);
});
test('the breakfast offer applies once and disappears when a qualifying item is removed', async () => {
  const { cartSummary, updateCart } = await model;
  const cart = { latte: 2, croissant: 2 };
  assert.equal(cartSummary(cart, true).discount, 50);
  assert.equal(cartSummary(updateCart(cart, 'croissant', 0), true).discount, 0);
  assert.equal(cartSummary(cart, false).discount, 0);
});
test('quantity changes preserve other items and do not mutate the existing cart', async () => {
  const { updateCart } = await model;
  const cart = { latte: 1, muffin: 2 };
  assert.deepEqual(updateCart(cart, 'latte', 3), { latte: 3, muffin: 2 });
  assert.deepEqual(updateCart(cart, 'muffin', 0), { latte: 1 });
  assert.deepEqual(cart, { latte: 1, muffin: 2 });
});
test('unknown products and invalid quantities cannot enter a basket', async () => {
  const { updateCart, cartSummary } = await model;
  for (const amount of [-1, 21, 1.5, NaN, '2']) assert.deepEqual(updateCart({}, 'latte', amount), {});
  assert.deepEqual(updateCart({}, 'unknown', 1), {});
  assert.equal(cartSummary({ unknown: 1, latte: -2, muffin: '2' }).total, 0);
});
