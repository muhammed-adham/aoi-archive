'use strict';

/**
 * "Show more" paging for the home (articles) and videos pages.
 *
 * Shows PAGE_SIZE cards, then PAGE_SIZE more per click. It works on top of the existing filters:
 * cards that a filter hides keep their inline `display: none`; cards beyond the limit get the
 * `.paged-out` class. Whenever the filters change (they rewrite the result counter) the list goes
 * back to the first page.
 */
(() => {
  const PAGE_SIZE = 12;

  const isVideos = Boolean(document.getElementById('videos'));
  const itemSelector = isVideos ? '#videos .video-card-wrapper' : '#articles .box';
  const anchor = isVideos
    ? document.getElementById('videos')
    : document.querySelector('#articles > .container:not(.aoi-tools)');
  if (!anchor || !document.querySelector(itemSelector)) return;

  let shown = PAGE_SIZE;

  // ---- markup ----
  const wrap = document.createElement('div');
  wrap.className = isVideos ? 'show-more' : 'show-more show-more--page';
  wrap.hidden = true;
  wrap.innerHTML = `
    <p class="show-more__status" role="status" aria-live="polite"></p>
    <div class="show-more__bar" aria-hidden="true"><span></span></div>
    <button type="button" class="show-more__btn"><i class="fas fa-plus" aria-hidden="true"></i><span></span></button>`;
  anchor.after(wrap);

  const statusEl = wrap.querySelector('.show-more__status');
  const barFill = wrap.querySelector('.show-more__bar span');
  const button = wrap.querySelector('.show-more__btn');
  const buttonLabel = button.querySelector('span');

  // ---- helpers ----
  const text = (key, fallback) => {
    const lang = localStorage.getItem('selectedLanguage') === 'ar' ? 'ar' : 'en';
    return window.translations?.[lang]?.[key] || fallback;
  };

  // cards the filters currently allow, in DOM order
  const matching = () => [...document.querySelectorAll(itemSelector)].filter((el) => el.style.display !== 'none');

  const render = (total, visible) => {
    buttonLabel.textContent = text('showMoreBtn', 'Show more');
    statusEl.textContent = `${text('showingArticles', 'Showing')} ${visible} ${text('ofArticles', 'of')} ${total}`;
    barFill.style.width = `${total ? Math.round((visible / total) * 100) : 0}%`;
  };

  const update = (previouslyShown) => {
    const list = matching();
    const total = list.length;
    const visible = Math.min(shown, total);

    list.forEach((el, index) => {
      const hidden = index >= shown;
      el.classList.toggle('paged-out', hidden);

      // animate only the cards revealed by this click
      if (!hidden && typeof previouslyShown === 'number' && index >= previouslyShown) {
        el.classList.remove('is-revealed');
        void el.offsetWidth; // restart the animation
        el.classList.add('is-revealed');
      }
    });

    wrap.hidden = total <= PAGE_SIZE;
    button.hidden = visible >= total;
    render(total, visible);
  };

  // ---- events ----
  button.addEventListener('click', () => {
    const previous = shown;
    shown += PAGE_SIZE;
    update(previous);
  });

  // filters, search and sort rewrite the counter: go back to the first page
  const counter = document.getElementById('article-count');
  if (counter) {
    new MutationObserver(() => {
      shown = PAGE_SIZE;
      update();
    }).observe(counter, { childList: true, characterData: true, subtree: true });
  }

  window.addEventListener('languageChanged', () => {
    const list = matching();
    render(list.length, Math.min(shown, list.length));
  });

  update();
  setTimeout(update, 400); // the filter scripts initialise after this one
})();
