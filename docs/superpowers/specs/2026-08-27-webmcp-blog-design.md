# Making the blog agent-ready with WebMCP

**Date:** 2026-08-27
**Status:** Approved, ready for implementation planning
**Goal:** Learn the WebMCP pattern hands-on by exposing a small, safe tool surface on the static blog.

## Background

WebMCP lets a web page register tools on itself that a browser-resident agent can
call inside the user's existing session. Unlike server-side MCP, there is no
transport to configure and no credential to provision: the page *is* the server,
and the site's own origin and auth are the security boundary.

### Spec state as of 2026-08-27

Verify these before trusting any tutorial; the API has moved twice in 2026.

- The API moved from `navigator.modelContext` to `document.modelContext` in the
  spec draft of 21 July 2026, on the reasoning that tools belong to a page rather
  than to the browser.
- `navigator.modelContext` is deprecated in Chrome 150. Chrome's origin trial
  (149-156) still serves the old location.
- Edge ships experimental support behind a flag. Firefox and Safari have no
  committed implementation.
- Secure context only (HTTPS or `localhost`), top-level browsing contexts only;
  iframes are excluded by design.
- A tool's `execute` returns a **plain object**. It does not return MCP's
  `{content: [...]}` array; the browser wraps the result.

Sources are listed at the end of this document.

## Scope

**In scope:** three read-only tools and one action tool over data the blog already
publishes, plus a dev-only inspector panel used as the test harness.

**Out of scope:** write tools of any kind. The blog has no authentication, so a
write tool would be a *public* write tool. Excluded on safety grounds, not
effort.

## Architecture

Three new files. No build step, no dependencies, matching the existing
vanilla-IIFE house style (`theme.js`, `sidebar.js`).

| File | Role | Loaded on |
|---|---|---|
| `webmcp.js` | Registry shim and the four tool definitions | every page |
| `webmcp-inspector.js` | Dev-only panel for invoking tools by hand | only when URL has `?mcp=debug` |
| `webmcp-inspector.css` | Panel styling | same gate |

Script tags carry the `?v=` cache-buster used throughout the site.

### The registry shim

`webmcp.js` maintains its own array of tool definitions and registers each one
into the browser API only when that API is present:

```js
var mc = document.modelContext || navigator.modelContext || null;
```

The inspector reads the local array, never the browser.

This is the load-bearing design decision. It means:

1. The site behaves identically in browsers that ship nothing (Safari, Firefox).
2. Tools can be exercised today with no browser flag and no origin-trial token.
3. When the API location moves again, exactly one line changes.

The project builds against its own seam rather than against a spec still in
motion.

## Tools

| Tool | Input | Returns | `readOnlyHint` |
|---|---|---|---|
| `searchPosts` | `{query: string, limit?: number}` | `{posts: [{title, url, date, summary}], total}` | `true` |
| `getPost` | `{url: string}` | `{title, text, wordCount}` | `true` |
| `listPhotos` | `{limit?: number}` | `{photos: [{src, caption, uploaded}], total}` | `true` |
| `setTheme` | `{theme: "light"｜"dark"｜"toggle"}` | `{theme}` | `false` |

### searchPosts

Fetches `feed.xml`, parses it with `DOMParser`, and case-insensitively matches
`query` against each item's title and description. `limit` defaults to 10.

An absent or empty `query` returns the most recent posts rather than an error,
so an agent exploring the site has a usable entry point.

`feed.xml` is the index because it is the one file already updated on every
publish. A separate `posts.json` would be a second place to remember, and so a
sync bug waiting to happen.

### getPost

Fetches a post's HTML and extracts the text content of `<main>`.

**Guard:** the supplied `url` must be same-origin and resolve under `/posts/`.
Without this, a tool that fetches an arbitrary URL and returns its body turns the
page into a fetch proxy operating with the visitor's cookies. Reject anything
else with an error object rather than following it.

### listPhotos

Reads `gallery/manifest.json` and sorts by the `uploaded` timestamp descending.
`limit` defaults to 20.

