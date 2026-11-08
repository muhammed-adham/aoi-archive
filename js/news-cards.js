'use strict';

/**
 * Home page article cards:
 *  - a source row (logo · AOI · category) on every card
 *  - one full-card link, so right-click, Ctrl/Cmd-click and middle-click work
 *    (the "Read more" link inside stays for keyboard users and points to the same page)
 *  - the empty state's "Clear All Filters" button re-uses the filter bar's own clear button
 *
 * Runs before main.js so the language system translates the category labels created here.
 */
(() => {
  const addSourceRow = (box) => {
    const text = box.querySelector('.cardText');
    if (!text || text.querySelector('.news-source')) return;

    const row = document.createElement('div');
    row.className = 'news-source';

    const logo = document.createElement('img');
    logo.src = 'images/favicon.png';
    logo.alt = '';
    logo.width = 16;
    logo.height = 16;

    const name = document.createElement('span');
    name.className = 'news-source__name';
    name.textContent = 'AOI';

    row.append(logo, name);

    const category = box.dataset.category;
    if (category) {
      const label = document.createElement('span');
      label.className = 'news-source__cat';
      label.dataset.lang = category; // translated by the language system
      label.textContent = category;
      row.append(label);
    }

    text.prepend(row);
  };

  const addCardLink = (box) => {
    if (box.querySelector('.card-overlay')) return;
    const readMore = box.querySelector('.cardFooter a[href]');
    if (!readMore) return;

    const overlay = document.createElement('a');
    overlay.className = 'card-overlay';
    overlay.href = readMore.getAttribute('href');
    overlay.tabIndex = -1; // keyboard users use the Read more link
    overlay.setAttribute('aria-hidden', 'true');
    box.append(overlay);
  };

  document.querySelectorAll('#articles .box').forEach((box) => {
    addSourceRow(box);
    addCardLink(box);
  });

  document.getElementById('empty-clear')?.addEventListener('click', () => {
    const clearButton = document.getElementById('clear-filters');
    if (clearButton && !clearButton.disabled) clearButton.click();
  });
})();
