// Mockup-only helpers: dark mode + EN/AR toggle (text via data-en / data-ar)
(function () {
  var root = document.documentElement;
  function applyLang(l) {
    root.lang = l; root.dir = l === 'ar' ? 'rtl' : 'ltr';
    document.querySelectorAll('[data-en]').forEach(function (e) { e.textContent = e.dataset[l]; });
    document.querySelectorAll('[data-ph-en]').forEach(function (e) { e.placeholder = e.dataset[l === 'ar' ? 'phAr' : 'phEn']; });
    document.querySelectorAll('[data-toggle-lang]').forEach(function (b) { b.textContent = l === 'ar' ? 'EN' : 'عربي'; });
  }
  function applyTheme(t) {
    root.dataset.theme = t;
    document.querySelectorAll('[data-toggle-theme]').forEach(function (b) { b.innerHTML = t === 'dark' ? '☀' : '☾'; });
  }
  document.addEventListener('click', function (e) {
    if (e.target.closest('[data-toggle-lang]')) applyLang(root.lang === 'ar' ? 'en' : 'ar');
    if (e.target.closest('[data-toggle-theme]')) applyTheme(root.dataset.theme === 'dark' ? 'light' : 'dark');
    var chip = e.target.closest('.chip');
    if (chip) { chip.parentNode.querySelectorAll('.chip').forEach(function (c) { c.classList.remove('on'); }); chip.classList.add('on'); }
  });
  applyTheme('light'); applyLang('en');
})();
