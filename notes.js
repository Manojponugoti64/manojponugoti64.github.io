(function () {
  'use strict';

  /* Identity shown on every note. Change it here and it updates everywhere. */
  var AUTHOR = {
    name: 'Manoj Ponugoti',
    handle: 'younghoax20',
    profileUrl: 'https://x.com/younghoax20',
    avatar: ''
  };

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

  function avatarMarkup() {
    if (AUTHOR.avatar) {
      return '<img class="note-avatar" src="' + escapeHtml(AUTHOR.avatar) + '" alt="' + escapeHtml(AUTHOR.name) + '" loading="lazy" decoding="async">';
    }
    var initial = escapeHtml((AUTHOR.name || 'M').trim().charAt(0).toUpperCase());
    return '<span class="note-avatar note-avatar--monogram" aria-hidden="true">' + initial + '</span>';
  }

  function renderNote(note, baseUrl) {
    var id = escapeHtml(note.id || '');
    var permalink = baseUrl + '#' + encodeURIComponent(note.id || '');
    var image = note.image
      ? '<img class="note-image" src="' + escapeHtml(note.image) + '" alt="' + escapeHtml(note.imageAlt || '') + '" loading="lazy" decoding="async">'
      : '';

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
      '    <span class="notes-profile-count">' + count + (count === 1 ? ' note' : ' notes') + '</span>',
      '  </div>',
      '</div>'
    ].join('\n');
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

        feed.innerHTML = notes.map(function (note) { return renderNote(note, baseUrl); }).join('');

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
