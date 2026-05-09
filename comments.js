/* comments.js
 *
 * Renders Giscus (GitHub-Discussions-backed comments) under any page that has
 * a `.post-content` article. The widget is themed to follow the site's
 * light/dark toggle: when the user flips the theme on the page, we swap the
 * Giscus theme too via its postMessage API.
 *
 * Setup needed (one-time, by Manoj):
 *   1. Enable Discussions on the repo:
 *      https://github.com/Manojponugoti64/manojponugoti64.github.io/settings#features
 *   2. Install the Giscus GitHub App on this repo only:
 *      https://github.com/apps/giscus
 *   3. Create a Discussion category named "Announcements" (or anything) of
 *      type "Announcement" so only Manoj can start threads, but visitors can
 *      reply.
 *   4. Visit https://giscus.app, paste the repo URL + category, and copy the
 *      generated repo-id and category-id into the constants below.
 *
 * Until those IDs are filled in, the widget shows a small placeholder note
 * instead of erroring.
 */
(function () {
  // === Fill these in after running through https://giscus.app ===
  var REPO = 'Manojponugoti64/manojponugoti64.github.io';
  var REPO_ID = '';        // e.g. 'R_kgDOL...'
  var CATEGORY = 'Announcements';
  var CATEGORY_ID = '';    // e.g. 'DIC_kwDOL...'
  // ===============================================================

  function $(sel, root) { return (root || document).querySelector(sel); }

  function currentTheme() {
    var t = document.documentElement.getAttribute('data-theme');
    return t === 'light' ? 'light' : 'dark_dimmed';
  }

  function mountPlaceholder(host) {
    var note = document.createElement('div');
    note.className = 'comments-placeholder';
    note.innerHTML =
      '<p><strong>Comments are coming.</strong></p>' +
      '<p>This site uses Giscus (GitHub Discussions). Once Manoj completes the ' +
      'one-time setup at <a href="https://giscus.app" target="_blank" ' +
      'rel="noopener">giscus.app</a>, this is where the conversation will live.</p>';
    host.appendChild(note);
  }

  function mountGiscus(host) {
    var s = document.createElement('script');
    s.src = 'https://giscus.app/client.js';
    s.async = true;
    s.crossOrigin = 'anonymous';
    s.setAttribute('data-repo', REPO);
    s.setAttribute('data-repo-id', REPO_ID);
    s.setAttribute('data-category', CATEGORY);
    s.setAttribute('data-category-id', CATEGORY_ID);
    s.setAttribute('data-mapping', 'pathname');
    s.setAttribute('data-strict', '0');
    s.setAttribute('data-reactions-enabled', '1');
    s.setAttribute('data-emit-metadata', '0');
    s.setAttribute('data-input-position', 'bottom');
    s.setAttribute('data-theme', currentTheme());
    s.setAttribute('data-lang', 'en');
    s.setAttribute('data-loading', 'lazy');
    host.appendChild(s);
  }

  function syncThemeOnToggle() {
    var btn = document.querySelector('.theme-toggle, [data-theme-toggle]');
    if (!btn) return;
    btn.addEventListener('click', function () {
      // Wait a tick for theme.js to flip data-theme.
      setTimeout(function () {
        var iframe = document.querySelector('iframe.giscus-frame');
        if (!iframe || !iframe.contentWindow) return;
        iframe.contentWindow.postMessage(
          { giscus: { setConfig: { theme: currentTheme() } } },
          'https://giscus.app'
        );
      }, 50);
    });
  }

  function init() {
    var article = document.querySelector('.post-content');
    if (!article) return;
    if (document.querySelector('.comments-section')) return;

    var section = document.createElement('section');
    section.className = 'comments-section';
    section.setAttribute('aria-label', 'Comments');

    var heading = document.createElement('h2');
    heading.className = 'comments-heading';
    heading.textContent = 'Comments';
    section.appendChild(heading);

    var blurb = document.createElement('p');
    blurb.className = 'comments-blurb';
    blurb.innerHTML =
      'Sign in with GitHub to leave a comment. Powered by ' +
      '<a href="https://giscus.app" target="_blank" rel="noopener">Giscus</a>.';
    section.appendChild(blurb);

    var host = document.createElement('div');
    host.className = 'comments-host';
    section.appendChild(host);

    var anchor = document.querySelector('.upvote-hint')
      || document.querySelector('.upvote-bar')
      || article;
    anchor.parentNode.insertBefore(section, anchor.nextSibling);

    if (REPO_ID && CATEGORY_ID) {
      mountGiscus(host);
      syncThemeOnToggle();
    } else {
      mountPlaceholder(host);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
