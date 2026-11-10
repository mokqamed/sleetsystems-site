/* One opening per tab session, only while the first page's visible content is slow. */
(() => {
  'use strict';
  const key = 'sleet.website-opening.v1';
  const threshold = 600;
  const deadline = 8000;
  const navigation = performance.getEntriesByType('navigation')[0];
  if (navigation && navigation.type !== 'navigate') return;
  try {
    if (sessionStorage.getItem(key)) return;
    // A fast first visit counts too: later page changes must not introduce a splash.
    sessionStorage.setItem(key, '1');
  } catch (_) {
    // Without session storage we cannot promise that it will only play once.
    return;
  }
  if (document.readyState === 'complete' || performance.now() >= deadline) return;

  let finished = false;
  let overlay;
  let showTimer;
  let deadlineTimer;
  const cleanups = [];
  function listen(target, type, callback) {
    target.addEventListener(type, callback);
    cleanups.push(() => target.removeEventListener(type, callback));
  }
  function finish() {
    if (finished) return;
    finished = true;
    clearTimeout(showTimer);
    clearTimeout(deadlineTimer);
    cleanups.forEach(cleanup => cleanup());
    if (overlay) overlay.remove();
  }
  function show() {
    if (finished || document.hidden) return;
    overlay = document.createElement('div');
    overlay.id = 'sleet-opening';
    overlay.setAttribute('role', 'status');
    overlay.setAttribute('aria-label', 'Loading website');
    // Self-contained styles avoid another stylesheet request on a slow connection.
    overlay.style.cssText = 'position:fixed;inset:0;z-index:2147483647;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:16px;background:#f5f9fb;color:#587080;font:14px system-ui,sans-serif;pointer-events:none';
    const logo = document.createElement('img');
    logo.width = 128;
    logo.height = 128;
    logo.alt = '';
    logo.style.cssText = 'width:128px;height:128px;visibility:hidden';
    const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
    function setStill() { logo.src = '/assets/sleet-motion/sleet-opening-still.webp'; }
    logo.onload = () => { logo.style.visibility = 'visible'; };
    logo.onerror = () => { logo.onerror = null; setStill(); };
    logo.src = reducedMotion.matches
      ? '/assets/sleet-motion/sleet-opening-still.webp'
      : '/assets/sleet-motion/sleet-opening-intro.webp';
    // Turning motion back on never replays an intro that has already started.
    listen(reducedMotion, 'change', event => { if (event.matches) setStill(); });
    const label = document.createElement('span');
    label.textContent = 'Loading\u2026';
    label.setAttribute('aria-hidden', 'true');
    overlay.append(logo, label);
    document.documentElement.append(overlay);
  }
  function checkContent() {
    if (finished) return;
    const images = [...document.querySelectorAll('body img')].filter(img => {
      if (img.complete || img.loading === 'lazy') return false;
      const rect = img.getBoundingClientRect();
      return rect.width > 0 && rect.height > 0 && rect.top < innerHeight && rect.bottom > 0
        && rect.left < innerWidth && rect.right > 0;
    });
    const pending = images.map(img => new Promise(resolve => {
      listen(img, 'load', resolve);
      listen(img, 'error', resolve);
    }));
    if (document.fonts) pending.push(document.fonts.ready);
    // DOM + visible images + fonts; analytics, lazy images and embeds cannot hold it open.
    Promise.all(pending).then(finish, finish);
  }
  showTimer = setTimeout(show, Math.max(0, threshold - performance.now()));
  deadlineTimer = setTimeout(finish, Math.max(0, deadline - performance.now()));
  listen(window, 'pagehide', finish);
  listen(window, 'pointerdown', finish);
  listen(window, 'keydown', finish);
  listen(document, 'visibilitychange', () => { if (document.hidden) finish(); });
  if (document.readyState === 'loading') listen(document, 'DOMContentLoaded', checkContent);
  else checkContent();
})();
