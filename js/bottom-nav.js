'use strict';

/**
 * Mobile bottom navigation (shown below 992px via CSS).
 * Page links plus theme / language buttons that drive the existing header toggles.
 */
(() => {
  const currentPage = (location.pathname.split('/').pop() || 'index.html').toLowerCase();

  const PAGES = [
    { href: 'index.html', icon: 'fa-house', key: 'home', label: 'Home' },
    { href: 'videos.html', icon: 'fa-play', key: 'videos', label: 'Videos' },
    { href: 'about.html', icon: 'fa-circle-info', key: 'aboutShort', label: 'Chairman' },
  ];

  // each button clicks the matching header checkbox (the theme or language toggle)
  const ACTIONS = [
    { toggleId: 'chk', icon: 'fa-circle-half-stroke', key: 'themeLabel', label: 'Theme' },
    { toggleId: 'chklang', icon: 'fa-language', key: 'langLabel', label: 'Language' },
  ];

  const itemHTML = ({ icon, key, label }) =>
    `<i class="fas ${icon}" aria-hidden="true"></i><span data-lang="${key}">${label}</span>`;

  // the details page belongs to Home
  const isCurrent = (href) => currentPage === href || (currentPage === 'details.html' && href === 'index.html');

  const nav = document.createElement('nav');
  nav.className = 'bottom-nav';
  nav.setAttribute('aria-label', 'Primary');

  for (const page of PAGES) {
    const link = document.createElement('a');
    link.href = page.href;
    link.className = 'bottom-nav__item';
    link.innerHTML = itemHTML(page);
    if (isCurrent(page.href)) {
      link.classList.add('active');
      link.setAttribute('aria-current', 'page');
    }
    nav.append(link);
  }

  for (const action of ACTIONS) {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'bottom-nav__item';
    button.innerHTML = itemHTML(action);
    // look the checkbox up on click: main.js replaces the language toggle node
    button.addEventListener('click', () => document.getElementById(action.toggleId)?.click());
    nav.append(button);
  }

  document.body.append(nav);
})();
