import { createLabelSamples } from './label-samples.js';
import { createLabelConcepts } from './label-concepts.js';

const root = document.querySelector('[data-label-showcase]');
if (root) {
  const stage = root.querySelector('.label-stage');
  const paper = root.querySelector('.label-paper');
  const artwork = paper.querySelector('img');
  const choices = root.querySelector('.label-choices');
  const pause = root.querySelector('.label-animation-toggle');
  const dimensions = root.querySelector('.label-dimensions');
  const description = root.querySelector('.label-example-description');
  const status = root.querySelector('.label-example-status');
  const counter = root.querySelector('.label-example-count');
  const live = root.querySelector('.label-announcement');
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  const interval = 5800;
  let slides = [];
  let current = 0;
  let paused = motion.matches;
  let visible = false;
  let timer;
  let transition;

  const resize = () => {
    const slide = slides[current];
    if (!slide) return;
    const scale = Math.min((stage.clientWidth - 70) / slide.wIn, (stage.clientHeight - 88) / slide.hIn, 195);
    paper.style.width = `${slide.wIn * scale}px`;
    paper.style.height = `${slide.hIn * scale}px`;
  };
  const schedule = () => {
    clearTimeout(timer);
    pause.textContent = paused ? 'Play animation' : 'Pause animation';
    if (!paused && visible && !document.hidden && slides.length) {
      timer = setTimeout(() => show((current + 1) % slides.length), interval);
    }
  };
  const show = (index, manual = false) => {
    clearTimeout(transition);
    current = index;
    const slide = slides[index];
    if (manual) paused = true;
    root.querySelectorAll('[data-label-example]').forEach((button, i) => button.setAttribute('aria-pressed', String(i === index)));
    dimensions.textContent = slide.size;
    description.textContent = slide.description;
    status.textContent = slide.status;
    status.classList.toggle('is-concept', slide.status === 'Upcoming concept');
    counter.textContent = `${index + 1} / ${slides.length}`;
    paper.classList.add('is-changing');
    resize();
    const replaceArtwork = () => {
      artwork.src = slide.src;
      artwork.alt = slide.alt;
      paper.classList.remove('is-changing');
    };
    if (motion.matches || !artwork.getAttribute('src')) replaceArtwork();
    else transition = setTimeout(replaceArtwork, 180);
    if (manual) live.textContent = `${slide.title}. ${slide.size}. ${slide.status}.`;
    schedule();
  };

  pause.addEventListener('click', () => { paused = !paused; schedule(); });
  document.addEventListener('visibilitychange', schedule);
  new ResizeObserver(resize).observe(stage);
  new IntersectionObserver(entries => {
    visible = entries[0].isIntersecting && entries[0].intersectionRatio >= .2;
    schedule();
  }, { threshold: [0, .2] }).observe(root);
  motion.addEventListener('change', () => {
    if (motion.matches) { paused = true; clearTimeout(transition); if (slides.length) show(current); }
    schedule();
  });

  try {
    const available = await createLabelSamples();
    const concepts = createLabelConcepts();
    slides = [available[0], available[1], concepts[0], concepts[1], available[2]];
    for (const slide of slides) {
      const preview = new Image();
      preview.src = slide.src;
      await preview.decode();
    }
    choices.replaceChildren(...slides.map((slide, index) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.dataset.labelExample = slide.id;
      button.setAttribute('aria-controls', 'animated-label-paper');
      button.setAttribute('aria-pressed', 'false');
      const title = document.createElement('span');
      title.textContent = slide.title;
      const size = document.createElement('span');
      size.textContent = slide.size;
      const state = document.createElement('small');
      state.textContent = slide.status;
      button.append(title, size, state);
      button.addEventListener('click', () => show(index, true));
      return button;
    }));
    root.classList.add('is-ready');
    root.setAttribute('aria-busy', 'false');
    pause.hidden = false;
    show(0);
  } catch {
    root.classList.add('has-error');
    root.setAttribute('aria-busy', 'false');
    description.textContent = 'The animated preview could not load. See the real printed labels below.';
    stage.hidden = true;
    pause.hidden = true;
  }
}
