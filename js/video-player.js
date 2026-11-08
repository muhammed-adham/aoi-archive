'use strict';

/**
 * Overlay video player for the videos page.
 * A plain click on a card link (`.video-overlay`, created by video-cards.js) opens the YouTube video
 * in an overlay on the same page. Ctrl/Cmd/Shift/Alt-click and middle-click keep the normal link.
 * Close with the X button, the Escape key or a click on the backdrop; closing stops playback.
 */
(() => {
  const VIDEO_ID_IN_URL = /[?&]v=([A-Za-z0-9_-]+)/;

  let modal = null;
  let frame = null;
  let titleEl = null;
  let youtubeLink = null;
  let closeButton = null;
  let lastFocus = null;

  const text = (key, fallback) => {
    const lang = localStorage.getItem('selectedLanguage') === 'ar' ? 'ar' : 'en';
    return window.translations?.[lang]?.[key] || fallback;
  };

  const build = () => {
    modal = document.createElement('div');
    modal.className = 'vp-modal';
    modal.hidden = true;
    modal.setAttribute('role', 'dialog');
    modal.setAttribute('aria-modal', 'true');
    modal.innerHTML = `
      <div class="vp-modal__backdrop" data-close></div>
      <div class="vp-modal__dialog">
        <button type="button" class="vp-modal__close" data-close><i class="fas fa-xmark" aria-hidden="true"></i></button>
        <div class="vp-modal__frame">
          <iframe allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowfullscreen referrerpolicy="strict-origin-when-cross-origin"></iframe>
        </div>
        <div class="vp-modal__bar">
          <p class="vp-modal__title"></p>
          <a class="vp-modal__yt" target="_blank" rel="noopener noreferrer"><i class="fab fa-youtube" aria-hidden="true"></i><span></span></a>
        </div>
      </div>`;
    document.body.append(modal);

    frame = modal.querySelector('iframe');
    titleEl = modal.querySelector('.vp-modal__title');
    youtubeLink = modal.querySelector('.vp-modal__yt');
    closeButton = modal.querySelector('.vp-modal__close');

    modal.addEventListener('click', (event) => {
      if (event.target.closest('[data-close]')) close();
    });
  };

  const open = (videoId, title) => {
    if (!modal) build();
    lastFocus = document.activeElement;

    titleEl.textContent = title;
    frame.title = title || 'Video';
    modal.setAttribute('aria-label', title || 'Video');
    closeButton.setAttribute('aria-label', text('closeVideo', 'Close video'));
    youtubeLink.href = `https://www.youtube.com/watch?v=${videoId}`;
    youtubeLink.querySelector('span').textContent = text('watchOnYoutube', 'Watch on YouTube');

    frame.src = `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&rel=0&playsinline=1`;
    modal.hidden = false;
    document.body.classList.add('vp-modal-open');
    setTimeout(() => { if (!modal.hidden) modal.classList.add('is-open'); }, 20); // lets the fade-in run
    closeButton.focus();
  };

  const close = () => {
    if (!modal || modal.hidden) return;
    modal.classList.remove('is-open');
    modal.hidden = true;
    frame.src = 'about:blank'; // stops playback
    document.body.classList.remove('vp-modal-open');
    lastFocus?.focus?.();
  };

  // Escape closes; Tab stays inside the dialog (close button <-> YouTube link)
  document.addEventListener('keydown', (event) => {
    if (!modal || modal.hidden) return;

    if (event.key === 'Escape') {
      event.preventDefault();
      close();
    } else if (event.key === 'Tab') {
      event.preventDefault();
      const focusable = [closeButton, youtubeLink];
      const current = focusable.indexOf(document.activeElement);
      const step = event.shiftKey ? -1 : 1;
      const next = current === -1 ? (event.shiftKey ? focusable.length - 1 : 0) : (current + step + focusable.length) % focusable.length;
      focusable[next].focus();
    }
  });

  // card links
  document.addEventListener('click', (event) => {
    const link = event.target.closest?.('.video-overlay');
    if (!link) return;
    if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;

    const videoId = VIDEO_ID_IN_URL.exec(link.getAttribute('href') ?? '')?.[1];
    if (!videoId) return;

    event.preventDefault();
    const title = link.closest('.video-card-wrapper')?.querySelector('.video-card-title')?.textContent.trim() ?? '';
    open(videoId, title);
  });
})();
