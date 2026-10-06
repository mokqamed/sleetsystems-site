(() => {
  const overview = document.getElementById('overview-view');
  const pricing = document.getElementById('pricing-view');
  const main = document.getElementById('main');
  const originalTitle = document.title;
  history.scrollRestoration = 'manual';
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const wantsPricing = url => {
    const target = url.hash ? document.getElementById(url.hash.slice(1)) : null;
    if (target?.closest('#pricing-view')) return true;
    if (target?.closest('#overview-view')) return false;
    return url.searchParams.get('view') === 'pricing';
  };
  const applyView = url => {
    const isPricing = wantsPricing(url);
    overview.hidden = isPricing;
    pricing.hidden = !isPricing;
    document.querySelectorAll('[data-main-tab]').forEach(link => {
      if (link.dataset.mainTab === (isPricing ? 'pricing' : 'overview')) link.setAttribute('aria-current', 'page');
      else link.removeAttribute('aria-current');
    });
    document.title = isPricing ? 'Pricing & Placement | SleetPOS' : originalTitle;
    document.querySelector('.menu-toggle')?.setAttribute('aria-expanded', 'false');
    document.getElementById('site-nav')?.classList.remove('is-open');
  };
  const scrollToRoute = (url, smooth, focusDestination = false) => {
    const target = url.hash ? document.getElementById(url.hash.slice(1)) : main;
      target?.scrollIntoView({ behavior: smooth && !reducedMotion.matches ? 'smooth' : 'auto', block: 'start' });
      if (!focusDestination || !target) return;
      const destination = url.hash === '#main' ? main :
        (target === main ? (pricing.hidden ? overview : pricing) : target).querySelector('h1,h2') || target;
      const previousTabindex = destination.getAttribute('tabindex');
      destination.setAttribute('tabindex', '-1');
      destination.focus({ preventScroll: true });
      destination.addEventListener('blur', () => {
        if (previousTabindex === null) destination.removeAttribute('tabindex');
        else destination.setAttribute('tabindex', previousTabindex);
      }, { once: true });
  };
  document.addEventListener('click', event => {
    const link = event.target.closest('a[href]');
    if (!link || event.defaultPrevented || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0 || link.target === '_blank') return;
    const url = new URL(link.href, location.href);
    if (url.origin !== location.origin || url.pathname !== '/') return;
    event.preventDefault();
    const changedView = wantsPricing(url) !== !pricing.hidden;
    history.pushState(null, '', url.pathname + url.search + url.hash);
    applyView(url);
    scrollToRoute(url, false, changedView || url.hash === '#main');
    if (url.hash === '#iphone' || url.hash === '#checkout') window.dispatchEvent(new Event('hashchange'));
  });
  const restoreRoute = () => {
    const url = new URL(location.href);
    applyView(url);
    scrollToRoute(url, false);
  };
  window.addEventListener('popstate', restoreRoute);
  window.addEventListener('hashchange', () => applyView(new URL(location.href)));
  applyView(new URL(location.href));
  if (location.hash) scrollToRoute(new URL(location.href), false);
  window.addEventListener('load', () => {
    if (location.hash) scrollToRoute(new URL(location.href), false);
  }, { once: true });

})();
