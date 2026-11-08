'use strict';

/**
 * Video cards (poster style): category tag, logo, big play mark, title + "Play video" pill.
 *  - the duration comes from the card's `data-duration` attribute (seconds)
 *  - the whole card is a real link to the YouTube video found in its thumbnail URL
 *    (js/video-player.js opens it in an overlay; Ctrl/Cmd-click still opens YouTube)
 *
 * Runs before main.js so the language system translates the labels created here.
 */
(() => {
  const YOUTUBE_ID = /\/vi\/([A-Za-z0-9_-]+)\//;

  const pad = (n) => String(n).padStart(2, '0');

  /** 41 -> "0:41", 3725 -> "1:02:05" */
  const formatDuration = (totalSeconds) => {
    const seconds = Math.max(0, Number.parseInt(totalSeconds, 10) || 0);
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const rest = seconds % 60;
    return hours > 0 ? `${hours}:${pad(minutes)}:${pad(rest)}` : `${minutes}:${pad(rest)}`;
  };

  const element = (tag, className, text) => {
    const el = document.createElement(tag);
    if (className) el.className = className;
    if (text !== undefined) el.textContent = text;
    return el;
  };

  const timeElement = (className, isoValue, text) => {
    const el = element('time', className, text);
    el.dateTime = isoValue;
    return el;
  };

  /** Use YouTube's max-resolution thumbnail when it exists; otherwise zoom the standard one,
   *  which has black bars baked in, so it fills the tall card. */
  const upgradeThumbnail = (image, videoId) => {
    const zoomFallback = () => image.style.setProperty('--thumb-zoom', '1.35');
    const hiRes = new Image();
    hiRes.onload = () => (hiRes.naturalWidth > 400 ? (image.src = hiRes.src) : zoomFallback());
    hiRes.onerror = zoomFallback;
    hiRes.src = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
  };

  const enhance = (card) => {
    if (card.classList.contains('vc-ready')) return;
    card.classList.add('vc-ready');

    const title = card.querySelector('.video-card-title');
    const thumbnail = card.querySelector('.thumbnail-image');
    const videoId = YOUTUBE_ID.exec(thumbnail?.getAttribute('src') ?? '')?.[1] ?? null;

    if (thumbnail && videoId) upgradeThumbnail(thumbnail, videoId);

    // top-left: category tag
    const { category, duration, date } = card.dataset;
    if (category) {
      const tag = element('span', 'video-meta__cat', category);
      tag.dataset.lang = category; // translated by the language system
      const meta = element('div', 'video-meta');
      meta.append(tag);
      card.append(meta);
    }

    // top-right: white version of the AOI mark
    const logo = card.querySelector('.youtube-logo-image');
    if (logo) {
      logo.src = 'images/3-white.png';
      logo.alt = '';
    }

    // bottom: title, then [Play video | duration] pill and the date
    const pill = element('span', 'video-pill');
    pill.innerHTML = '<i class="fas fa-play" aria-hidden="true"></i><span data-lang="playVideo">Play video</span>';
    if (duration) {
      pill.append(timeElement('video-duration', `PT${Number.parseInt(duration, 10)}S`, formatDuration(duration)));
    }

    const row = element('div', 'video-row');
    row.append(pill);
    if (date) row.append(timeElement('video-meta__date', date, date));

    const info = element('div', 'video-info');
    if (title) info.append(title);
    info.append(row);
    card.append(info);

    // the whole card is a real link
    if (videoId) {
      const link = element('a', 'video-overlay');
      link.href = `https://www.youtube.com/watch?v=${videoId}`;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      if (title) {
        title.id ||= `vt-${videoId}`;
        link.setAttribute('aria-labelledby', title.id);
      } else {
        link.setAttribute('aria-label', card.dataset.title || 'Play video');
      }
      card.append(link);
    }
  };

  document.querySelectorAll('.video-card-wrapper').forEach(enhance);
})();
