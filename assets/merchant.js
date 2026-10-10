(() => {
  const tabs = [...document.querySelectorAll('[role="tab"]')];
  const activateTab = tab => {
    tabs.forEach(item => {
      const selected = item === tab;
      item.setAttribute('aria-selected', String(selected));
      item.tabIndex = selected ? 0 : -1;
      const panel = document.getElementById(item.getAttribute('aria-controls'));
      if (panel) panel.hidden = !selected;
    });
  };
  tabs.forEach((tab, index) => {
    tab.addEventListener('click', () => activateTab(tab));
    tab.addEventListener('keydown', event => {
      let next;
      if (event.key === 'ArrowRight') next = (index + 1) % tabs.length;
      if (event.key === 'ArrowLeft') next = (index + tabs.length - 1) % tabs.length;
      if (event.key === 'Home') next = 0;
      if (event.key === 'End') next = tabs.length - 1;
      if (next !== undefined) {
        event.preventDefault();
        activateTab(tabs[next]);
        tabs[next].focus();
      }
    });
  });
  const activateLinkedScreen = () => {
    if (location.hash === '#iphone') activateTab(document.getElementById('tab-owner'));
    if (location.hash === '#checkout') activateTab(document.getElementById('tab-checkout'));
  };
  window.addEventListener('hashchange', activateLinkedScreen);
  activateLinkedScreen();
  const displayModes = [...document.querySelectorAll('[data-display-mode]')];
  const customerPreview = document.getElementById('customer-preview');
  const customerVideo = document.getElementById('customer-ad-video');
  const customerPanel = document.getElementById('panel-customer');
  const videoToggle = document.querySelector('.customer-video-toggle');
  const customerExpand = customerPanel?.querySelector('[data-expand]');
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  let videoOnscreen = false;
  let requestedPause = false;
  let automaticPause = false;
  let previousShouldPlay = false;
  const syncVideo = () => {
    if (!customerVideo) return;
    const shouldPlay = videoOnscreen && !customerPanel.hidden && !customerVideo.hidden && !document.hidden;
    if (!shouldPlay) {
      if (!customerVideo.paused) { automaticPause = true; customerVideo.pause(); }
    } else if (!previousShouldPlay && !requestedPause && !reducedMotion.matches) {
      customerVideo.play().catch(() => {});
    }
    previousShouldPlay = shouldPlay;
  };
  displayModes.forEach(button => button.addEventListener('click', () => {
    const showVideo = button.dataset.displayMode === 'video';
    displayModes.forEach(mode => mode.setAttribute('aria-pressed', String(mode === button)));
    customerVideo.hidden = !showVideo;
    customerPreview.hidden = showVideo;
    customerExpand.hidden = showVideo;
    videoToggle.hidden = !showVideo;
    customerPanel.querySelector('.customer-device').setAttribute('aria-label', showVideo
      ? 'SleetPOS viewed from the customer side, showing a product video on its screen'
      : 'SleetPOS viewed from the customer side, showing the cart and a latte promotion on its screen');
    syncVideo();
  }));
  if (customerVideo) {
    customerVideo.muted = true;
    const updateVideoToggle = () => {
      videoToggle.textContent = customerVideo.paused ? 'Play video' : 'Pause video';
    };
    videoToggle.addEventListener('click', () => {
      if (customerVideo.paused) customerVideo.play().catch(() => {});
      else customerVideo.pause();
    });
    customerVideo.addEventListener('play', updateVideoToggle);
    customerVideo.addEventListener('pause', updateVideoToggle);
    updateVideoToggle();
    customerVideo.addEventListener('pause', () => {
      if (automaticPause) automaticPause = false;
      else requestedPause = true;
    });
    customerVideo.addEventListener('play', () => { requestedPause = false; automaticPause = false; });
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(entries => {
        videoOnscreen = entries[0].isIntersecting;
        syncVideo();
      }, { threshold: .15 }).observe(customerVideo);
    }
    new MutationObserver(syncVideo).observe(customerPanel, { attributes: true, attributeFilter: ['hidden'] });
    document.addEventListener('visibilitychange', syncVideo);
    reducedMotion.addEventListener('change', () => {
      if (reducedMotion.matches && !customerVideo.paused) { automaticPause = true; customerVideo.pause(); }
    });
  }
  const dialog = document.querySelector('.screen-dialog');
  document.querySelectorAll('[data-expand]').forEach(button => button.addEventListener('click', () => {
    const source = document.getElementById(button.dataset.expand);
    const preview = dialog.querySelector('img');
    preview.src = source.currentSrc || source.src;
    preview.alt = source.alt;
    dialog.querySelector('h2').textContent = button.dataset.title;
    dialog.showModal();
  }));
  dialog?.querySelector('.screen-dialog-close').addEventListener('click', () => dialog.close());
  dialog?.addEventListener('click', event => {
    if (event.target === dialog) {
      const bounds = dialog.getBoundingClientRect();
      if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) dialog.close();
    }
  });
})();
