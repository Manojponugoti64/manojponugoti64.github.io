/* Anonymous upvote for articles. Counts stored at abacus.jasoncameron.dev.
   Each browser can upvote each article only once (tracked in localStorage). */
(function () {
    var NS = 'manojponugoti-blog';
    var ENDPOINT = 'https://abacus.jasoncameron.dev';

    function ready(fn) {
        if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', fn);
        else fn();
    }

    function setCount(bar, n) {
        var c = bar.querySelector('.upvote-count');
        if (c) c.textContent = (typeof n === 'number' && !isNaN(n)) ? n : 0;
    }

    function setVoted(bar) {
        bar.classList.add('is-voted');
        var btn = bar.querySelector('.upvote-btn');
        if (btn) {
            btn.setAttribute('aria-pressed', 'true');
            btn.setAttribute('disabled', 'disabled');
            var lbl = btn.querySelector('.upvote-label');
            if (lbl) lbl.textContent = 'Upvoted';
        }
    }

    function loadCount(bar, slug) {
        fetch(ENDPOINT + '/get/' + encodeURIComponent(NS) + '/' + encodeURIComponent(slug), { mode: 'cors' })
            .then(function (r) {
                if (r.status === 404) return { value: 0 };
                if (!r.ok) throw new Error('count fetch failed');
                return r.json();
            })
            .then(function (data) { setCount(bar, (data && data.value) || 0); })
            .catch(function () { setCount(bar, 0); });
    }

    function vote(bar, slug) {
        var key = 'upvoted:' + slug;
        if (localStorage.getItem(key) === '1') return;
        // Optimistic update
        var current = parseInt(bar.querySelector('.upvote-count').textContent, 10) || 0;
        setCount(bar, current + 1);
        setVoted(bar);
        localStorage.setItem(key, '1');
        fetch(ENDPOINT + '/hit/' + encodeURIComponent(NS) + '/' + encodeURIComponent(slug), { mode: 'cors' })
            .then(function (r) { return r.ok ? r.json() : null; })
            .then(function (data) { if (data && typeof data.value === 'number') setCount(bar, data.value); })
            .catch(function () { /* keep optimistic count */ });
    }

    ready(function () {
        var bars = document.querySelectorAll('.upvote-bar[data-slug]');
        if (!bars.length) return;
        bars.forEach(function (bar) {
            var slug = bar.getAttribute('data-slug');
            if (!slug) return;
            var btn = bar.querySelector('.upvote-btn');
            if (!btn) return;

            // If this browser already voted, mark voted state immediately
            if (localStorage.getItem('upvoted:' + slug) === '1') setVoted(bar);

            loadCount(bar, slug);

            btn.addEventListener('click', function () { vote(bar, slug); });
        });
    });
})();
