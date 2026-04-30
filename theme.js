/* Theme toggle: dark <-> light. Saves user's choice in localStorage. */
(function () {
    var KEY = 'blog-theme';

    function applyTheme(t) {
        document.documentElement.dataset.theme = t;
    }

    function getSaved() {
        try { return localStorage.getItem(KEY); } catch (e) { return null; }
    }

    function setSaved(t) {
        try { localStorage.setItem(KEY, t); } catch (e) {}
    }

    // Apply immediately to avoid flicker
    var saved = getSaved();
    if (!saved) {
        // First-time visitor: respect system preference
        try {
            saved = window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
        } catch (e) {
            saved = 'dark';
        }
    }
    applyTheme(saved);

    function iconFor(t) {
        // Sun when light is active, moon when dark is active (icon shows current state)
        return t === 'light' ? '\u2600' : '\u263E'; // ☀ / ☾
    }

    function inject() {
        var navLinks = document.querySelector('nav .nav-links');
        if (!navLinks) return;
        if (navLinks.querySelector('.theme-toggle')) return;
        var li = document.createElement('li');
        li.className = 'theme-toggle';
        var btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'theme-toggle-btn';
        btn.setAttribute('aria-label', 'Toggle dark and light mode');
        btn.title = 'Toggle dark / light';
        function refresh() {
            var cur = document.documentElement.dataset.theme || 'dark';
            btn.textContent = iconFor(cur);
        }
        btn.addEventListener('click', function () {
            var cur = document.documentElement.dataset.theme || 'dark';
            var next = cur === 'light' ? 'dark' : 'light';
            applyTheme(next);
            setSaved(next);
            refresh();
        });
        refresh();
        li.appendChild(btn);
        navLinks.appendChild(li);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', inject);
    } else {
        inject();
    }
})();
