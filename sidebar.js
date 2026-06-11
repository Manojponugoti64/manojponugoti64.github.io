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
            '  min-height: min(78vh, 640px);',
            '  display: grid;',
            '  grid-template-columns: minmax(0, 1.05fr) minmax(280px, 0.95fr);',
            '  gap: clamp(1.5rem, 5vw, 4rem);',
            '  align-items: center;',
            '  overflow: hidden;',
            '  margin: 0 0 2.5rem;',
            '  padding: clamp(2.25rem, 6vw, 5rem);',
            '  border: 1px solid rgba(216, 90, 48, 0.35);',
            '  border-radius: 8px;',
            '  box-shadow: 0 26px 70px rgba(0, 0, 0, 0.18);',
            '}',
            '.boug-live-copy { position: relative; z-index: 2; max-width: 560px; }',
            '.boug-live-eyebrow { margin: 0 0 0.85rem; color: #2f766f; font-family: Georgia, serif; font-size: 0.9rem; font-weight: 700; text-transform: uppercase; }',
            '[data-theme="dark"] .boug-live-eyebrow, :root:not([data-theme="light"]) .boug-live-eyebrow { color: #87c9bd; }',
            '.bougainvillea-landing-live h1 { margin: 0; color: var(--accent); font-size: clamp(3.1rem, 9vw, 6.4rem); line-height: 0.92; letter-spacing: 0; text-align: left; }',
            '.bougainvillea-landing-live h1 span { display: block; color: var(--text-primary); }',
            '.boug-live-text { max-width: 500px; margin: 1.25rem 0 0; color: var(--text-secondary); font-size: clamp(1.08rem, 2.2vw, 1.28rem); line-height: 1.55; }',
            '.boug-live-actions { display: flex; flex-wrap: wrap; gap: 0.75rem; margin-top: 2rem; }',
            '.boug-live-actions a { display: inline-flex; align-items: center; justify-content: center; min-height: 44px; padding: 0.8rem 1.1rem; border-radius: 8px; border: 1px solid rgba(216, 90, 48, 0.38); font-weight: 700; }',
            '.boug-live-actions a:first-child { background: var(--accent); color: #fff; }',
            '.boug-live-actions a:last-child { color: var(--accent); background: rgba(255, 255, 255, 0.12); }',
            '.boug-live-garden { position: relative; z-index: 1; min-height: 360px; display: flex; align-items: center; justify-content: center; overflow: hidden; border-radius: 12px; box-shadow: 0 16px 40px rgba(0, 0, 0, 0.15); }',
            '.boug-live-photo { width: 100%; height: 100%; object-fit: cover; border-radius: 12px; transition: transform 0.6s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.4s ease; opacity: 0.95; }',
            '.bougainvillea-landing-live:hover .boug-live-photo { transform: scale(1.04); }',
            '[data-theme="dark"] .boug-live-photo, :root:not([data-theme="light"]) .boug-live-photo { opacity: 0.8; filter: brightness(0.8) saturate(0.95); }',
            '@media (max-width: 760px) {',
            '  .bougainvillea-landing-live { grid-template-columns: 1fr; min-height: auto; padding: 2rem 1.35rem; }',
            '  .boug-live-garden { min-height: 280px; }',
            '  .boug-live-actions a { flex: 1 1 150px; }',
            '}'
        ].join('\n');
        document.head.appendChild(style);

        var hero = document.createElement('section');
        hero.className = 'bougainvillea-landing-live';
        hero.setAttribute('aria-label', 'Bougainvillea landing feature');
        hero.innerHTML = [
            '<div class="boug-live-copy">',
            '  <p class="boug-live-eyebrow">Blooming now</p>',
            '  <h1>Manoj\'s <span>Blog</span></h1>',
            '  <p class="boug-live-text">Photographs, music, essays, and small bright thoughts framed with a bougainvillea garden glow.</p>',
            '  <div class="boug-live-actions"><a href="#writing">Read writing</a><a href="photos.html">View photos</a></div>',
            '</div>',
            '<div class="boug-live-garden" aria-hidden="true">',
            '  <img class="boug-live-photo" src="images/bougainvillea-real.jpg" alt="Vibrant Bougainvillea blossoms in full bloom">',
            '</div>'
        ].join('');
        main.insertBefore(hero, main.firstElementChild);
    });
})();
