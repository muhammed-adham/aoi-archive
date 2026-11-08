'use strict';

/**
 * Applies the saved language and theme before anything is shown.
 * The page stays hidden (html.settings-loading, see styles.css) until this has run, and the
 * header toggles open already in their saved position instead of sliding into it.
 */
(() => {
  const root = document.documentElement;

  root.classList.add('settings-loading');
  root.classList.add('no-toggle-anim'); // transitions are switched on once the page has loaded

  const enableToggleAnimation = () => root.classList.remove('no-toggle-anim');
  window.addEventListener('load', () => setTimeout(enableToggleAnimation, 150));
  setTimeout(enableToggleAnimation, 2000); // safety net

  const applySettings = () => {
    const language = localStorage.getItem('selectedLanguage') || 'en';
    const isDark = localStorage.getItem('isDark?') === 'true';
    const isArabic = language === 'ar';

    root.lang = language;
    root.dir = isArabic ? 'rtl' : 'ltr';
    document.body.classList.toggle('rtl', isArabic);

    if (isDark) {
      root.classList.add('darkMode');
      document.body.classList.add('dark-mode');
    }

    // put the header toggles in their saved position before the first paint
    const languageToggle = document.getElementById('chklang');
    if (languageToggle) languageToggle.checked = isArabic;
    const themeToggle = document.getElementById('chk');
    if (themeToggle) themeToggle.checked = isDark;

    root.classList.remove('settings-loading');

    window.dispatchEvent(new CustomEvent('settingsLoaded', { detail: { language, isDark } }));
  };

  // run as early as possible
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', applySettings);
  } else {
    applySettings();
  }
})();
