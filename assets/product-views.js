(() => {
  const section = document.getElementById('showcase');
  const overview = document.getElementById('overview-view');
  const sticky = section.querySelector('.showcase-sticky');
  const frames = [...section.querySelectorAll('[data-product-frame]')];
  const messages = [...section.querySelectorAll('[data-scene]')];
  const buttons = [...section.querySelectorAll('[data-view-select]')];
  const play = section.querySelector('.motion-control');
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  let current = -1;
  let selectedManually = false;
  let playing = false;
  let playbackFrame = 0;
  let updatePending = false;
  let playbackStart = 0;
  const show = index => {
    if (index === current) return;
    current = index;
    frames.forEach((frame, i) => {
      frame.classList.toggle('is-active', i === index);
      frame.setAttribute('aria-hidden', String(i !== index));
      messages[i].classList.toggle('is-active', i === index);
      messages[i].setAttribute('aria-hidden', String(i !== index));
      buttons[i].setAttribute('aria-pressed', String(i === index));
    });
  };
  const stop = () => {
    playing = false;
    cancelAnimationFrame(playbackFrame);
    play.textContent = 'Play views';
    play.setAttribute('aria-pressed', 'false');
  };
  const render = () => {
    updatePending = false;
    if (overview.hidden || playing || selectedManually || reducedMotion.matches) return;
    const top = parseFloat(getComputedStyle(sticky).top) || 0;
    const travel = Math.max(1, section.offsetHeight - sticky.offsetHeight);
    const progress = Math.max(0, Math.min(1, (top - section.getBoundingClientRect().top) / travel));
    show(Math.min(frames.length - 1, Math.floor(progress * frames.length)));
  };
  const update = () => {
    if (!updatePending) { updatePending = true; requestAnimationFrame(render); }
  };
  buttons.forEach((button, i) => button.addEventListener('click', () => {
    stop();
    selectedManually = true;
    show(i);
  }));
  const tick = now => {
    if (!playing) return;
    if (overview.hidden) { stop(); return; }
    const index = Math.floor((now - playbackStart) / 2800);
    if (index >= frames.length) { stop(); return; }
    show(index);
    playbackFrame = requestAnimationFrame(tick);
  };
  play.addEventListener('click', () => {
    if (playing) { stop(); return; }
    selectedManually = true;
    playing = true;
    play.textContent = 'Pause views';
    play.setAttribute('aria-pressed', 'true');
    playbackStart = performance.now();
    show(0);
    playbackFrame = requestAnimationFrame(tick);
  });
  window.addEventListener('scroll', () => {
    if (!playing) selectedManually = false;
    update();
  }, { passive: true });
  window.addEventListener('resize', update);
  document.addEventListener('visibilitychange', () => { if (document.hidden) stop(); });
  reducedMotion.addEventListener('change', () => { stop(); selectedManually = false; show(0); update(); });
  show(0);
  update();
})();
