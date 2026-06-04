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
            '  background: radial-gradient(circle at 78% 18%, rgba(216, 77, 138, 0.24), transparent 17rem), radial-gradient(circle at 12% 22%, rgba(47, 118, 111, 0.22), transparent 15rem), linear-gradient(135deg, rgba(255, 249, 242, 0.98), rgba(248, 229, 221, 0.95) 54%, rgba(30, 42, 38, 0.18));',
            '  box-shadow: 0 26px 70px rgba(0, 0, 0, 0.18);',
            '}',
            '[data-theme="dark"] .bougainvillea-landing-live, :root:not([data-theme="light"]) .bougainvillea-landing-live {',
            '  background: radial-gradient(circle at 78% 18%, rgba(216, 77, 138, 0.26), transparent 17rem), radial-gradient(circle at 12% 22%, rgba(47, 118, 111, 0.22), transparent 15rem), linear-gradient(135deg, rgba(44, 32, 34, 0.96), rgba(34, 30, 28, 0.96) 54%, rgba(20, 33, 31, 0.95));',
            '}',
            '.boug-live-copy { position: relative; z-index: 2; max-width: 560px; }',
            '.boug-live-eyebrow { margin: 0 0 0.85rem; color: #2f766f; font-family: Georgia, serif; font-size: 0.9rem; font-weight: 700; text-transform: uppercase; }',
            '[data-theme="dark"] .boug-live-eyebrow, :root:not([data-theme="light"]) .boug-live-eyebrow { color: #87c9bd; }',
            '.bougainvillea-landing-live h1 { margin: 0; color: var(--accent); font-size: clamp(3.1rem, 9vw, 6.4rem); line-height: 0.92; letter-spacing: 0; text-align: left; }',
            '.bougainvillea-landing-live h1 span { display: block; color: #d44d8a; }',
            '.boug-live-text { max-width: 500px; margin: 1.25rem 0 0; color: var(--text-secondary); font-size: clamp(1.08rem, 2.2vw, 1.28rem); line-height: 1.55; }',
            '.boug-live-actions { display: flex; flex-wrap: wrap; gap: 0.75rem; margin-top: 2rem; }',
            '.boug-live-actions a { display: inline-flex; align-items: center; justify-content: center; min-height: 44px; padding: 0.8rem 1.1rem; border-radius: 8px; border: 1px solid rgba(216, 90, 48, 0.38); font-weight: 700; }',
            '.boug-live-actions a:first-child { background: var(--accent); color: #fff; }',
            '.boug-live-actions a:last-child { color: var(--accent); background: rgba(255, 255, 255, 0.12); }',
            '.boug-live-garden { position: relative; z-index: 1; min-height: 360px; }',
            '.boug-live-stem { position: absolute; inset: 16% 8% 8% auto; width: 52%; border-left: 3px solid rgba(91, 126, 69, 0.72); border-radius: 54% 0 0 44%; transform: rotate(-18deg); }',
            '.boug-live-stem::before, .boug-live-stem::after { content: ""; position: absolute; width: 46%; border-top: 2px solid rgba(91, 126, 69, 0.62); transform-origin: left center; }',
            '.boug-live-stem::before { top: 32%; left: -4px; transform: rotate(-34deg); }',
            '.boug-live-stem::after { top: 58%; left: -2px; transform: rotate(28deg); }',
            '.boug-live-flower { position: absolute; width: clamp(88px, 12vw, 130px); aspect-ratio: 1; border-radius: 56% 44% 50% 50%; background: radial-gradient(circle at 52% 54%, #fff5a6 0 5%, transparent 6%), radial-gradient(circle at 25% 35%, #e87ab0 0 24%, transparent 25%), radial-gradient(circle at 70% 30%, #d44d8a 0 25%, transparent 26%), radial-gradient(circle at 35% 76%, #c73d7a 0 25%, transparent 26%), radial-gradient(circle at 76% 72%, #ee9cc4 0 22%, transparent 23%); filter: drop-shadow(0 14px 22px rgba(147, 40, 91, 0.28)); }',
            '.boug-live-flower.f1 { right: 3%; top: 6%; transform: rotate(12deg); }',
            '.boug-live-flower.f2 { right: 32%; top: 24%; transform: rotate(-18deg) scale(0.9); }',
            '.boug-live-flower.f3 { right: 12%; top: 48%; transform: rotate(28deg) scale(0.78); }',
            '.boug-live-flower.f4 { right: 46%; top: 58%; transform: rotate(-8deg) scale(0.66); }',
            '.boug-live-leaf { position: absolute; width: 72px; height: 32px; border-radius: 100% 0 100% 0; background: linear-gradient(135deg, #4d7f45, #8db36c); opacity: 0.82; }',
            '.boug-live-leaf.l1 { right: 37%; top: 12%; transform: rotate(-28deg); }',
            '.boug-live-leaf.l2 { right: 5%; top: 40%; transform: rotate(32deg); }',
            '.boug-live-leaf.l3 { right: 58%; top: 47%; transform: rotate(-18deg) scale(0.82); }',
            '@media (max-width: 760px) {',
            '  .bougainvillea-landing-live { grid-template-columns: 1fr; min-height: auto; padding: 2rem 1.35rem; }',
            '  .boug-live-garden { min-height: 230px; }',
            '  .boug-live-actions a { flex: 1 1 150px; }',
            '}',
            '@media (prefers-reduced-motion: no-preference) {',
            '  .boug-live-flower { animation: bougLiveFloat 7s ease-in-out infinite; }',
            '  .boug-live-flower.f2 { animation-delay: -1.6s; }',
            '  .boug-live-flower.f3 { animation-delay: -3.2s; }',
            '  @keyframes bougLiveFloat { 0%, 100% { translate: 0 0; } 50% { translate: 0 -9px; } }',
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
            '  <div class="boug-live-stem"></div>',
            '  <div class="boug-live-flower f1"></div>',
            '  <div class="boug-live-flower f2"></div>',
            '  <div class="boug-live-flower f3"></div>',
            '  <div class="boug-live-flower f4"></div>',
            '  <div class="boug-live-leaf l1"></div>',
            '  <div class="boug-live-leaf l2"></div>',
            '  <div class="boug-live-leaf l3"></div>',
            '</div>'
        ].join('');
        main.insertBefore(hero, main.firstElementChild);
    });
})();
