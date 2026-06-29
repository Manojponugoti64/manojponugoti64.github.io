/* Claude-style sidebar: hamburger toggles a left drawer with nav links. */
(function () {
    function ready(fn) {
        if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', fn);
        else fn();
    }

    ready(function () {
        var nav = document.querySelector('header nav');
        if (!nav || nav.dataset.sidebarReady === '1') return;
        nav.dataset.sidebarReady = '1';

        var inlineLinks = nav.querySelector('.nav-links');
        var items = [];
        if (inlineLinks) {
            var anchors = inlineLinks.querySelectorAll('li > a');
            anchors.forEach(function (a) {
                items.push({ href: a.getAttribute('href'), label: a.textContent.trim() });
            });
            inlineLinks.classList.add('nav-links-hidden');
        }

        var btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'menu-toggle';
        btn.setAttribute('aria-label', 'Open menu');
        btn.setAttribute('aria-expanded', 'false');
        btn.innerHTML = '<span></span><span></span><span></span>';
        nav.insertBefore(btn, nav.firstChild);

        var backdrop = document.createElement('div');
        backdrop.className = 'sidebar-backdrop';
        document.body.appendChild(backdrop);

        var aside = document.createElement('aside');
        aside.className = 'sidebar';
        aside.setAttribute('aria-label', 'Site navigation');
        aside.setAttribute('aria-hidden', 'true');

        var prefix = '';
        var path = location.pathname || '/';
        var depth = path.replace(/^\/+|\/+$/g, '').split('/').filter(Boolean);
        if (depth.length >= 1 && !/\.html?$/.test(depth[depth.length - 1]) || (depth.length >= 2)) {
            prefix = '../';
        } else if (depth.length === 1 && /\.html?$/.test(depth[0])) {
            prefix = '';
        }

        var defaults = [
            { href: prefix + 'index.html', label: 'Home' },
            { href: prefix + 'photos.html', label: 'Photos' },
            { href: prefix + 'music.html', label: 'Music' },
            { href: prefix + 'books.html', label: 'Books' },
            { href: prefix + 'archive.html', label: 'Archive' }
        ];
        var navItems = items.length ? items : defaults;
        var hasMusic = navItems.some(function (it) { return (it.label || '').toLowerCase() === 'music'; });
        if (!hasMusic) {
            var insertAt = Math.min(2, navItems.length);
            navItems.splice(insertAt, 0, { href: prefix + 'music.html', label: 'Music' });
        }

        var html = '';
        html += '<div class="sidebar-header">';
        html += '<span class="sidebar-title">Manoj\'s Blog</span>';
        html += '<button type="button" class="sidebar-close" aria-label="Close menu">&times;</button>';
        html += '</div>';
        html += '<nav class="sidebar-nav"><ul>';
        for (var i = 0; i < navItems.length; i++) {
            var it = navItems[i];
            html += '<li><a href="' + it.href + '">' + it.label + '</a></li>';
        }
        html += '</ul></nav>';
        html += '<div class="sidebar-books">';
        html += '<span class="sidebar-books-label">Currently Reading</span>';
        html += '<div class="sidebar-book-item">';
        html += '<span class="sidebar-book-title">Team of Rivals</span>';
        html += '<span class="sidebar-book-author">Doris Kearns Goodwin &mdash; on Abraham Lincoln</span>';
        html += '</div>';
        html += '</div>';
        html += '<div class="sidebar-footer">';
        html += '<button type="button" class="sidebar-theme" aria-label="Toggle dark and light mode"><span class="sidebar-theme-icon">\u263E</span><span class="sidebar-theme-label">Dark mode</span></button>';
        html += '</div>';
        aside.innerHTML = html;
        document.body.appendChild(aside);

        function open() {
            aside.classList.add('is-open');
            backdrop.classList.add('is-open');
            btn.classList.add('is-open');
            btn.setAttribute('aria-expanded', 'true');
            aside.setAttribute('aria-hidden', 'false');
            document.body.classList.add('sidebar-open');
        }
        function close() {
            aside.classList.remove('is-open');
            backdrop.classList.remove('is-open');
            btn.classList.remove('is-open');
            btn.setAttribute('aria-expanded', 'false');
            aside.setAttribute('aria-hidden', 'true');
            document.body.classList.remove('sidebar-open');
        }
        function toggle() {
            if (aside.classList.contains('is-open')) close(); else open();
        }

        btn.addEventListener('click', toggle);
        backdrop.addEventListener('click', close);
        var closeBtn = aside.querySelector('.sidebar-close');
        if (closeBtn) closeBtn.addEventListener('click', close);
        document.addEventListener('keydown', function (e) {
            if (e.key === 'Escape') close();
        });

        var themeBtn = aside.querySelector('.sidebar-theme');
        var themeIcon = aside.querySelector('.sidebar-theme-icon');
        var themeLabel = aside.querySelector('.sidebar-theme-label');
        function refreshThemeUI() {
            var cur = document.documentElement.dataset.theme || 'dark';
            if (themeIcon) themeIcon.textContent = cur === 'light' ? '\u2600' : '\u263E';
            if (themeLabel) themeLabel.textContent = cur === 'light' ? 'Light mode' : 'Dark mode';
        }
        refreshThemeUI();
        if (themeBtn) {
            themeBtn.addEventListener('click', function () {
                var cur = document.documentElement.dataset.theme || 'dark';
                var next = cur === 'light' ? 'dark' : 'light';
                document.documentElement.dataset.theme = next;
                try { localStorage.setItem('blog-theme', next); } catch (e) {}
                refreshThemeUI();
            });
        }
    });
})();

