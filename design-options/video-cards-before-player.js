// Video cards (poster style): category tag, logo, big play mark, title + "Play video" pill.
// - duration comes from data-duration (seconds)
// - the whole card links to the YouTube video found in its thumbnail URL
// Runs before main.js so the language system translates the labels created here.
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
    if (card.classList.contains('vc-ready')) return;
    card.classList.add('vc-ready');

    var title = card.querySelector('.video-card-title');
    var thumbImg = card.querySelector('.thumbnail-image');
    var idMatch = thumbImg && /\/vi\/([A-Za-z0-9_-]+)\//.exec(thumbImg.getAttribute('src') || '');
    var videoId = idMatch ? idMatch[1] : null;

    // the standard thumbnail has baked-in black bars: zoom it a little so it fills the tall card
    function zoomFallback() { if (thumbImg) thumbImg.style.setProperty('--thumb-zoom', '1.35'); }

    // sharper thumbnail when YouTube has a max-resolution image for this video
    if (thumbImg && videoId) {
      var hi = new Image();
      hi.onload = function () { if (hi.naturalWidth > 400) thumbImg.src = hi.src; else zoomFallback(); };
      hi.onerror = zoomFallback;
      hi.src = 'https://img.youtube.com/vi/' + videoId + '/maxresdefault.jpg';
    }

    // top-left: category tag
    var cat = card.getAttribute('data-category');
    if (cat) {
      var meta = document.createElement('div');
      meta.className = 'video-meta';
      var c = document.createElement('span');
      c.className = 'video-meta__cat';
      c.setAttribute('data-lang', cat);
      c.textContent = cat;
      meta.appendChild(c);
      card.appendChild(meta);
    }

    // top-right: logo (white version of the AOI mark)
    var logo = card.querySelector('.youtube-logo-image');
    if (logo) {
      logo.src = 'images/3-white.png';
      logo.alt = '';
    }

    // bottom: title + [Play video · duration] pill + date
    var info = document.createElement('div');
    info.className = 'video-info';
    if (title) info.appendChild(title);

    var row = document.createElement('div');
    row.className = 'video-row';

    var pill = document.createElement('span');
    pill.className = 'video-pill';
    pill.innerHTML = '<i class="fas fa-play" aria-hidden="true"></i><span data-lang="playVideo">Play video</span>';
    var seconds = card.getAttribute('data-duration');
    if (seconds) {
      var dur = document.createElement('time');
      dur.className = 'video-duration';
      dur.setAttribute('datetime', 'PT' + parseInt(seconds, 10) + 'S');
      dur.textContent = formatDuration(seconds);
      pill.appendChild(dur);
    }
    row.appendChild(pill);

    var date = card.getAttribute('data-date');
    if (date) {
      var d = document.createElement('time');
      d.className = 'video-meta__date';
      d.setAttribute('datetime', date);
      d.textContent = date;
      row.appendChild(d);
    }

    info.appendChild(row);
    card.appendChild(info);

    // whole card is a real link to the video
    if (videoId) {
      var a = document.createElement('a');
      a.className = 'video-overlay';
      a.href = 'https://www.youtube.com/watch?v=' + videoId;
      a.target = '_blank';
      a.rel = 'noopener noreferrer';
      if (title) { title.id = title.id || 'vt-' + videoId; a.setAttribute('aria-labelledby', title.id); }
      else { a.setAttribute('aria-label', card.getAttribute('data-title') || 'Play video'); }
      card.appendChild(a);
    }
  });
})();
