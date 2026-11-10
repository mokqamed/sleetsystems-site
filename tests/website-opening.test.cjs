const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const script = fs.readFileSync(path.join(__dirname, '../assets/sleet-opening.js'), 'utf8');
const flush = () => new Promise(resolve => setImmediate(resolve));

function events(extra = {}) {
  const callbacks = new Map();
  return Object.assign({
    addEventListener(type, fn) { if (!callbacks.has(type)) callbacks.set(type, new Set()); callbacks.get(type).add(fn); },
    removeEventListener(type, fn) { callbacks.get(type)?.delete(fn); },
    dispatch(type, event = {}) { [...(callbacks.get(type) || [])].forEach(fn => fn(event)); },
  }, extra);
}
function page(options = {}) {
  let now = options.now || 0, nextId = 0;
  const timers = new Map(), nodes = [], requests = [];
  const storage = options.storage || new Map();
  let resolveFonts;
  const fonts = new Promise(resolve => { resolveFonts = resolve; });
  const motion = events({ matches: !!options.reduced });
  const hero = events({ complete: false, loading: 'eager', getBoundingClientRect: () => ({ top: 0, bottom: 400, left: 0, right: 400, width: 400, height: 400 }) });
  const document = events({
    readyState: options.readyState || 'loading', hidden: false, fonts: { ready: fonts },
    querySelectorAll: () => options.images || [hero],
    documentElement: { append: node => nodes.push(node) },
    createElement(tag) {
      const node = { tag, style: {}, children: [], attrs: {}, setAttribute(k,v) { this.attrs[k] = v; }, append(...children) { this.children.push(...children); }, remove() { nodes.splice(nodes.indexOf(this), 1); } };
      Object.defineProperty(node, 'src', { get() { return this.url; }, set(url) { this.url = url; requests.push(url); } });
      return node;
    },
  });
  const window = events();
  vm.runInNewContext(script, { document, window, innerWidth: 1000, innerHeight: 800,
    performance: { now: () => now, getEntriesByType: () => [{ type: options.navigation || 'navigate' }] },
    sessionStorage: { getItem: key => { if (options.blockedStorage) throw Error('blocked'); return storage.get(key); }, setItem: (k,v) => storage.set(k,v) },
    matchMedia: () => motion,
    setTimeout: (fn, delay) => { timers.set(++nextId, { fn, at: now + delay }); return nextId; },
    clearTimeout: id => timers.delete(id),
  });
  return { nodes, requests, storage, document, window, motion, hero, resolveFonts,
    advance(ms) { now += ms; for (const [id, timer] of [...timers]) if (timer.at <= now && timers.has(id)) { timers.delete(id); timer.fn(); } },
    domReady() { document.readyState = 'interactive'; document.dispatch('DOMContentLoaded'); },
  };
}

test('a slow first visit shows only after 600 ms, then removes immediately when visible content is ready', async () => {
  const p = page(); p.domReady(); p.resolveFonts();
  p.advance(599); assert.equal(p.nodes.length, 0); assert.equal(p.requests.length, 0);
  p.advance(1); assert.equal(p.nodes.length, 1); assert.match(p.requests[0], /opening-intro.webp$/);
  p.hero.dispatch('load'); await flush(); assert.equal(p.nodes.length, 0);
  p.advance(10000); assert.equal(p.nodes.length, 0);
});
test('fast first visits fetch no opening artwork and do not defer it to the next page', async () => {
  const p = page({ images: [] }); p.domReady(); p.resolveFonts(); await flush();
  p.advance(600); assert.equal(p.nodes.length, 0); assert.equal(p.requests.length, 0);
  const next = page({ storage: p.storage }); next.advance(1000); assert.equal(next.nodes.length, 0);
});
test('repeat visits, reloads, history restores and unavailable storage never introduce a splash', () => {
  const first = page(); first.advance(600); assert.equal(first.nodes.length, 1);
  for (const options of [{ storage: first.storage }, { navigation: 'reload' }, { navigation: 'back_forward' }, { blockedStorage: true }, { readyState: 'complete' }]) {
    const p = page(options); p.advance(1000); assert.equal(p.nodes.length, 0);
  }
});
test('errors in a visible image and font loading also release the opening', async () => {
  const p = page(); p.domReady(); p.advance(600); p.hero.dispatch('error'); p.resolveFonts(); await flush();
  assert.equal(p.nodes.length, 0);
});
test('offscreen and lazy images do not make an otherwise ready page slow', async () => {
  const images = [events({ loading: 'lazy' }), events({ loading: 'eager', getBoundingClientRect: () => ({ top: 2000, bottom: 2400, width: 400, height: 400 }) })];
  const p = page({ images }); p.domReady(); p.resolveFonts(); await flush(); p.advance(600);
  assert.equal(p.nodes.length, 0);
});
test('reduced motion uses a static logo and switching the preference does not replay', () => {
  const p = page({ reduced: true }); p.advance(600); assert.match(p.requests[0], /opening-still.webp$/);
  const q = page(); q.advance(600); q.motion.dispatch('change', { matches: true }); q.motion.dispatch('change', { matches: false });
  assert.equal(q.requests.length, 2); assert.match(q.requests[1], /opening-still.webp$/);
});
test('a stalled resource cannot leave the opening up past eight seconds from navigation', () => {
  const p = page(); p.advance(600); assert.equal(p.nodes.length, 1); p.advance(7400); assert.equal(p.nodes.length, 0);
});
test('interaction, pagehide and moving to a background tab dismiss without replay', () => {
  for (const type of ['pointerdown', 'keydown', 'pagehide', 'visibilitychange']) {
    const p = page(); p.advance(600);
    if (type === 'visibilitychange') { p.document.hidden = true; p.document.dispatch(type); } else p.window.dispatch(type);
    assert.equal(p.nodes.length, 0); p.advance(9000); assert.equal(p.nodes.length, 0);
  }
});
test('a failed animation falls back to a still without an image retry loop', () => {
  const p = page(); p.advance(600); const image = p.nodes[0].children[0]; image.onerror();
  assert.match(image.src, /opening-still.webp$/); assert.equal(image.onerror, null);
});

test('the public entry pages all use the non-blocking opening script', () => {
  const root = path.join(__dirname, '..');
  const pages = ['index.html', ...['book','features','partnerships','signup','support','websites','store-signage'].map(p => `product/${p}/index.html`), 'product/index.html', ...['privacy','terms','sms-disclosure','sms-signup','sms-consent-form'].map(p => `${p}/index.html`)];
  for (const name of pages) {
    const html = fs.readFileSync(path.join(root, name), 'utf8');
    assert.equal((html.match(/<script async src="\/assets\/sleet-opening.js"><\/script>/g) || []).length, 1, name);
  }
});
test('the 2x opening is a two-second single play with 60 fps movement', () => {
  const data = fs.readFileSync(path.join(__dirname, '../assets/sleet-motion/sleet-opening-intro.webp'));
  let frames = 0, duration = 0, loop;
  for (let offset = 12; offset + 8 <= data.length;) {
    const tag = data.toString('ascii', offset, offset + 4), size = data.readUInt32LE(offset + 4), payload = offset + 8;
    if (tag === 'ANIM') loop = data.readUInt16LE(payload + 4);
    if (tag === 'ANMF') { frames++; duration += data.readUIntLE(payload + 12, 3); }
    offset += 8 + size + size % 2;
  }
  assert.equal(loop, 1); assert.equal(duration, 2000);
  assert.ok(frames > 80); // Static holds are coalesced; moving frames retain the 60 fps timeline.
  assert.ok(data.length < 900000, '2x opening must stay below 900 KB for slow connections');
});
