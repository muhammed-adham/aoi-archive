// Video cards: duration badge (from data-duration, in seconds) and a category · date line.
// Runs before main.js so the language system translates the category label.
(function () {
  function formatDuration(total) {
    var s = Math.max(0, parseInt(total, 10) || 0);
    var h = Math.floor(s / 3600);
    var m = Math.floor((s % 3600) / 60);
    var sec = s % 60;
    var pad = function (n) { return (n < 10 ? '0' : '') + n; };
    return h > 0 ? h + ':' + pad(m) + ':' + pad(sec) : m + ':' + pad(sec);
  }

  document.querySelectorAll('.video-card-wrapper').forEach(function (card) {
    // duration badge on the thumbnail
    var seconds = card.getAttribute('data-duration');
    var thumb = card.querySelector('.thumbnail-container');
    if (seconds && thumb && !thumb.querySelector('.video-duration')) {
      var badge = document.createElement('time');
      badge.className = 'video-duration';
      badge.setAttribute('datetime', 'PT' + parseInt(seconds, 10) + 'S');
      badge.textContent = formatDuration(seconds);
      thumb.appendChild(badge);
    }

    // category + date line above the title
    var title = card.querySelector('.video-card-title');
    if (title && !card.querySelector('.video-meta')) {
      var meta = document.createElement('div');
      meta.className = 'video-meta';

      var cat = card.getAttribute('data-category');
      if (cat) {
        var c = document.createElement('span');
        c.className = 'video-meta__cat';
        c.setAttribute('data-lang', cat);
        c.textContent = cat;
        meta.appendChild(c);
      }

      var date = card.getAttribute('data-date');
      if (date) {
        var d = document.createElement('time');
        d.className = 'video-meta__date';
        d.setAttribute('datetime', date);
        d.textContent = date;
        meta.appendChild(d);
      }

      title.parentNode.insertBefore(meta, title);
    }
  });
})();
