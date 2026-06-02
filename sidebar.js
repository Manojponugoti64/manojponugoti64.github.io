/* Sidebar: hamburger toggles a left drawer with nav links and shared polish. */
(function () {
    function ready(fn) {
        if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', fn);
        else fn();
    }

    function getPrefix() {
        var path = location.pathname || '/';
        var depth = path.replace(/^\/+|\/+$/g, '').split('/').filter(Boolean);
        if ((depth.length >= 1 && !/\.html?$/.test(depth[depth.length - 1])) || depth.length >= 2) {
            return '../';
        }
        return '';
    }

    function ensurePolish(prefix) {
        if (document.querySelector('link[data-site-polish="1"]')) return;
        var link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = prefix + 'polish.css';
        link.dataset.sitePolish = '1';
        document.head.appendChild(link);
    }

    function normalizeNavItems(items, prefix) {
        var navItems = items.slice();
        if (!navItems.length) {
            navItems = [
                { href: prefix + 'index.html', label: 'Home' },
                { href: prefix + 'now.html', label: 'Now' },
                { href: prefix + 'photos.html', label: 'Photos' },
                { href: prefix + 'music.html', label: 'Music' },
                { href: prefix + 'iss-tracker/', label: 'ISS Tracker' },
                { href: prefix + 'about.html', label: 'About' }
            ];
        }

        var hasNow = navItems.some(function (it) {
            return (it.label || '').toLowerCase() === 'now' || /now\.html/.test(it.href || '');
        });
        if (!hasNow) {
            var afterHome = navItems.findIndex(function (it) {
                return (it.label || '').toLowerCase() === 'home' || /index\.html/.test(it.href || '');
            });
            navItems.splice(afterHome >= 0 ? afterHome + 1 : Math.min(1, navItems.length), 0, {
                href: prefix + 'now.html',
                label: 'Now'
            });
        }

        var hasMusic = navItems.some(function (it) {
            return (it.label || '').toLowerCase() === 'music' || /music\.html/.test(it.href || '');
        });
        if (!hasMusic) {
            var afterPhotos = navItems.findIndex(function (it) {
                return (it.label || '').toLowerCase() === 'photos' || /photos\.html/.test(it.href || '');
            });
            navItems.splice(afterPhotos >= 0 ? afterPhotos + 1 : Math.min(3, navItems.length), 0, {
                href: prefix + 'music.html',
                label: 'Music'
            });
        }
        return navItems;
    }

    function isCurrent(href) {
        var here = (location.pathname.split('/').pop() || 'index.html').toLowerCase();
        var clean = (href || '').replace(/^\.\.\//, '').replace(/^\//, '').split('/').pop().toLowerCase();
        if (!clean) return false;
        if (here === '' && clean === 'index.html') return true;
        return here === clean;
    }

    function ensureHomepageFeatures(prefix) {
        var here = (location.pathname.split('/').pop() || 'index.html').toLowerCase();
        if (here !== 'index.html') return;
        if (document.querySelector('.home-feature-strip')) return;

        var hero = document.querySelector('.hero');
        if (!hero || !hero.parentNode) return;

        var section = document.createElement('section');
        section.className = 'home-feature-strip';
        section.setAttribute('aria-label', 'Featured blog sections');
        section.innerHTML = [
            '<a class="home-feature-card home-feature-card-primary" href="' + prefix + 'posts/the-optimal-rate-of-failure.html">',
                '<span class="feature-kicker">Latest Essay</span>',
                '<strong>The Optimal Rate of Failure</strong>',
                '<span>Finding the point where effort still feels alive.</span>',
            '</a>',
            '<a class="home-feature-card" href="' + prefix + 'now.html">',
                '<span class="feature-kicker">Now</span>',
                '<strong>What I am Into</strong>',
                '<span>Music, photos, and small notes from the week.</span>',
            '</a>',
            '<a class="home-feature-card" href="' + prefix + 'photos.html">',
                '<span class="feature-kicker">Photos</span>',
                '<strong>Five Favorite Frames</strong>',
                '<span>Restored images, night skies, water, and flowers.</span>',
            '</a>',
            '<a class="home-feature-card" href="' + prefix + 'music.html">',
                '<span class="feature-kicker">Music</span>',
                '<strong>On Repeat</strong>',
                '<span>Tame Impala, OneRepublic, and tracks worth replaying.</span>',
            '</a>'
        ].join('');
        hero.insertAdjacentElement('afterend', section);
    }

    ready(function () {
        var nav = document.querySelector('header nav');
        if (!nav || nav.dataset.sidebarReady === '1') return;
        nav.dataset.sidebarReady = '1';

        var prefix = getPrefix();
        ensurePolish(prefix);
        ensureHomepageFeatures(prefix);

        var inlineLinks = nav.querySelector('.nav-links');
        var items = [];
        if (inlineLinks) {
            var anchors = inlineLinks.querySelectorAll('li > a');
            anchors.forEach(function (a) {
                items.push({ href: a.getAttribute('href'), label: a.textContent.trim() });
            });
            inlineLinks.classList.add('nav-links-hidden');
        }
        var navItems = normalizeNavItems(items, prefix);

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

        var html = '';
        html += '<div class="sidebar-header">';
        html += '<span class="sidebar-title">Manoj\'s Blog</span>';
        html += '<button type="button" class="sidebar-close" aria-label="Close menu">&times;</button>';
        html += '</div>';
        html += '<nav class="sidebar-nav"><ul>';
        for (var i = 0; i < navItems.length; i++) {
            var it = navItems[i];
            var current = isCurrent(it.href) ? ' aria-current="page"' : '';
            html += '<li><a href="' + it.href + '"' + current + '>' + it.label + '</a></li>';
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
