/* reading-time.js
 *
 * Two responsibilities:
 *   1. On article pages (anything with `.post-content`): compute a reading
 *      time from the article body and inject "X min read" into `.post-meta`.
 *      Also render a thin scroll-progress bar pinned to the top of the
 *      viewport that fills as the reader scrolls through the article.
 *   2. On the homepage (`.posts-grid`): for each `.post-card`, fetch the
 *      linked article HTML, compute the same reading time, and inject it
 *      into the card's `.post-meta`.
 *
 * Words per minute is conservative enough to round nicely on short posts.
 */
(function () {
  var WPM = 230;

  function wordCount(el) {
    if (!el) return 0;
    var text = (el.innerText || el.textContent || '').trim();
    if (!text) return 0;
    return text.split(/\s+/).length;
  }

  function minutesFor(words) {
    return Math.max(1, Math.round(words / WPM));
  }

  function injectMeta(metaEl, label) {
    if (!metaEl) return;
    if (metaEl.querySelector('.reading-time')) return;
    var sep = document.createElement('span');
    sep.className = 'meta-dot';
    sep.setAttribute('aria-hidden', 'true');
    sep.textContent = '·';
    var span = document.createElement('span');
    span.className = 'reading-time';
    span.textContent = label;
    metaEl.appendChild(sep);
    metaEl.appendChild(span);
  }

  /* ===== Article page: reading time + scroll progress ===== */
  function setupArticle() {
    var article = document.querySelector('.post-content');
    if (!article) return false;

    var meta = article.querySelector('.post-meta');
    var minutes = minutesFor(wordCount(article));
    injectMeta(meta, minutes + ' min read');

    var bar = document.createElement('div');
    bar.className = 'scroll-progress';
    bar.setAttribute('aria-hidden', 'true');
    var fill = document.createElement('div');
    fill.className = 'scroll-progress-fill';
    bar.appendChild(fill);
    document.body.appendChild(bar);

    var ticking = false;
    function update() {
      var doc = document.documentElement;
      var max = doc.scrollHeight - window.innerHeight;
      var pct = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
      fill.style.transform = 'scaleX(' + pct + ')';
      ticking = false;
    }
    window.addEventListener('scroll', function () {
      if (!ticking) {
        window.requestAnimationFrame(update);
        ticking = true;
      }
    }, { passive: true });
    window.addEventListener('resize', update);
    update();
    return true;
  }

  /* ===== Homepage: reading time per post-card ===== */
  function setupHomepage() {
    var cards = document.querySelectorAll('.posts-grid .post-card');
    if (!cards.length) return false;
    cards.forEach(function (card) {
      var link = card.querySelector('h2 a, a');
      var meta = card.querySelector('.post-meta');
      if (!link || !meta) return;
      if (meta.querySelector('.reading-time')) return;
      var href = link.getAttribute('href');
      if (!href) return;
      fetch(href, { credentials: 'same-origin' })
        .then(function (r) { return r.ok ? r.text() : null; })
        .then(function (html) {
          if (!html) return;
          var doc = new DOMParser().parseFromString(html, 'text/html');
          var body = doc.querySelector('.post-content');
          if (!body) return;
          var minutes = minutesFor(wordCount(body));
          injectMeta(meta, minutes + ' min read');
        })
        .catch(function () { /* swallow — silent failure is fine here */ });
    });
    return true;
  }

  function init() {
    setupArticle();
    setupHomepage();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
