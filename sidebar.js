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
        if (!main || document.querySelector('.bougainvillea-landing-live')) return;

        var style = document.createElement('style');
        style.id = 'bougainvillea-landing-live-style';
        style.textContent = [
            '.bougainvillea-landing-live {',
            '  position: relative;',
            '  display: block;',
            '  width: 100%;',
            '  aspect-ratio: 16 / 8;',
            '  min-height: min(72vh, 600px);',
            '  overflow: hidden;',
            '  margin: 0 0 3rem;',
            '  border-radius: 20px;',
            '  box-shadow: 0 30px 80px rgba(0, 0, 0, 0.22);',
            '}',
            '.boug-live-garden { position: absolute; inset: 0; overflow: hidden; }',
            '.boug-live-photo { width: 100%; height: 100%; object-fit: cover; display: block; transform: scale(1.01); transition: transform 8s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.4s ease; will-change: transform; }',
            '.bougainvillea-landing-live:hover .boug-live-photo { transform: scale(1.08); }',
            '.boug-live-garden::after { content: none; }',
            '[data-theme="dark"] .boug-live-photo, :root:not([data-theme="light"]) .boug-live-photo { opacity: 0.92; filter: brightness(0.86) saturate(1.02); }',
            '[data-theme="dark"] .boug-live-garden::after, :root:not([data-theme="light"]) .boug-live-garden::after { background: none; }',
            '@media (max-width: 760px) {',
            '  .bougainvillea-landing-live { aspect-ratio: 4 / 5; min-height: auto; border-radius: 16px; margin-bottom: 2rem; }',
            '}'
        ].join('\n');
        document.head.appendChild(style);

        var hero = document.createElement('section');
        hero.className = 'bougainvillea-landing-live';
        hero.setAttribute('aria-label', 'DavidSHolz landing quote');

        var garden = document.createElement('div');
        garden.className = 'boug-live-garden';

        var photo = document.createElement('img');
        photo.className = 'boug-live-photo';
        photo.src = 'images/bougainvillea-real.jpg';
        photo.alt = 'Vibrant bougainvillea blossoms in full bloom';
        photo.loading = 'eager';
        photo.decoding = 'async';

        garden.appendChild(photo);
        hero.appendChild(garden);
        main.insertBefore(hero, main.firstElementChild);
    });
})();
