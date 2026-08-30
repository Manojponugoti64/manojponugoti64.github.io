(function () {
  'use strict';

  /* Identity shown on every note. Change it here and it updates everywhere. */
  var AUTHOR = {
    name: 'Manoj Ponugoti',
    handle: 'younghoax20',
    profileUrl: 'https://x.com/younghoax20',
    avatar: '',
    bio: 'Essays, photographs, and small bright pieces. Short notes live here.'
  };

  var LIKE_KEY = 'notes-liked';

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  /* URLs, @mentions and #hashtags, the way a timeline renders them. */
  function linkify(value) {
    var out = escapeHtml(value);
    out = out.replace(/(https?:\/\/[^\s<]+)/g, function (url) {
      var clean = url.replace(/[),.!?;:]+$/, '');
      var suffix = url.slice(clean.length);
      var shown = clean.replace(/^https?:\/\//, '').replace(/\/$/, '');
      return '<a href="' + clean + '" target="_blank" rel="noopener noreferrer">' + shown + '</a>' + suffix;
    });
    out = out.replace(/(^|[\s(])@([A-Za-z0-9_]{1,15})\b/g, function (all, pre, handle) {
      return pre + '<a href="https://x.com/' + handle + '" target="_blank" rel="noopener noreferrer">@' + handle + '</a>';
    });
    out = out.replace(/(^|[\s(])#([A-Za-z][A-Za-z0-9_]*)/g, function (all, pre, tag) {
      return pre + '<a href="https://x.com/hashtag/' + tag + '" target="_blank" rel="noopener noreferrer">#' + tag + '</a>';
    });
    return out;
  }

  /* "now", "14m", "3h", "5d", then a date — same ladder a timeline uses. */
  function relativeTime(value) {
    var date = new Date(value);
    if (Number.isNaN(date.getTime())) return '';
    var secs = Math.floor((Date.now() - date.getTime()) / 1000);
    if (secs < 45) return 'now';
    if (secs < 3600) return Math.floor(secs / 60) + 'm';
    if (secs < 86400) return Math.floor(secs / 3600) + 'h';
    if (secs < 604800) return Math.floor(secs / 86400) + 'd';
    var sameYear = date.getFullYear() === new Date().getFullYear();
    return new Intl.DateTimeFormat('en', sameYear
      ? { day: 'numeric', month: 'short' }
      : { day: 'numeric', month: 'short', year: 'numeric' }).format(date);
  }

  function fullDate(value) {
    var date = new Date(value);
    if (Number.isNaN(date.getTime())) return '';
    return new Intl.DateTimeFormat('en', {
      hour: 'numeric', minute: '2-digit',
      day: 'numeric', month: 'long', year: 'numeric'
    }).format(date);
  }

  var ICONS = {
    heart: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 21s-7.5-4.6-9.6-9A5.4 5.4 0 0 1 12 6.2a5.4 5.4 0 0 1 9.6 5.8c-2.1 4.4-9.6 9-9.6 9z"/></svg>',
    link: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M10 13a5 5 0 0 0 7.5.5l2-2A5 5 0 0 0 12.5 4.5l-1.1 1.1"/><path d="M14 11a5 5 0 0 0-7.5-.5l-2 2A5 5 0 0 0 11.5 19.5l1.1-1.1"/></svg>',
    x: '<svg viewBox="0 0 24 24" aria-hidden="true" class="icon-solid"><path d="M18.24 2.25h3.31l-7.23 8.26 8.5 11.24h-6.66l-5.21-6.82-5.97 6.82H1.67l7.73-8.84L1.25 2.25h6.83l4.71 6.23zm-1.16 17.52h1.83L7.08 4.13H5.12z"/></svg>',
    reply: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M21 11.5a8.4 8.4 0 0 1-9 8.4 9 9 0 0 1-3.9-.9L3 20.5l1.6-4.4A8.3 8.3 0 0 1 3.5 11.5a8.4 8.4 0 0 1 9-8.4 8.4 8.4 0 0 1 8.5 8.4z"/></svg>'
  };

  function likedSet() {
    try { return new Set(JSON.parse(localStorage.getItem(LIKE_KEY) || '[]')); }
    catch (e) { return new Set(); }
  }

  function saveLiked(set) {
    try { localStorage.setItem(LIKE_KEY, JSON.stringify(Array.from(set))); } catch (e) {}
  }

  function avatarMarkup() {
    if (AUTHOR.avatar) {
      return '<img class="note-avatar" src="' + escapeHtml(AUTHOR.avatar) + '" alt="' + escapeHtml(AUTHOR.name) + '" loading="lazy" decoding="async">';
    }
    var initial = escapeHtml((AUTHOR.name || 'M').trim().charAt(0).toUpperCase());
    return '<span class="note-avatar note-avatar--monogram" aria-hidden="true">' + initial + '</span>';
  }

  function renderNote(note, baseUrl, liked) {
    var id = escapeHtml(note.id || '');
    var permalink = baseUrl + '#' + encodeURIComponent(note.id || '');
    var isLiked = liked.has(note.id);
    var image = note.image
      ? '<img class="note-image" src="' + escapeHtml(note.image) + '" alt="' + escapeHtml(note.imageAlt || '') + '" loading="lazy" decoding="async">'
      : '';
    var shareText = encodeURIComponent(String(note.text || '').slice(0, 180));

    return [
      '<article class="note-entry" id="' + id + '">',
      '  <a class="note-avatar-link" href="' + escapeHtml(AUTHOR.profileUrl) + '" target="_blank" rel="noopener noreferrer" tabindex="-1" aria-hidden="true">' + avatarMarkup() + '</a>',
      '  <div class="note-main">',
      '    <div class="note-head">',
      '      <span class="note-name">' + escapeHtml(AUTHOR.name) + '</span>',
      '      <span class="note-handle">@' + escapeHtml(AUTHOR.handle) + '</span>',
      '      <span class="note-dot" aria-hidden="true">·</span>',
      '      <a class="note-time" href="' + escapeHtml(permalink) + '" title="' + escapeHtml(fullDate(note.createdAt)) + '">' + escapeHtml(relativeTime(note.createdAt)) + '</a>',
      '    </div>',
      '    <p class="note-body">' + linkify(note.text || '') + '</p>',
      image,
      '    <div class="note-actions">',
      '      <button class="note-action note-action--like' + (isLiked ? ' is-active' : '') + '" type="button" data-note-like="' + id + '" aria-pressed="' + (isLiked ? 'true' : 'false') + '" aria-label="Like this note">' + ICONS.heart + '</button>',
      '      <button class="note-action note-action--link" type="button" data-note-link="' + escapeHtml(permalink) + '" aria-label="Copy link to this note" title="Copy link">' + ICONS.link + '</button>',
      '      <a class="note-action note-action--share" href="https://x.com/intent/post?text=' + shareText + '" target="_blank" rel="noopener noreferrer" aria-label="Share this note on X" title="Share on X">' + ICONS.x + '</a>',
      '    </div>',
      '  </div>',
      '</article>'
    ].join('\n');
  }

  function renderProfile(host, count) {
    host.innerHTML = [
      '<div class="notes-profile">',
      '  <a class="notes-profile-avatar" href="' + escapeHtml(AUTHOR.profileUrl) + '" target="_blank" rel="noopener noreferrer">' + avatarMarkup() + '</a>',
      '  <div class="notes-profile-id">',
      '    <span class="notes-profile-name">' + escapeHtml(AUTHOR.name) + '</span>',
      '    <a class="notes-profile-handle" href="' + escapeHtml(AUTHOR.profileUrl) + '" target="_blank" rel="noopener noreferrer">@' + escapeHtml(AUTHOR.handle) + '</a>',
      '    <p class="notes-profile-bio">' + escapeHtml(AUTHOR.bio) + '</p>',
      '    <span class="notes-profile-count">' + count + (count === 1 ? ' note' : ' notes') + '</span>',
      '  </div>',
      '</div>'
    ].join('\n');
  }

  function wireActions(feed) {
    feed.querySelectorAll('[data-note-link]').forEach(function (button) {
      button.addEventListener('click', function () {
        var absolute = new URL(button.dataset.noteLink, location.href).href;
        var done = function () {
          button.classList.add('is-copied');
          button.title = 'Link copied';
          setTimeout(function () {
            button.classList.remove('is-copied');
            button.title = 'Copy link';
          }, 1600);
        };
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(absolute).then(done, function () {});
        }
      });
    });

    feed.querySelectorAll('[data-note-like]').forEach(function (button) {
      button.addEventListener('click', function () {
        var set = likedSet();
        var id = button.dataset.noteLike;
        if (set.has(id)) { set.delete(id); } else { set.add(id); button.classList.add('just-liked'); }
        saveLiked(set);
        var on = set.has(id);
        button.classList.toggle('is-active', on);
        button.setAttribute('aria-pressed', on ? 'true' : 'false');
        setTimeout(function () { button.classList.remove('just-liked'); }, 400);
      });
    });
  }

  function initFeed(feed) {
    var source = feed.dataset.source || 'notes/manifest.json';
    var limit = Number(feed.dataset.limit || 0);
    var baseUrl = feed.dataset.baseUrl || 'notes.html';
    var profileHost = document.querySelector('[data-notes-profile]');

    fetch(source + '?cb=' + Date.now())
      .then(function (response) {
        if (!response.ok) throw new Error('Could not load notes');
        return response.json();
      })
      .then(function (data) {
        var notes = Array.isArray(data.notes) ? data.notes.slice() : [];
        notes.sort(function (a, b) {
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        });

        if (profileHost) renderProfile(profileHost, notes.length);
        if (limit > 0) notes = notes.slice(0, limit);

        if (!notes.length) {
          feed.innerHTML = '<div class="notes-empty">The first note is waiting to be written.</div>';
          return;
        }

        var liked = likedSet();
        feed.innerHTML = notes.map(function (note) { return renderNote(note, baseUrl, liked); }).join('');
        wireActions(feed);

        var targetId = decodeURIComponent(location.hash.slice(1));
        if (targetId) {
          var target = document.getElementById(targetId);
          if (target) {
            target.classList.add('is-targeted');
            setTimeout(function () { target.scrollIntoView({ block: 'center' }); }, 50);
          }
        }
      })
      .catch(function () {
        feed.innerHTML = '<div class="notes-error">Notes could not be loaded. Please try again.</div>';
      });
  }

  document.addEventListener('DOMContentLoaded', function () {
    document.querySelectorAll('[data-notes-feed]').forEach(initFeed);
  });
})();
