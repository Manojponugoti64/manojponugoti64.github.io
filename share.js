/* share.js
 *
 * Injects a small share row above the upvote bar on any page that has
 * a `.post-content` article. Three actions:
 *   - Twitter / X
 *   - WhatsApp
 *   - Copy link (with a brief "Copied!" confirmation)
 *
 * Uses the canonical absolute URL of the current page, falling back to
 * `location.href` if no <link rel="canonical"> is set.
 */
(function () {
  function pageUrl() {
    var canon = document.querySelector('link[rel="canonical"]');
    if (canon && canon.href) return canon.href;
    return location.href;
  }

  function pageTitle() {
    var ogTitle = document.querySelector('meta[property="og:title"]');
    if (ogTitle && ogTitle.content) return ogTitle.content;
    var h1 = document.querySelector('.post-content h1');
    if (h1) return h1.textContent.trim();
    return document.title;
  }

  function makeBtn(label, ariaLabel, svgPath, onClick) {
    var btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'share-btn';
    btn.setAttribute('aria-label', ariaLabel);
    btn.innerHTML =
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" '
      + 'stroke="currentColor" stroke-width="1.8" stroke-linecap="round" '
      + 'stroke-linejoin="round" aria-hidden="true">' + svgPath + '</svg>'
      + '<span class="share-btn-label">' + label + '</span>';
    btn.addEventListener('click', onClick);
    return btn;
  }

  function init() {
    var article = document.querySelector('.post-content');
    if (!article) return;
    if (document.querySelector('.share-bar')) return;

    var url = pageUrl();
    var title = pageTitle();

    var bar = document.createElement('div');
    bar.className = 'share-bar';
    bar.setAttribute('role', 'group');
    bar.setAttribute('aria-label', 'Share this post');

    var label = document.createElement('span');
    label.className = 'share-bar-label';
    label.textContent = 'Share';
    bar.appendChild(label);

    // X / Twitter
    bar.appendChild(makeBtn(
      'X',
      'Share on X',
      '<path d="M18 4l-12 16M6 4l12 16"/>',
      function () {
        var u = 'https://twitter.com/intent/tweet'
          + '?text=' + encodeURIComponent(title)
          + '&url=' + encodeURIComponent(url);
        window.open(u, '_blank', 'noopener,noreferrer');
      }
    ));

    // WhatsApp
    bar.appendChild(makeBtn(
      'WhatsApp',
      'Share on WhatsApp',
      '<path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/>',
      function () {
        var u = 'https://wa.me/?text=' + encodeURIComponent(title + ' ' + url);
        window.open(u, '_blank', 'noopener,noreferrer');
      }
    ));

    // Copy link
    var copyBtn = makeBtn(
      'Copy link',
      'Copy link to clipboard',
      '<path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>',
      function () {
        var done = function () {
          var lbl = copyBtn.querySelector('.share-btn-label');
          if (!lbl) return;
          var prev = lbl.textContent;
          lbl.textContent = 'Copied!';
          copyBtn.classList.add('is-copied');
          setTimeout(function () {
            lbl.textContent = prev;
            copyBtn.classList.remove('is-copied');
          }, 1600);
        };
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(url).then(done).catch(function () {
            window.prompt('Copy this link:', url);
          });
        } else {
          window.prompt('Copy this link:', url);
        }
      }
    );
    bar.appendChild(copyBtn);

    var upvote = document.querySelector('.upvote-bar');
    if (upvote && upvote.parentNode) {
      upvote.parentNode.insertBefore(bar, upvote);
    } else {
      article.parentNode.insertBefore(bar, article.nextSibling);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
