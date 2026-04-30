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
        // Read existing items so the sidebar mirrors whatever each page already had.
        var items = [];
        if (inlineLinks) {
            var anchors = inlineLinks.querySelectorAll('li > a');
            anchors.forEach(function (a) {
                items.push({ href: a.getAttribute('href'), label: a.textContent.trim() });
            });
            // Hide the inline list — the sidebar replaces it.
            inlineLinks.classList.add('nav-links-hidden');
        }

        // Hamburger button
        var btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'menu-toggle';
        btn.setAttribute('aria-label', 'Open menu');
        btn.setAttribute('aria-expanded', 'false');
        btn.innerHTML = '<span></span><span></span><span></span>';

        // Insert hamburger as the first child of nav (top-left)
        nav.insertBefore(btn, nav.firstChild);

        // Backdrop
        var backdrop = document.createElement('div');
        backdrop.className = 'sidebar-backdrop';
        document.body.appendChild(backdrop);

        // Sidebar drawer
        var aside = document.createElement('aside');
        aside.className = 'sidebar';
        aside.setAttribute('aria-label', 'Site navigation');
        aside.setAttribute('aria-hidden', 'true');

        // Detect path depth so links from /posts/foo.html work too
        var prefix = '';
        var path = location.pathname || '/';
        // /posts/foo.html → ../, /write/ or /manage/ → ../, root → ''
        var depth = path.replace(/^\/+|\/+$/g, '').split('/').filter(Boolean);
        // pages live at root level: index.html, about.html, archive.html
        // depth 0 = root, depth 1 = /posts/foo.html or /write/ etc.
        if (depth.length >= 1 && !/\.html?$/.test(depth[depth.length - 1]) || (depth.length >= 2)) {
            // /write/, /manage/, /posts/foo.html → need ../
            prefix = '../';
        } else if (depth.length === 1 && /\.html?$/.test(depth[0])) {
            // /about.html, /archive.html → no prefix
            prefix = '';
        }

        // Build sidebar content. Use links from inline nav if present, otherwise default set.
        var defaults = [
            { href: prefix + 'index.html', label: 'Home' },
            { href: prefix + 'about.html', label: 'About' },
            { href: prefix + 'archive.html', label: 'Archive' }
        ];
        var navItems = items.length ? items : defaults;

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

        // Theme toggle inside sidebar — re-uses theme.js's storage + html data-theme
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
