(() => {
  const toggle = document.querySelector('.menu-toggle');
  const nav = document.getElementById('site-nav');
  const services = nav?.querySelector('.services-menu');
  const servicesToggle = services?.querySelector('.services-toggle');
  const panel = services?.querySelector('.services-panel');
  const desktop = matchMedia('(min-width: 921px)');
  const hover = matchMedia('(hover: hover) and (pointer: fine)');
  let pinned = false;
  const setServices = open => {
    if (!panel) return;
    panel.hidden = !open;
    servicesToggle.setAttribute('aria-expanded', String(open));
    if (!open) pinned = false;
  };
  const close = () => {
    toggle?.setAttribute('aria-expanded', 'false');
    nav?.classList.remove('is-open');
    setServices(false);
  };
  toggle?.addEventListener('click', () => {
    const open = toggle.getAttribute('aria-expanded') !== 'true';
    if (!open) close();
    else { toggle.setAttribute('aria-expanded', 'true'); nav?.classList.add('is-open'); }
  });
  servicesToggle?.addEventListener('click', event => {
    // A pointer's first click keeps a hover-open panel open. Keyboard/touch toggle it.
    pinned = event.detail > 0 && desktop.matches && hover.matches ? !pinned : panel.hidden;
    setServices(pinned);
  });
  services?.addEventListener('pointerenter', event => {
    if (desktop.matches && hover.matches && event.pointerType === 'mouse') setServices(true);
  });
  services?.addEventListener('pointerleave', () => {
    if (!pinned && !services.contains(document.activeElement)) setServices(false);
  });
  services?.addEventListener('focusout', event => {
    if (!services.contains(event.relatedTarget)) setServices(false);
  });
  nav?.addEventListener('click', event => { if (event.target.closest('a')) close(); });
  document.addEventListener('click', event => {
    if (!event.target.closest('.site-header')) close();
    else if (!services?.contains(event.target)) setServices(false);
  });
  document.addEventListener('keydown', event => {
    if (event.key !== 'Escape') return;
    if (panel && !panel.hidden) { setServices(false); servicesToggle.focus(); }
    else if (toggle?.getAttribute('aria-expanded') === 'true') { close(); toggle.focus(); }
  });
  desktop.addEventListener('change', close);
  const current = location.pathname.replace(/\/$/, '');
  nav?.querySelectorAll('a[href]').forEach(link => {
    const url = new URL(link.href);
    if (url.origin === location.origin && url.pathname.replace(/\/$/, '') === current && !url.hash && !url.search) {
      link.setAttribute('aria-current', 'page');
      if (panel?.contains(link)) servicesToggle.setAttribute('data-current', '');
    } else link.removeAttribute('aria-current');
  });
})();