Sort explicitly on `uploaded` rather than reversing the array. `archive.html`
currently relies on array order, which holds only while the manifest stays
append-only — an assumption a tool should not inherit.

### setTheme — the instructive one

`setTheme` **clicks the existing `.theme-toggle-btn`** rather than setting
`document.documentElement.dataset.theme` and writing `localStorage` itself.

`theme.js` is a closed IIFE that exports nothing, and it owns three pieces of
state together: the `data-theme` attribute, the `blog-theme` localStorage key,
and the button's sun/moon icon. Writing the first two directly would leave the
icon stale and quietly fork the state into two owners.

The principle generalises well beyond this button: **a tool should act as a
synthetic user, not as a backdoor.** Driving the same code path a person drives
means the tool inherits every invariant, guard, and side effect the UI already
maintains, for free — and cannot drift from it. This is the discipline that
matters most when the target is an application with real data.

For `"toggle"`, click once. For an explicit `"light"` or `"dark"`, read the
current `dataset.theme` and click only if it differs; report the resulting theme
either way.

## Data flow

```
agent or inspector
  -> tool execute()
  -> fetch of a static file already served from this origin
  -> plain object returned
```

No server, no API keys, no new endpoints. The blog's attack surface does not
grow: every read tool returns something already publicly readable, and the one
action tool only flips a cosmetic preference.

## Error handling

Every `execute` body is wrapped so failures return `{error: "message"}` rather
than throwing.

A rejected promise reaches an agent as an opaque failure it cannot reason about.
A returned error string is something it can read, explain to the user, and
recover from — for example by retrying with a corrected argument.

Cases to handle explicitly: network failure on `fetch`, non-OK HTTP status,
malformed XML or JSON, `getPost` URL failing the same-origin guard, `setTheme`
finding no toggle button in the DOM.

## Testing

The inspector panel is the test harness. Gated behind `?mcp=debug` so it never
reaches ordinary visitors.

It must:

1. List every tool in the local registry with its name and description.
2. Render an input form generated from each tool's `inputSchema`.
3. Invoke the tool and pretty-print the returned JSON, including error objects.
4. Visibly mark which tools declare `readOnlyHint: false`.

Building the inspector teaches the calling side of the API, which most tutorials
omit.

Manual test checklist:

- Each tool returns well-formed data on a happy path.
- `searchPosts` with a nonsense query returns `{posts: [], total: 0}`, not an error.
- `searchPosts` with no `query` returns recent posts.
- `listPhotos` returns newest first even if the manifest is manually reordered.
- `getPost` rejects an off-origin URL and a URL outside `/posts/`.
- `setTheme("toggle")` flips the theme *and* updates the button icon.
- `setTheme("light")` called twice is idempotent.
- With `?mcp=debug` absent, no inspector markup is present in the DOM.
- The site loads clean in a browser with no `modelContext` (Safari).

## Prerequisite fix

`feed.xml` lists only two of the three posts; `posts/the-solid-state-of-life.html`
is missing. `searchPosts` reads `feed.xml`, so it will under-report until this is
corrected. Add the missing `<item>` first, otherwise this surfaces later as a
phantom bug in the tool.

## Accepted trade-offs

- Roughly 6KB ships to every visitor for a feature few browsers can currently
  use. Accepted for a learning build; worth revisiting if it ever matters.
- Parsing `feed.xml` at runtime costs about fifteen lines of `DOMParser` glue
  versus reading a purpose-built JSON index. Accepted to keep a single source of
  truth for the post list.
- Only the fields present in `feed.xml` are searchable — no tags or categories,
  since the feed carries none.

## Sources

- [WebMCP updates, clarifications, and next steps — Patrick Brosset](https://patrickbrosset.com/articles/2026-02-23-webmcp-updates-clarifications-and-next-steps/)
- [The State of WebMCP: July 2026 — Spronta](https://www.spronta.com/blog/state-of-webmcp-july-2026/)
- [WebMCP Cheat Sheet — Webfuse](https://www.webfuse.com/webmcp-cheat-sheet)
