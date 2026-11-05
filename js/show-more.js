// "Show more" paging for the home (articles) and videos pages.
// Shows 9 cards, then 9 more per click. It works on top of the existing filters:
// cards the filter hides keep their inline display:none; cards beyond the limit get
// the .paged-out class. Whenever the filters change (the result counter is rewritten)
// the page resets to the first 9.
(function () {
  var PAGE = 12;

  var isVideos = !!document.getElementById('videos');
  var itemSelector = isVideos ? '#videos .video-card-wrapper' : '#articles .box';
  var anchor = isVideos
    ? document.getElementById('videos')
    : document.querySelector('#articles > .container:not(.aoi-tools)');
  if (!anchor || !document.querySelector(itemSelector)) return;

  var shown = PAGE;

  // ---- UI ----
  var wrap = document.createElement('div');
  wrap.className = 'show-more' + (isVideos ? '' : ' show-more--page');
  wrap.hidden = true;
  wrap.innerHTML =
    '<p class="show-more__status" role="status" aria-live="polite"></p>' +
    '<div class="show-more__bar" aria-hidden="true"><span></span></div>' +
    '<button type="button" class="show-more__btn"><i class="fas fa-plus" aria-hidden="true"></i><span></span></button>';
  anchor.insertAdjacentElement('afterend', wrap);

  var statusEl = wrap.querySelector('.show-more__status');
  var barFill = wrap.querySelector('.show-more__bar span');
  var btn = wrap.querySelector('.show-more__btn');
  var btnLabel = btn.querySelector('span');

  function t(key, fallback) {
    var lang = localStorage.getItem('selectedLanguage') === 'ar' ? 'ar' : 'en';
    try {
      return (translations[lang] && translations[lang][key]) || fallback;
    } catch (e) {
      return fallback;
    }
  }

  function matching() {
    return Array.prototype.filter.call(document.querySelectorAll(itemSelector), function (el) {
      return el.style.display !== 'none';
    });
  }

  function render(total, visible) {
    btnLabel.textContent = t('showMoreBtn', 'Show more');
    statusEl.textContent = t('showingArticles', 'Showing') + ' ' + visible + ' ' + t('ofArticles', 'of') + ' ' + total;
    barFill.style.width = (total ? Math.round((visible / total) * 100) : 0) + '%';
  }

  function apply(previouslyShown) {
    var list = matching();
    var total = list.length;
    var visible = Math.min(shown, total);

    list.forEach(function (el, i) {
      var out = i >= shown;
      el.classList.toggle('paged-out', out);
      // animate only the cards revealed by this click
      if (!out && typeof previouslyShown === 'number' && i >= previouslyShown) {
        el.classList.remove('is-revealed');
        void el.offsetWidth; // restart animation
        el.classList.add('is-revealed');
      }
    });

    wrap.hidden = total <= PAGE;
    btn.hidden = visible >= total;
    render(total, visible);
  }

  btn.addEventListener('click', function () {
    var prev = shown;
    shown += PAGE;
    apply(prev);
  });

  // filters / search / sort rewrite the counter -> back to the first page
  var counter = document.getElementById('article-count');
  if (counter) {
    new MutationObserver(function () {
      shown = PAGE;
      apply();
    }).observe(counter, { childList: true, characterData: true, subtree: true });
  }

  window.addEventListener('languageChanged', function () {
    var list = matching();
    render(list.length, Math.min(shown, list.length));
  });

  apply();
  // filter scripts initialise after this one on some pages
  setTimeout(function () { apply(); }, 400);
})();
