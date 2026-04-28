// Giscus comments + reactions loader.
// Mirrors the active page theme (light/dark) so comments match the site.
(function () {
    function currentTheme() {
        return document.documentElement.dataset.theme === 'light' ? 'light' : 'dark_dimmed';
    }

    function mountGiscus() {
        var holder = document.getElementById('giscus-container');
        if (!holder) return;
        // Avoid double-mount on SPA-style navigations
        if (holder.dataset.giscusMounted === '1') return;
        holder.dataset.giscusMounted = '1';

        var s = document.createElement('script');
        s.src = 'https://giscus.app/client.js';
        s.setAttribute('data-repo', 'Manojponugoti64/manojponugoti64.github.io');
        s.setAttribute('data-repo-id', 'R_kgDOSOEOpw');
        s.setAttribute('data-category', 'General');
        s.setAttribute('data-category-id', 'DIC_kwDOSOEOp84C72px');
        s.setAttribute('data-mapping', 'pathname');
        s.setAttribute('data-strict', '0');
        s.setAttribute('data-reactions-enabled', '1');
        s.setAttribute('data-emit-metadata', '0');
        s.setAttribute('data-input-position', 'bottom');
        s.setAttribute('data-theme', currentTheme());
        s.setAttribute('data-lang', 'en');
        s.setAttribute('data-loading', 'lazy');
        s.crossOrigin = 'anonymous';
        s.async = true;
        holder.appendChild(s);
    }

    // Ask the giscus iframe to swap theme without reloading
    function syncTheme() {
        var iframe = document.querySelector('iframe.giscus-frame');
        if (!iframe || !iframe.contentWindow) return;
        iframe.contentWindow.postMessage(
            { giscus: { setConfig: { theme: currentTheme() } } },
            'https://giscus.app'
        );
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', mountGiscus);
    } else {
        mountGiscus();
    }

    // Watch for theme toggles via the existing data-theme attribute
    var obs = new MutationObserver(syncTheme);
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
})();
