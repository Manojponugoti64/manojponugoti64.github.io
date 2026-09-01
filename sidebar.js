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
            { href: prefix + 'notes.html', label: 'Notes' },
            { href: prefix + 'photos.html', label: 'Photos' },
            { href: prefix + 'videos.html', label: 'Videos' },
            { href: prefix + 'music.html', label: 'Music' },
            { href: prefix + 'books.html', label: 'Books' },
            { href: prefix + 'archive.html', label: 'Archive' }
        ];
        var navItems = items.length ? items : defaults;
        var hasNotes = navItems.some(function (it) { return (it.label || '').toLowerCase() === 'notes'; });
        if (!hasNotes) {
            var notesInsertAt = Math.min(1, navItems.length);
            navItems.splice(notesInsertAt, 0, { href: prefix + 'notes.html', label: 'Notes' });
        }
        var hasVideos = navItems.some(function (it) { return (it.label || '').toLowerCase() === 'videos'; });
        if (!hasVideos) {
            var videoInsertAt = Math.min(2, navItems.length);
            navItems.splice(videoInsertAt, 0, { href: prefix + 'videos.html', label: 'Videos' });
        }
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
            var ext = /^https?:\/\//.test(it.href) ? ' target="_blank" rel="noopener"' : '';
            html += '<li><a href="' + it.href + '"' + ext + '>' + it.label + '</a></li>';
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

    ready(function () {
        var social = document.querySelector('.footer-social');
        if (!social || social.querySelector('[data-social="substack"]')) return;

        var link = document.createElement('a');
        link.href = 'https://manojkumar520199.substack.com';
        link.className = 'social-link social-link--icon-only';
        link.target = '_blank';
        link.rel = 'noopener noreferrer';
        link.dataset.social = 'substack';
        link.setAttribute('aria-label', 'Manoj on Substack');
        link.title = 'Substack';
        link.innerHTML = '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M22.539 8.242H1.46V5.406h21.08v2.836ZM1.46 10.812v13.617L12 18.51l10.539 5.918V10.812H1.46ZM22.539 0H1.46v2.836h21.08V0Z"/></svg>';

        var firstTextLink = social.querySelector('.social-link:not(.social-link--icon-only)');
        social.insertBefore(link, firstTextLink || null);
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
        if (!main || document.querySelector('.landing-hero')) return;

        var HERO_FALLBACK = {
            src: 'gallery/1782100000000-bougainvillea-arch.jpg',
            caption: 'A cascading arch of white bougainvillea framing a soft twilight sky.'
        };
        var now = new Date();
        var dayNumber = Math.floor(Date.UTC(
            now.getFullYear(), now.getMonth(), now.getDate()
        ) / 86400000);

        var style = document.createElement('style');
        style.id = 'landing-hero-style';
        style.textContent = [
            /* Editorial plate: the frame takes the photo's own proportions, */
            /* so nothing is cropped and no letterbox bars appear.          */
            '.landing-hero-figure { position: relative; left: 50%; transform: translateX(-50%); margin: 0 0 3.2rem; width: -moz-fit-content; width: fit-content; max-width: min(calc(100vw - 2.5rem), 1120px); }',
            '.landing-hero {',
            '  position: relative;',
            '  display: flex;',
            '  justify-content: center;',
            '  margin: 0;',
            '  overflow: hidden;',
            '  box-shadow: 0 18px 46px rgba(0, 0, 0, 0.16);',
            '}',
            '.landing-hero-photo { display: block; max-width: 100%; max-height: min(82vh, 840px); width: auto; height: auto; opacity: 0; transition: opacity 0.6s ease; }',
            '.landing-hero-photo.is-loaded { opacity: 1; }',
            '[data-theme="dark"] .landing-hero-photo { filter: brightness(0.92) saturate(1.02); }',
            '[data-theme="dark"] .landing-hero { box-shadow: 0 18px 46px rgba(0, 0, 0, 0.5); }',
            '@media (max-width: 760px) {',
            '  .landing-hero-figure { margin-bottom: 2.2rem; }',
            '  .landing-hero-photo { max-height: 72vh; }',
            '}'
        ].join('\n');
        document.head.appendChild(style);

        var hero = document.createElement('section');
        hero.className = 'landing-hero';
        hero.setAttribute('aria-label', 'Photo of the day');
        hero.dataset.photoDay = String(dayNumber);

        var photo = document.createElement('img');
        photo.className = 'landing-hero-photo';
        photo.loading = 'eager';
        photo.decoding = 'async';
        photo.setAttribute('fetchpriority', 'high');

        hero.appendChild(photo);

        // Photo only — no visible caption. The description still rides on the
        // img alt attribute for screen readers and when the image fails to load.
        var heroFigure = document.createElement('figure');
        heroFigure.className = 'landing-hero-figure';
        heroFigure.appendChild(hero);
        main.insertBefore(heroFigure, main.firstElementChild);

        function showDailyPhoto(photos, index, attemptsLeft) {
            if (!photos.length || attemptsLeft < 1) {
                if (photo.src.indexOf(HERO_FALLBACK.src) === -1) {
                    showDailyPhoto([HERO_FALLBACK], 0, 1);
                }
                return;
            }

            var selected = photos[index % photos.length];
            photo.classList.remove('is-loaded');
            photo.onload = function () {
                hero.dataset.photoSrc = selected.src;
                photo.classList.add('is-loaded');
            };
            photo.onerror = function () {
                showDailyPhoto(photos, index + 1, attemptsLeft - 1);
            };
            photo.alt = selected.caption || 'Photo of the day';
            photo.src = selected.src + '?hero-day=' + dayNumber;
        }

        fetch('gallery/manifest.json?hero-day=' + dayNumber)
            .then(function (response) {
                if (!response.ok) throw new Error('manifest ' + response.status);
                return response.json();
            })
            .then(function (data) {
                var photos = ((data && data.photos) || []).filter(function (item) {
                    return item && typeof item.src === 'string' && item.src;
                });
                if (!photos.length) photos = [HERO_FALLBACK];
                showDailyPhoto(photos, dayNumber % photos.length, photos.length);
            })
            .catch(function () {
                showDailyPhoto([HERO_FALLBACK], 0, 1);
            });

        var nextMidnight = new Date(
            now.getFullYear(), now.getMonth(), now.getDate() + 1
        );
        window.setTimeout(function () {
            location.reload();
        }, nextMidnight.getTime() - now.getTime() + 1000);
    });
})();
