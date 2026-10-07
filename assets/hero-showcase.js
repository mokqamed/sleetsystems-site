(() => {
  const hero = document.getElementById('showcase');
  const toggle = hero.querySelector('.hero-motion-toggle');
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  let paused = reducedMotion.matches;
  const update = () => {
    hero.classList.toggle('is-paused', paused);
    toggle.textContent = paused ? 'Play motion' : 'Pause motion';
    toggle.setAttribute('aria-label', paused ? 'Play product animation' : 'Pause product animation');
    toggle.hidden = reducedMotion.matches;
  };
  toggle.addEventListener('click', () => { paused = !paused; update(); });
  reducedMotion.addEventListener('change', () => { paused = reducedMotion.matches; update(); });
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(entries => {
      hero.classList.toggle('is-out-of-view', !entries[0].isIntersecting);
    }, { threshold: 0 }).observe(hero);
  }
  update();
})();
