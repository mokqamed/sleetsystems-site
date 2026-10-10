// Local demonstration only. Prices are sample cents; no checkout or POS API calls.
export const products = Object.freeze([
  { id: 'latte', name: 'House latte', category: 'drinks', price: 450, image: 'demo-latte.webp', tag: 'The everyday favorite', detail: 'A double shot of espresso, silky steamed milk and a little moment to yourself.', size: '12 oz · Served hot', ingredients: 'Espresso, whole milk. Contains milk.' },
  { id: 'iced-latte', name: 'Iced latte', category: 'drinks', price: 500, image: 'demo-iced-latte.webp', tag: 'Slow down. Cool off.', detail: 'Our house espresso poured over ice and cold milk. Smooth, bright and made for a sunny afternoon.', size: '16 oz · Served over ice', ingredients: 'Espresso, whole milk, ice. Contains milk.' },
  { id: 'croissant', name: 'Butter croissant', category: 'bakery', price: 350, image: 'demo-croissant.webp', tag: 'Baked for your morning', detail: 'Golden, flaky layers and a soft buttery center. A little messy, in the best way.', size: 'One freshly baked pastry', ingredients: 'Wheat flour, butter, milk, yeast, sugar, salt, egg wash. Contains wheat, milk and egg.' },
  { id: 'muffin', name: 'Chocolate muffin', category: 'bakery', price: 375, image: 'demo-muffin.webp', tag: 'For your chocolate mood', detail: 'A soft chocolate muffin with a generous scattering of chocolate chips. Save the best bite for last.', size: 'One bakery muffin', ingredients: 'Wheat flour, cocoa, chocolate, milk, egg, sugar, oil. Contains wheat, milk and egg.' },
]);
export const productById = id => products.find(product => product.id === id);
export const money = cents => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(cents / 100);
export function updateCart(cart, id, quantity) {
  if (!productById(id) || !Number.isInteger(quantity) || quantity < 0 || quantity > 20) return { ...cart };
  const next = { ...cart };
  if (quantity === 0) delete next[id]; else next[id] = quantity;
  return next;
}
export function cartSummary(cart, offer = false) {
  const lines = products.filter(p => Number.isInteger(cart[p.id]) && cart[p.id] > 0 && cart[p.id] <= 20)
    .map(p => ({ ...p, quantity: cart[p.id], total: p.price * cart[p.id] }));
  const subtotal = lines.reduce((sum, line) => sum + line.total, 0);
  // One sample breakfast offer per cart. Removing either item removes the discount.
  const discount = offer && lines.some(p => p.id === 'latte') && lines.some(p => p.id === 'croissant') ? 50 : 0;
  return { lines, count: lines.reduce((sum, line) => sum + line.quantity, 0), subtotal, discount, total: subtotal - discount };
}
