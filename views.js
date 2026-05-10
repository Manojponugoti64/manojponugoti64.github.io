/* views.js
 *
 * Anonymous view counter for articles. Uses the same Abacus backend that
 * powers `upvote.js` (no new accounts/keys), but a separate namespace so
 * the upvote and view counters never collide.
 *
 * Per-page behaviour:
 *   - On article pages (`.post-content`): hit `/hit/{ns}/{slug}` once per
 *     browser session (sessionStorage gate so refresh-spam doesn't inflate
 *     the count). Subsequent loads in the same tab read with `/get`.
 *     Result is injected into `.post-meta` as e.g. `· 142 views`.
 *   - On the homepage (`.posts-grid`): for each `.post-card`, read its
 *     slug from the linked article URL and call `/get/{ns}/{slug}` to
 *     show the count next to the reading time. Never increments.
 *
 * The slug for a post is the last URL segment with the `.html` stripped,
 * so `/posts/the-optimal-rate-of-failure.html` → `the-optimal-rate-of-failure`.
 */
(function () {
  var NS = 'manojponugoti-blog-views';
  var ENDPOINT = 'https://abacus.jasoncameron.dev';

  function slugFromHref(href) {
    if (!href) return null;
    var clean = href.split('?')[0].split('#')[0];
    var last = clean.split('/').pop() || '';
    return last.replace(/\.html?$/i, '') || null;
  }

  function pluralize(n) {
    return n === 1 ? '1 view' : (n + ' views');
  }

  function injectMeta(metaEl, label) {
    if (!metaEl) return;
    if (metaEl.querySelector('.view-count')) return;
    var sep = document.createElement('span');
    sep.className = 'meta-dot';
    sep.setAttribute('aria-hidden', 'true');
    sep.textContent = '·';
    var span = document.createElement('span');
    span.className = 'view-count';
    span.textContent = label;
    metaEl.appendChild(sep);
    metaEl.appendChild(span);
  }

  function getCount(slug) {
    return fetch(ENDPOINT + '/get/' + encodeURIComponent(NS) + '/' + encodeURIComponent(slug), { mode: 'cors' })
      .then(function (r) {
        if (r.status === 404) return 0;
        if (!r.ok) throw new Error('get failed');
        return r.json().then(function (d) { return (d && typeof d.value === 'number') ? d.value : 0; });
      });
  }

  function hitCount(slug) {
    return fetch(ENDPOINT + '/hit/' + encodeURIComponent(NS) + '/' + encodeURIComponent(slug), { mode: 'cors' })
      .then(function (r) {
        if (!r.ok) throw new Error('hit failed');
        return r.json().then(function (d) { return (d && typeof d.value === 'number') ? d.value : 0; });
      });
  }

  /* ===== Article page: increment + display ===== */
  function setupArticle() {
    var article = document.querySelector('.post-content');
    if (!article) return false;
    var meta = article.querySelector('.post-meta');
    if (!meta) return false;
    var slug = slugFromHref(location.pathname);
    if (!slug) return false;

    var sessionKey = 'viewed:' + slug;
    var alreadyHit = false;
    try { alreadyHit = sessionStorage.getItem(sessionKey) === '1'; } catch (e) { /* private mode */ }

    var p = alreadyHit ? getCount(slug) : hitCount(slug).then(function (n) {
      try { sessionStorage.setItem(sessionKey, '1'); } catch (e) { /* ignore */ }
      return n;
    });

    p.then(function (n) {
      injectMeta(meta, pluralize(n));
    }).catch(function () { /* silent: zero counter is more honest than fake */ });
    return true;
  }

  /* ===== Homepage: read-only display per card ===== */
  function setupHomepage() {
    var cards = document.querySelectorAll('.posts-grid .post-card');
    if (!cards.length) return false;
    cards.forEach(function (card) {
      var link = card.querySelector('h2 a, a');
      var meta = card.querySelector('.post-meta');
      if (!link || !meta) return;
      if (meta.querySelector('.view-count')) return;
      var slug = slugFromHref(link.getAttribute('href'));
      if (!slug) return;
      getCount(slug)
        .then(function (n) { injectMeta(meta, pluralize(n)); })
        .catch(function () { /* swallow */ });
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