(function () {
    function ready(fn) {
        if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', fn);
        else fn();
    }

    function isHomePage() {
        var path = location.pathname.replace(/\/+$/, '');
        return path === '' || path === '/index.html' || /\/manojponugoti64\.github\.io\/index\.html$/.test(path);
    }

    ready(function () {
        if (!isHomePage()) return;
        var main = document.querySelector('main');
        if (!main || document.querySelector('.photo-of-day-landing')) return;

        var style = document.createElement('style');
        style.id = 'photo-of-day-landing-style';
        style.textContent = [
            '.photo-of-day-landing {',
            '  position: relative;',
            '  display: block;',
            '  width: 100%;',
            '  aspect-ratio: 16 / 8;',
            '  min-height: min(72vh, 600px);',
            '  overflow: hidden;',
            '  margin: 0 0 3rem;',
            '  border-radius: 20px;',
            '  box-shadow: 0 30px 80px rgba(0, 0, 0, 0.22);',
            '  background: var(--bg-secondary, #2d2d2d);',
            '}',
            '.pod-live-frame { position: absolute; inset: 0; overflow: hidden; }',
            '.pod-live-photo { width: 100%; height: 100%; object-fit: cover; display: block; opacity: 0; transform: scale(1.01); transition: transform 8s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.6s ease; will-change: transform; }',
            '.pod-live-photo.is-loaded { opacity: 1; }',
            '.photo-of-day-landing:hover .pod-live-photo.is-loaded { transform: scale(1.08); }',
            '[data-theme="dark"] .pod-live-photo, :root:not([data-theme="light"]) .pod-live-photo { filter: brightness(0.9) saturate(1.02); }',
            // Bottom gradient so the caption stays legible over any photo.
            '.pod-live-scrim { position: absolute; left: 0; right: 0; bottom: 0; padding: 2.4rem 1.6rem 1.4rem; background: linear-gradient(to top, rgba(0,0,0,0.62), rgba(0,0,0,0.18) 60%, transparent); pointer-events: none; }',
            '.pod-live-badge { display: inline-block; padding: 0.3rem 0.7rem; border-radius: 999px; font-size: 0.68rem; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; color: #fff; background: rgba(232,112,64,0.92); }',
            '.pod-live-caption { margin: 0.6rem 0 0; color: #fff; font-size: 1.12rem; line-height: 1.45; max-width: 40rem; text-shadow: 0 1px 6px rgba(0,0,0,0.4); }',
            '.pod-live-date { margin: 0.15rem 0 0; color: rgba(255,255,255,0.82); font-size: 0.82rem; font-weight: 600; text-shadow: 0 1px 6px rgba(0,0,0,0.4); }',
            '@media (max-width: 760px) {',
            '  .photo-of-day-landing { aspect-ratio: 4 / 5; min-height: auto; border-radius: 16px; margin-bottom: 2rem; }',
            '  .pod-live-caption { font-size: 1rem; }',
            '}'
        ].join('\n');
        document.head.appendChild(style);

        var hero = document.createElement('section');
        hero.className = 'photo-of-day-landing';
        hero.setAttribute('aria-label', 'Photo of the day');

        var frame = document.createElement('div');
        frame.className = 'pod-live-frame';

        var photo = document.createElement('img');
        photo.className = 'pod-live-photo';
        photo.loading = 'eager';
        photo.decoding = 'async';

        var scrim = document.createElement('div');
        scrim.className = 'pod-live-scrim';
        var badge = document.createElement('span');
        badge.className = 'pod-live-badge';
        badge.textContent = 'Photo of the day';
        var caption = document.createElement('p');
        caption.className = 'pod-live-caption';
        var dateLine = document.createElement('p');
        dateLine.className = 'pod-live-date';

        scrim.appendChild(badge);
        scrim.appendChild(caption);
        scrim.appendChild(dateLine);
        frame.appendChild(photo);
        hero.appendChild(frame);
        hero.appendChild(scrim);
        main.insertBefore(hero, main.firstElementChild);

        // Whole-day index in the viewer's local timezone, so the photo changes
        // once at local midnight and stays put for the rest of the day.
        var now = new Date();
        var dayNumber = Math.floor(
            (now - new Date(now.getFullYear(), 0, 0)) / 86400000
        ) + now.getFullYear() * 366;
        dateLine.textContent = now.toLocaleDateString(undefined, {
            weekday: 'long', month: 'long', day: 'numeric'
        });

        function show(photos, index, attemptsLeft) {
            if (!photos.length || attemptsLeft < 0) return;
            var p = photos[index % photos.length];
            photo.onload = function () {
                photo.classList.add('is-loaded');
                caption.textContent = p.caption || '';
            };
            // Skip gracefully if a file is missing so the hero never breaks.
            photo.onerror = function () {
                show(photos, index + 1, attemptsLeft - 1);
            };
            photo.alt = p.caption || 'Photo of the day';
            photo.src = p.src + '?cb=' + dayNumber;
        }

        fetch('gallery/manifest.json?cb=' + dayNumber)
            .then(function (r) {
                if (!r.ok) throw new Error('manifest ' + r.status);
                return r.json();
            })
            .then(function (data) {
                var photos = (data && data.photos) || [];
                if (!photos.length) { hero.parentNode.removeChild(hero); return; }
                show(photos, dayNumber, photos.length);
            })
            .catch(function (err) { console.error(err); });
    });
})();
