/* WebMCP: expose a small, safe tool surface to browser-resident agents.
 *
 * Spec note (2026-08): the API moved from navigator.modelContext to
 * document.modelContext on 21 July 2026; navigator.* is deprecated in
 * Chrome 150 but still served by the origin trial. We resolve both.
 *
 * Tools are always pushed into our own REGISTRY; registering them with the
 * browser is the conditional step. That way the inspector (and any manual
 * poking) works in browsers that ship no WebMCP at all.
 */
(function () {
    'use strict';

    var mc = document.modelContext || navigator.modelContext || null;

    var REGISTRY = [];
    var CANONICAL_HOST = 'manojponugoti64.github.io';

    /* Wrap execute so failures come back as data an agent can read and act on.
     * A rejected promise surfaces as an opaque failure; {error: "..."} does not. */
    function define(tool) {
        var raw = tool.execute;
        tool.execute = function (input) {
            try {
                return Promise.resolve(raw(input || {}))['catch'](function (e) {
                    return { error: String((e && e.message) || e) };
                });
            } catch (e) {
                return Promise.resolve({ error: String((e && e.message) || e) });
            }
        };
        REGISTRY.push(tool);
        if (mc && typeof mc.registerTool === 'function') {
            try { mc.registerTool(tool); } catch (e) {
                // Duplicate name or invalid schema: keep the page working.
                if (window.console) console.warn('[webmcp] ' + tool.name + ': ' + e.message);
            }
        }
    }

    function getJSON(url) {
        return fetch(url).then(function (r) {
            if (!r.ok) throw new Error(url + ' returned HTTP ' + r.status);
            return r.json();
        });
    }

    function getText(url) {
        return fetch(url).then(function (r) {
            if (!r.ok) throw new Error(url + ' returned HTTP ' + r.status);
            return r.text();
        });
    }

    /* ---------------------------------------------------------------- posts */

    function parseFeed(xml) {
        var doc = new DOMParser().parseFromString(xml, 'application/xml');
        if (doc.querySelector('parsererror')) throw new Error('feed.xml is not valid XML');
        return Array.prototype.map.call(doc.querySelectorAll('item'), function (it) {
            function txt(tag) {
                var n = it.querySelector(tag);
                return n ? (n.textContent || '').trim() : '';
            }
            return {
                title: txt('title'),
                url: txt('link'),
                date: txt('pubDate'),
                summary: txt('description')
            };
        });
    }

    define({
        name: 'searchPosts',
        description: 'Search Manoj’s blog posts by keyword. Matches post titles and summaries. Call with no query to list the most recent posts.',
        annotations: { readOnlyHint: true },
        inputSchema: {
            type: 'object',
            properties: {
                query: { type: 'string', description: 'Keyword to search for. Omit to get recent posts.' },
                limit: { type: 'number', description: 'Maximum posts to return (default 10).' }
            }
        },
        execute: function (input) {
            var q = (input.query || '').trim().toLowerCase();
            var limit = input.limit > 0 ? input.limit : 10;
            return getText('/feed.xml?cb=' + Date.now()).then(function (xml) {
                var posts = parseFeed(xml);
                if (q) {
                    posts = posts.filter(function (p) {
                        return (p.title + ' ' + p.summary).toLowerCase().indexOf(q) !== -1;
                    });
                }
                return { posts: posts.slice(0, limit), total: posts.length };
            });
        }
    });

    define({
        name: 'getPost',
        description: 'Fetch the full text of one blog post, given its URL as returned by searchPosts.',
        annotations: { readOnlyHint: true },
        inputSchema: {
            type: 'object',
            properties: { url: { type: 'string', description: 'URL of the post to read.' } },
            required: ['url']
        },
        execute: function (input) {
            /* Resolve before checking. A string-prefix test is defeated by
             * "//evil.com" (protocol-relative) and by "/posts/../../x". */
            var u;
            try { u = new URL(input.url, location.href); }
            catch (e) { return { error: 'Not a valid URL: ' + input.url }; }

            /* feed.xml carries absolute production URLs, so accept the canonical
             * host as well as the current one — otherwise searchPosts -> getPost
             * breaks on localhost. We validate the path, then always fetch from
             * *this* origin, so a foreign host can never actually be requested. */
            if (u.origin !== location.origin && u.hostname !== CANONICAL_HOST) {
                return { error: 'Refused: only posts on this site can be read.' };
            }
            if (u.pathname.indexOf('/posts/') !== 0 || !/\.html$/.test(u.pathname)) {
                return { error: 'Refused: not a blog post path.' };
            }

            return getText(location.origin + u.pathname).then(function (html) {
                var doc = new DOMParser().parseFromString(html, 'text/html');
                var main = doc.querySelector('main') || doc.body;
                var text = (main.textContent || '').replace(/\s+/g, ' ').trim();
                var titleEl = doc.querySelector('meta[property="og:title"]');
                return {
                    title: titleEl ? titleEl.getAttribute('content')
                                   : (doc.title || '').replace(/\s*—.*$/, ''),
                    text: text,
                    wordCount: text ? text.split(' ').length : 0
                };
            });
        }
    });

    /* --------------------------------------------------------------- photos */

    define({
        name: 'listPhotos',
        description: 'List photos from the blog gallery, newest first.',
        annotations: { readOnlyHint: true },
        inputSchema: {
            type: 'object',
            properties: { limit: { type: 'number', description: 'Maximum photos to return (default 20).' } }
        },
        execute: function (input) {
            var limit = input.limit > 0 ? input.limit : 20;
            return getJSON('/gallery/manifest.json?cb=' + Date.now()).then(function (data) {
                /* Sort on `uploaded` rather than reversing the array: array order
                 * only tracks recency while the manifest stays append-only. */
                var photos = ((data && data.photos) || []).slice().sort(function (a, b) {
                    return (b.uploaded || 0) - (a.uploaded || 0);
                });
                return { photos: photos.slice(0, limit), total: photos.length };
            });
        }
    });

    /* ---------------------------------------------------------------- theme */

    define({
        name: 'setTheme',
        description: 'Switch the site between dark and light mode.',
        annotations: { readOnlyHint: false },
        inputSchema: {
            type: 'object',
            properties: {
                theme: { type: 'string', enum: ['light', 'dark', 'toggle'], description: 'Theme to apply.' }
            },
            required: ['theme']
        },
        execute: function (input) {
            var want = input.theme;
            if (['light', 'dark', 'toggle'].indexOf(want) === -1) {
                return { error: 'theme must be "light", "dark" or "toggle".' };
            }
            var btn = document.querySelector('.theme-toggle-btn');
            if (!btn) return { error: 'Theme toggle is not on this page.' };

            /* Click the button rather than writing dataset/localStorage ourselves.
             * theme.js owns three pieces of state together (the data-theme attr,
             * the blog-theme key, and the button icon) and exports none of them.
             * Driving the user's path keeps that ownership intact. */
            var current = document.documentElement.dataset.theme || 'dark';
            if (want === 'toggle' || want !== current) btn.click();

            return { theme: document.documentElement.dataset.theme || 'dark' };
        }
    });

    /* Expose the registry for the inspector and for manual console poking. */
    window.__webmcp = {
        tools: REGISTRY,
        native: !!mc,
        call: function (name, input) {
            var t = REGISTRY.filter(function (x) { return x.name === name; })[0];
            return t ? t.execute(input || {})
                     : Promise.resolve({ error: 'No such tool: ' + name });
        }
    };
})();
