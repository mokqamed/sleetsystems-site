import { products, productById, money, updateCart, cartSummary } from './cafe-demo-model.mjs';

const demo = document.getElementById('cafe-demo');
if (demo) {
  const one = selector => document.querySelector(selector);
  const content = demo.querySelector('.cafe-content');
  const intro = demo.querySelector('.cafe-intro');
  const itemDialog = one('#cafe-product-dialog');
  const offerDialog = one('#cafe-offer-dialog');
  const cartDialog = one('#cafe-cart-dialog');
  const confirmDialog = one('#cafe-confirm-dialog');
  const dialogs = [itemDialog, offerDialog, cartDialog, confirmDialog];
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  let cart = {};
  let offer = false;
  let selectedProduct = products[0];
  let quantity = 1;
  let introTimer;
  let toastTimer;
  let afterIntro;
  let opener;

  function notify(message) {
    const toast = demo.querySelector('.cafe-toast');
    clearTimeout(toastTimer);
    toast.textContent = message;
    toast.hidden = false;
    toastTimer = setTimeout(() => { toast.hidden = true; }, 3000);
  }
  function renderProducts(category = 'all') {
    const shown = products.filter(p => category === 'all' || p.category === category);
    one('[data-products]').innerHTML = shown.map(p => `<article class="cafe-card"><div class="cafe-card-picture"><button type="button" data-product="${p.id}" aria-label="View ${p.name}"><img src="/assets/${p.image}" width="1024" height="1024" alt="${p.name}" /><span class="cafe-card-open">View item +</span></button></div><div class="cafe-card-title"><h3>${p.name}</h3><span>${money(p.price)}</span></div><p>${p.tag}</p></article>`).join('');
    demo.querySelectorAll('[data-category]').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.category === category)));
    one('[data-menu-count]').textContent = `${shown.length} favorites`;
  }
  function renderCart() {
    const summary = cartSummary(cart, offer);
    one('[data-cart-count]').textContent = summary.count;
    one('[data-cart-items]').innerHTML = summary.lines.length ? summary.lines.map(p => `<article class="cafe-cart-row"><img src="/assets/${p.image}" width="1024" height="1024" alt="" /><div><strong>${p.name}</strong><div><button type="button" data-cart-change="${p.id}" data-delta="-1" aria-label="Remove one ${p.name}">−</button><span aria-label="Quantity ${p.quantity}">${p.quantity}</span><button type="button" data-cart-change="${p.id}" data-delta="1" aria-label="Add one ${p.name}" ${p.quantity === 20 ? 'disabled' : ''}>+</button></div></div><span>${money(p.total)}</span></article>`).join('') : '<div class="cafe-cart-empty">Your next favorite is waiting.<p>Explore the menu and add something good.</p></div>';
    one('[data-cart-totals]').innerHTML = summary.lines.length ? `<div><span>Subtotal</span><span>${money(summary.subtotal)}</span></div>${summary.discount ? `<div><span>Morning pair offer</span><span>−${money(summary.discount)}</span></div>` : ''}<div><span>Sample total</span><span>${money(summary.total)}</span></div>` : '';
    one('[data-preview-pickup]').disabled = !summary.lines.length;
  }
  function showDialog(dialog) {
    if (!dialog.open) dialog.showModal();
  }
  function updateQuantity() {
    one('[data-quantity-output]').textContent = quantity;
    one('[data-add-total]').textContent = money(selectedProduct.price * quantity);
    itemDialog.querySelector('[data-quantity="-1"]').disabled = quantity === 1;
    itemDialog.querySelector('[data-quantity="1"]').disabled = quantity === 20;
  }
  function openProduct(id) {
    const product = productById(id);
    if (!product) return;
    selectedProduct = product;
    quantity = 1;
    const img = one('[data-detail-image]');
    img.src = `/assets/${product.image}`;
    img.alt = product.name;
    one('#cafe-product-name').textContent = product.name;
    one('[data-detail-tag]').textContent = product.tag;
    one('[data-detail-price]').textContent = money(product.price);
    one('[data-detail-description]').textContent = product.detail;
    one('[data-detail-size]').textContent = product.size;
    one('[data-detail-ingredients]').textContent = product.ingredients;
    itemDialog.querySelector('details').open = false;
    updateQuantity();
    showDialog(itemDialog);
    itemDialog.scrollTop = 0;
  }
  function addProduct(id, count) {
    const previous = cart[id] || 0;
    cart = updateCart(cart, id, Math.min(20, previous + count));
    renderCart();
    return cart[id] - previous;
  }
  function goTo(selector) {
    const section = demo.querySelector(selector);
    section.scrollIntoView({ behavior: reducedMotion.matches ? 'auto' : 'smooth', block: 'start' });
    section.querySelector('h2').focus({ preventScroll: true });
  }
  function showScene(scene) {
    if (scene === 'menu') goTo('#cafe-menu');
    if (scene === 'product') { goTo('#cafe-menu'); openProduct('latte'); }
    if (scene === 'offer') showDialog(offerDialog);
  }
  function finishEntrance() {
    clearTimeout(introTimer);
    content.inert = false;
    intro.hidden = true;
    intro.setAttribute('aria-hidden', 'true');
    intro.classList.remove('is-playing');
    content.classList.remove('is-entering');
    if (demo.open) one('#cafe-welcome').focus({ preventScroll: true });
    const callback = afterIntro;
    afterIntro = undefined;
    if (demo.open && callback) callback();
  }
  function playEntrance(callback) {
    clearTimeout(introTimer);
    afterIntro = callback;
    demo.scrollTop = 0;
    if (reducedMotion.matches) { finishEntrance(); return; }
    intro.hidden = false;
    intro.setAttribute('aria-hidden', 'false');
    content.inert = true;
    intro.classList.remove('is-playing');
    content.classList.remove('is-entering');
    // Restart the finite entrance sequence when a visitor presses Replay.
    void intro.offsetWidth;
    intro.classList.add('is-playing');
    content.classList.add('is-entering');
    intro.querySelector('button').focus({ preventScroll: true });
    introTimer = setTimeout(finishEntrance, 2850);
  }
  function launch(scene = 'home', trigger) {
    opener = trigger || one('[data-demo-scene="home"]');
    renderProducts();
    renderCart();
    document.body.classList.add('cafe-demo-open');
    showDialog(demo);
    const url = new URL(location.href);
    url.searchParams.set('demo', 'cafe');
    url.searchParams.set('scene', scene);
    history.replaceState(null, '', url);
    if (scene === 'home') playEntrance();
    else { finishEntrance(); showScene(scene); }
  }
  function closeDemo() {
    dialogs.forEach(dialog => { if (dialog.open) dialog.close(); });
    demo.close();
  }
  demo.addEventListener('close', () => {
    clearTimeout(introTimer);
    clearTimeout(toastTimer);
    afterIntro = undefined;
    content.inert = false;
    intro.hidden = true;
    demo.querySelector('.cafe-toast').hidden = true;
    document.body.classList.remove('cafe-demo-open');
    const url = new URL(location.href);
    if (url.searchParams.get('demo') === 'cafe') {
      url.searchParams.delete('demo');
      url.searchParams.delete('scene');
      history.replaceState(null, '', url);
    }
    opener?.focus({ preventScroll: true });
  });
  dialogs.forEach(dialog => {
    dialog.addEventListener('click', event => {
      if (event.target !== dialog) return;
      const rect = dialog.getBoundingClientRect();
      if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) dialog.close();
    });
  });
  // Keep Tab within the active modal, including browsers that tab to their chrome
  // instead of wrapping a native dialog. Inert entrance content is excluded.
  [demo, ...dialogs].forEach(dialog => {
    dialog.addEventListener('keydown', event => {
      if (event.key === 'Escape') {
        // A shared-link entry can open two native dialogs in the same activation
        // group. Close only the active view, not the entire grouped demo.
        event.preventDefault();
        event.stopPropagation();
        if (!event.repeat) dialog === demo ? closeDemo() : dialog.close();
        return;
      }
      if (event.key !== 'Tab') return;
      const focusable = [...dialog.querySelectorAll('button:not(:disabled), a[href], input:not(:disabled), select:not(:disabled), textarea:not(:disabled), summary, [tabindex="0"]')]
        .filter(element => element.getClientRects().length && !element.closest('[inert]'));
      const first = focusable[0];
      const last = focusable.at(-1);
      if (!first) return;
      if (event.shiftKey && (document.activeElement === first || !dialog.contains(document.activeElement))) {
        event.preventDefault(); last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault(); first.focus();
      }
    });
  });
  document.addEventListener('click', event => {
    const button = event.target.closest('button');
    if (!button) return;
    if (button.hasAttribute('data-demo-scene')) launch(button.dataset.demoScene, button);
    if (button.hasAttribute('data-close-demo')) closeDemo();
    if (button.hasAttribute('data-close-modal')) button.closest('dialog').close();
    if (button.hasAttribute('data-replay')) playEntrance();
    if (button.hasAttribute('data-skip-intro')) finishEntrance();
    if (button.hasAttribute('data-home')) { demo.scrollTo({ top: 0, behavior: reducedMotion.matches ? 'auto' : 'smooth' }); one('#cafe-welcome').focus({ preventScroll: true }); }
    if (button.hasAttribute('data-menu')) goTo('#cafe-menu');
    if (button.hasAttribute('data-story')) goTo('#cafe-story');
    if (button.hasAttribute('data-category')) renderProducts(button.dataset.category);
    if (button.hasAttribute('data-product')) openProduct(button.dataset.product);
    if (button.hasAttribute('data-open-offer')) showDialog(offerDialog);
    if (button.hasAttribute('data-open-cart')) { renderCart(); showDialog(cartDialog); }
    if (button.hasAttribute('data-quantity')) { quantity = Math.max(1, Math.min(20, quantity + Number(button.dataset.quantity))); updateQuantity(); }
    if (button.hasAttribute('data-add-product')) {
      const added = addProduct(selectedProduct.id, quantity);
      itemDialog.close();
      notify(added ? `${added} ${selectedProduct.name.toLowerCase()} added to your sample bag.` : 'This sample bag allows 20 of each item.');
    }
    if (button.hasAttribute('data-apply-offer')) {
      addProduct('latte', 1);
      addProduct('croissant', 1);
      offer = true;
      renderCart();
      offerDialog.close();
      showDialog(cartDialog);
    }
    if (button.hasAttribute('data-cart-change')) {
      const id = button.dataset.cartChange;
      const delta = Number(button.dataset.delta);
      cart = updateCart(cart, id, Math.max(0, Math.min(20, (cart[id] || 0) + delta)));
      renderCart();
      // Keep keyboard focus in a sensible position after replacing a cart row.
      const replacement = cartDialog.querySelector(`[data-cart-change="${id}"][data-delta="${delta}"]:not(:disabled)`);
      (replacement || cartDialog.querySelector('[data-close-modal]')).focus({ preventScroll: true });
    }
    if (button.hasAttribute('data-preview-pickup')) {
      const summary = cartSummary(cart, offer);
      if (!summary.count) return;
      one('[data-confirm-summary]').textContent = `${summary.count} ${summary.count === 1 ? 'item' : 'items'} · ${money(summary.total)} sample total`;
      cartDialog.close();
      showDialog(confirmDialog);
    }
  });
  reducedMotion.addEventListener('change', () => { if (reducedMotion.matches && !intro.hidden) finishEntrance(); });
  renderProducts();
  renderCart();
  const query = new URLSearchParams(location.search);
  if (query.get('demo') === 'cafe') {
    const scene = ['home', 'menu', 'product', 'offer'].includes(query.get('scene')) ? query.get('scene') : 'home';
    launch(scene);
  }
}
