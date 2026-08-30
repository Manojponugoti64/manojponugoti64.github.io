(function () {
  'use strict';

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function linkify(value) {
    var escaped = escapeHtml(value);
    return escaped.replace(/(https?:\/\/[^\s<]+)/g, function (url) {
      var clean = url.replace(/[),.!?;:]+$/, '');
      var suffix = url.slice(clean.length);
      return '<a href="' + clean + '" target="_blank" rel="noopener noreferrer">' + clean + '</a>' + suffix;
    });
  }

  function formatDate(value) {
    var date = new Date(value);
    if (Number.isNaN(date.getTime())) return '';
    return new Intl.DateTimeFormat('en', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    }).format(date);
  }

  function copyIcon() {
    return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="9" y="9" width="11" height="11" rx="2"></rect><path d="M15 9V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h3"></path></svg>';
  }

  function renderNote(note, baseUrl) {
    var id = escapeHtml(note.id || '');
    var permalink = baseUrl + '#' + encodeURIComponent(note.id || '');
    var image = note.image
      ? '<img class="note-image" src="' + escapeHtml(note.image) + '" alt="' + escapeHtml(note.imageAlt || '') + '" loading="lazy" decoding="async">'
      : '';
    return [
      '<article class="note-entry" id="' + id + '">',
      '  <div class="note-meta">',
      '    <a class="note-date" href="' + escapeHtml(permalink) + '">' + escapeHtml(formatDate(note.createdAt)) + '</a>',
      '    <button class="note-copy" type="button" data-note-link="' + escapeHtml(permalink) + '" aria-label="Copy permanent link" title="Copy permanent link">' + copyIcon() + '</button>',
      '  </div>',
      '  <p class="note-body">' + linkify(note.text || '') + '</p>',
      image,
      '</article>'
    ].join('\n');
  }

  function initFeed(feed) {
    var source = feed.dataset.source || 'notes/manifest.json';
    var limit = Number(feed.dataset.limit || 0);
    var baseUrl = feed.dataset.baseUrl || 'notes.html';

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
        if (limit > 0) notes = notes.slice(0, limit);

        if (!notes.length) {
          feed.innerHTML = '<div class="notes-empty">The first note is waiting to be written.</div>';
          return;
        }

        feed.innerHTML = notes.map(function (note) { return renderNote(note, baseUrl); }).join('');
        feed.querySelectorAll('[data-note-link]').forEach(function (button) {
          button.addEventListener('click', function () {
            var absolute = new URL(button.dataset.noteLink, location.href).href;
            navigator.clipboard.writeText(absolute).then(function () {
              button.setAttribute('aria-label', 'Link copied');
              button.title = 'Link copied';
              setTimeout(function () {
                button.setAttribute('aria-label', 'Copy permanent link');
                button.title = 'Copy permanent link';
              }, 1600);
            });
          });
        });

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
