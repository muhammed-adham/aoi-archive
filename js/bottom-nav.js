// Mobile bottom navigation (shown below 992px via CSS).
// Page links + theme / language buttons that drive the existing header toggles.
(function () {
  var page = (location.pathname.split('/').pop() || 'index.html').toLowerCase();

  var items = [
    { href: 'index.html', icon: 'fa-house', key: 'home', label: 'Home' },
    { href: 'videos.html', icon: 'fa-circle-play', key: 'videos', label: 'Videos' },
    { href: 'about.html', icon: 'fa-circle-info', key: 'aboutShort', label: 'Chairman' }
  ];

  var nav = document.createElement('nav');
  nav.className = 'bottom-nav';
  nav.setAttribute('aria-label', 'Primary');

  items.forEach(function (it) {
    var a = document.createElement('a');
    a.href = it.href;
    a.className = 'bottom-nav__item';
    if (page === it.href || (page === 'details.html' && it.href === 'index.html')) {
      a.classList.add('active');
      a.setAttribute('aria-current', 'page');
    }
    a.innerHTML = '<i class="fas ' + it.icon + '" aria-hidden="true"></i><span data-lang="' + it.key + '">' + it.label + '</span>';
    nav.appendChild(a);
  });

  [
    { id: 'chk', icon: 'fa-circle-half-stroke', key: 'themeLabel', label: 'Theme' },
    { id: 'chklang', icon: 'fa-language', key: 'langLabel', label: 'Language' }
  ].forEach(function (it) {
    var b = document.createElement('button');
    b.type = 'button';
    b.className = 'bottom-nav__item';
    b.innerHTML = '<i class="fas ' + it.icon + '" aria-hidden="true"></i><span data-lang="' + it.key + '">' + it.label + '</span>';
    // look the checkbox up on click: main.js replaces the language toggle node
    b.addEventListener('click', function () {
      var cb = document.getElementById(it.id);
      if (cb) cb.click();
    });
    nav.appendChild(b);
  });

  document.body.appendChild(nav);
})();
