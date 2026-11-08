'use strict';

/**
 * Desktop side navigation (shown from 992px up via CSS).
 * The sidebar is a narrow icon rail by default; the menu button at the top
 * opens the full panel and remembers the choice. Below 992px the bottom navigation is used.
 */
(() => {
  const STORAGE_KEY = 'sidebarOpen';
  const root = document.documentElement;
  const nav = document.querySelector('header .navbar');
  if (!nav) return;

  const readSaved = () => {
    try {
      return localStorage.getItem(STORAGE_KEY) === 'true';
    } catch {
      return false;
    }
  };

  const save = (open) => {
    try {
      localStorage.setItem(STORAGE_KEY, String(open));
    } catch {
      /* storage can be blocked; the choice then lasts for this page only */
    }
  };

  root.classList.toggle('sidebar-open', readSaved());

  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'sidebar-toggle';
  button.setAttribute('aria-controls', 'mainNavbar');
  button.innerHTML = '<i class="fas fa-angles-right" aria-hidden="true"></i>';

  const sync = () => {
    const open = root.classList.contains('sidebar-open');
    button.setAttribute('aria-expanded', String(open));
    const label = open ? 'Minimize menu' : 'Expand menu';
    button.setAttribute('aria-label', label);
    button.title = label;
  };

  button.addEventListener('click', () => {
    save(root.classList.toggle('sidebar-open'));
    sync();
  });

  // tooltips for the icon rail, read from the current language
  for (const link of nav.querySelectorAll('.headLinks')) {
    link.addEventListener('mouseenter', () => {
      link.title = link.querySelector('span')?.textContent.trim() ?? '';
    });
  }

  // thin break lines: under the menu button, under the logo, above the theme / language switches
  const makeDivider = () => {
    const hr = document.createElement('hr');
    hr.className = 'sidebar-divider';
    hr.setAttribute('aria-hidden', 'true');
    return hr;
  };

  nav.prepend(button, makeDivider());
  // nav.querySelector('.navbar-brand')?.after(makeDivider());
  const switches = nav.querySelector('.toggle-btn');
  switches?.before(Object.assign(makeDivider(), { className: 'sidebar-divider sidebar-divider--end' }));
  sync();
})();
