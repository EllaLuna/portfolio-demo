// Gameplay loops: play while on screen, pause when off screen.
// Respects prefers-reduced-motion (no autoplay) and gives every clip
// a visible play/pause button (WCAG 2.2.2).
(() => {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const slots = document.querySelectorAll('.card-media');
  if (!slots.length) return;

  const tryPlay = (video) => video.play().catch(() => {});

  const syncButton = (button, playing) => {
    const action = playing ? 'Pause' : 'Play';
    button.textContent = action;
    button.setAttribute('aria-label', `${action} clip`);
  };

  const observer = 'IntersectionObserver' in window
    ? new IntersectionObserver((entries) => {
        entries.forEach(({ target, isIntersecting }) => {
          const video = target.querySelector('video');
          if (!isIntersecting) {
            video.pause();
          } else if (!reduceMotion.matches && video.dataset.userPaused !== 'true') {
            tryPlay(video);
          }
        });
      }, { threshold: 0.25 })
    : null;

  slots.forEach((slot) => {
    const video = slot.querySelector('video');
    const button = slot.querySelector('.loop-toggle');
    if (!video || !button) return;

    // Missing or unsupported clip: leave the poster, hide the button.
    const source = video.querySelector('source');
    if (source) source.addEventListener('error', () => { button.hidden = true; });

    video.addEventListener('play', () => syncButton(button, true));
    video.addEventListener('pause', () => syncButton(button, false));

    button.addEventListener('click', () => {
      if (video.paused) {
        video.dataset.userPaused = 'false';
        tryPlay(video);
      } else {
        video.dataset.userPaused = 'true';
        video.pause();
      }
    });

    syncButton(button, false);
    button.hidden = false;
    if (observer) observer.observe(slot);
  });
})();

// Trailer: a plain link to YouTube until clicked, then swapped for the
// embed. Nothing loads from YouTube before the visitor asks for it.
(() => {
  document.querySelectorAll('.trailer-link[data-youtube-id]').forEach((link) => {
    link.addEventListener('click', (event) => {
      event.preventDefault();
      const iframe = document.createElement('iframe');
      iframe.src = `https://www.youtube-nocookie.com/embed/${encodeURIComponent(link.dataset.youtubeId)}?autoplay=1&rel=0`;
      iframe.title = link.dataset.title || 'Trailer';
      iframe.allow = 'autoplay; encrypted-media; picture-in-picture; fullscreen';
      iframe.allowFullscreen = true;
      link.replaceWith(iframe);
      iframe.focus();
    });
  });
})();
