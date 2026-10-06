(() => {
  const toggle = document.querySelector('.menu-toggle');
  const nav = document.getElementById('site-nav');
  const close = () => { toggle?.setAttribute('aria-expanded', 'false'); nav?.classList.remove('is-open'); };
  toggle?.addEventListener('click', () => {
    const open = toggle.getAttribute('aria-expanded') !== 'true';
    toggle.setAttribute('aria-expanded', String(open));
    nav?.classList.toggle('is-open', open);
  });
  nav?.addEventListener('click', event => { if (event.target.closest('a')) close(); });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && toggle?.getAttribute('aria-expanded') === 'true') { close(); toggle.focus(); }
  });
  matchMedia('(min-width: 921px)').addEventListener('change', event => { if (event.matches) close(); });
  const current = location.pathname.replace(/\/$/, '');
  nav?.querySelectorAll('a[href]').forEach(link => {
    const url = new URL(link.href);
    if (url.origin === location.origin && url.pathname.replace(/\/$/, '') === current && !url.hash && !url.search) link.setAttribute('aria-current', 'page');
    else link.removeAttribute('aria-current');
  });
})();
