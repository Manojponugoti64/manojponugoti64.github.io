/* spotify.js
 *
 * Floating "Now playing on Spotify" widget. Reads /now-playing.json (kept
 * fresh by .github/workflows/spotify-now-playing.yml — see SPOTIFY_SETUP.md
 * in the repo root) and renders a small pill in the bottom-right of every
 * page when something is actively playing.
 *
 * - Stays completely hidden when nothing is playing or the JSON hasn't been
 *   populated yet (so the widget is a no-op until you hook up the
 *   workflow).
 * - Refreshes every 60s while the page is open.
 * - Pause/dismiss via the X button (per-session, sessionStorage).
 * - Click the pill to open the track on Spotify.
 *
 * No bundlers, no dependencies. Pure browser JS.
 */
(function () {
  var FEED_URL = '/now-playing.json';
  var POLL_INTERVAL_MS = 60 * 1000;
  var DISMISS_KEY = 'spotifyDismissed';

  function pathPrefix() {
    // /now-playing.json lives at site root. Pages under /posts/, /iss-tracker/, etc.
    // need root-relative URL — '/now-playing.json' works for GitHub Pages user sites.
    return FEED_URL;
  }

  function dismissed() {
    try { return sessionStorage.getItem(DISMISS_KEY) === '1'; } catch (e) { return false; }
  }
  function dismiss() {
    try { sessionStorage.setItem(DISMISS_KEY, '1'); } catch (e) { /* ignore */ }
  }

  function el(tag, attrs, children) {
    var node = document.createElement(tag);
    if (attrs) {
      Object.keys(attrs).forEach(function (k) {
        if (k === 'class') node.className = attrs[k];
        else if (k === 'text') node.textContent = attrs[k];
        else if (k === 'html') node.innerHTML = attrs[k];
        else node.setAttribute(k, attrs[k]);
      });
    }
    (children || []).forEach(function (c) { if (c) node.appendChild(c); });
    return node;
  }

  function buildWidget(onDismiss) {
    var widget = el('a', {
      class: 'spotify-widget',
      href: '#',
      target: '_blank',
      rel: 'noopener noreferrer',
      'aria-label': 'Currently playing on Spotify'
    });
    widget.style.display = 'none';

    var art = el('img', { class: 'spotify-widget-art', alt: '' });
    var info = el('div', { class: 'spotify-widget-info' }, [
      el('div', { class: 'spotify-widget-eyebrow', text: 'Now playing' }),
      el('div', { class: 'spotify-widget-title' }),
      el('div', { class: 'spotify-widget-artist' })
    ]);

    var bars = el('span', { class: 'spotify-widget-bars', 'aria-hidden': 'true', html: '<i></i><i></i><i></i><i></i>' });

    var close = el('button', {
      class: 'spotify-widget-close',
      type: 'button',
      'aria-label': 'Hide now-playing widget for this session'
    });
    close.textContent = '×';
    close.addEventListener('click', function (e) {
      e.preventDefault();
      e.stopPropagation();
      dismiss();
      if (typeof onDismiss === 'function') onDismiss();
      widget.remove();
    });

    widget.appendChild(art);
    widget.appendChild(bars);
    widget.appendChild(info);
    widget.appendChild(close);
    return widget;
  }

  function render(widget, data) {
    if (!data || !data.isPlaying || !data.title) {
      widget.classList.remove('is-visible');
      widget.style.display = 'none';
      return;
    }
    var art = widget.querySelector('.spotify-widget-art');
    var titleEl = widget.querySelector('.spotify-widget-title');
    var artistEl = widget.querySelector('.spotify-widget-artist');
    if (data.albumImageUrl) {
      art.src = data.albumImageUrl;
      art.style.display = '';
    } else {
      art.style.display = 'none';
    }
    titleEl.textContent = data.title;
    artistEl.textContent = data.artist || '';
    if (data.songUrl) widget.setAttribute('href', data.songUrl);
    widget.style.display = '';
    requestAnimationFrame(function () { widget.classList.add('is-visible'); });
  }

  function fetchFeed(widget) {
    fetch(pathPrefix(), { cache: 'no-store' })
      .then(function (r) { return r.ok ? r.json() : null; })
      .then(function (data) { render(widget, data); })
      .catch(function () { /* keep last state */ });
  }

  function init() {
    if (dismissed()) return;
    var pollId = null;
    var onVisible = null;
    function teardown() {
      if (pollId !== null) { clearInterval(pollId); pollId = null; }
      if (onVisible) { document.removeEventListener('visibilitychange', onVisible); onVisible = null; }
    }
    var widget = buildWidget(teardown);
    document.body.appendChild(widget);
    fetchFeed(widget);
    pollId = setInterval(function () { fetchFeed(widget); }, POLL_INTERVAL_MS);
    // Re-poll when tab regains focus (e.g. after a long sleep) so the
    // displayed track snaps to current state instead of staying stale.
    onVisible = function () {
      if (document.visibilityState === 'visible') fetchFeed(widget);
    };
    document.addEventListener('visibilitychange', onVisible);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
