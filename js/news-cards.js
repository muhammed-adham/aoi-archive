// Google News style cards: adds a source row (logo · AOI · category) to each article card.
// Runs before main.js so the language system translates the category label.
(function () {
  document.querySelectorAll('#articles .box').forEach(function (box) {
    var text = box.querySelector('.cardText');
    if (!text || text.querySelector('.news-source')) return;

    var row = document.createElement('div');
    row.className = 'news-source';

    var logo = document.createElement('img');
    logo.src = 'images/favicon.png';
    logo.alt = '';
    logo.width = 16;
    logo.height = 16;

    var name = document.createElement('span');
    name.className = 'news-source__name';
    name.textContent = 'AOI';

    row.appendChild(logo);
    row.appendChild(name);

    var cat = box.getAttribute('data-category');
    if (cat) {
      var c = document.createElement('span');
      c.className = 'news-source__cat';
      c.setAttribute('data-lang', cat);
      c.textContent = cat;
      row.appendChild(c);
    }

    text.insertBefore(row, text.firstChild);
  });
})();

// Empty state: "Clear All Filters" re-uses the existing clear button
(function () {
  var btn = document.getElementById('empty-clear');
  if (!btn) return;
  btn.addEventListener('click', function () {
    var clear = document.getElementById('clear-filters');
    if (clear && !clear.disabled) clear.click();
  });
})();

// Home cards: the whole card is one link. A real <a> overlay covers the card
// (so right-click, Ctrl/Cmd-click and middle-click work); the "Read more" link inside
// stays for keyboard users and points to the same page.
(function () {
  document.querySelectorAll('#articles .box').forEach(function (box) {
    if (box.querySelector('.card-overlay')) return;
    var more = box.querySelector('.cardFooter a[href]');
    if (!more) return;

    var overlay = document.createElement('a');
    overlay.className = 'card-overlay';
    overlay.href = more.getAttribute('href');
    overlay.tabIndex = -1;            // keyboard users use the Read more link
    overlay.setAttribute('aria-hidden', 'true');
    box.appendChild(overlay);
  });
})();
