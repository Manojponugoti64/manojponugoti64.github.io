# Manoj's Blog — manojponugoti64.github.io

Personal blog and photo site, served by GitHub Pages directly from `main`.
Plain hand-written HTML/CSS/JS — **no build step, no framework, no npm**.
Whatever is committed is what ships.

## Layout

- `index.html` — landing page with recent-posts list
- `posts/*.html` — blog posts, one file per post
- `archive.html` — archive page listing all posts by category, plus photo previews
- `photos.html` + `gallery/manifest.json` — photo gallery driven by the manifest
- `music.html` + `music/manifest.json` — music page (MP3s live in `music/`)
- `books.html` + `books/` — reading list
- `about.html`, `404.html` — static pages
- `feed.xml` — hand-maintained RSS feed
- `assets/` — shared images such as the Open Graph card (`og-image.jpg`)
- `iss-tracker/`, `manage/`, `write/` — self-contained single-page apps
- `style.css` — main stylesheet (CSS custom properties for theming); referenced
  with a cache-busting query (`style.css?v=1.8`) — bump the version when editing
- JS, all loaded per page: `theme.js` (light/dark, in `<head>`, not deferred),
  `sidebar.js` (drawer nav, versioned like CSS), `upvote.js`, `comments.js`,
  `share.js`, `reading-time.js`, `spotify.js`, `space-hub.js`
- `scripts/check_links.py` — CI link checker (see Checks below)

## Adding a blog post — checklist

Creating `posts/<slug>.html` is not enough; listings and the feed are
maintained by hand. A new post must touch **four** files:

1. **`posts/<slug>.html`** — copy the full `<head>` from an existing post
   (e.g. `posts/the-solid-state-of-life.html`) and update every field:
   - `<meta name="blog-category" content="technical|non-technical">`
   - `<title>Post Title — Manoj's Blog</title>` (em dash)
   - `<meta name="description">`, canonical URL, RSS `<link>`, and the full
     set of Open Graph / Twitter / `article:*` meta tags
   - Body: `<article class="post-content">` with `<h1>` title and
     `<div class="post-meta">Month D, YYYY</div>`
2. **`index.html`** — add the post to the recent-posts list.
3. **`archive.html`** — add an `<li data-slug="<slug>">` entry to the matching
   category column (`data-archive-list="technical"` or `"non-technical"`).
   Archive link text is ALL CAPS.
4. **`feed.xml`** — add an `<item>` for the post (title, link, pubDate,
   description).

## Conventions

- Relative paths everywhere (`../style.css` from `posts/`) for stylesheets and
  scripts; absolute `https://manojponugoti64.github.io/...` URLs only in
  canonical/OG meta tags and `feed.xml`.
- Theming uses CSS custom properties (`--bg-secondary`, `--text-primary`,
  `--accent`, …) — use the variables, never hard-coded colors, so dark mode
  keeps working.
- Page-specific styles go in a `<style>` block in that page's `<head>`;
  shared styles go in `style.css`.
- Photos: add the image file under `gallery/` and an entry in
  `gallery/manifest.json`. Pages fetch the manifest at runtime.

## Preview locally

```bash
python3 -m http.server 8000   # then open http://localhost:8000
```

Pages that fetch manifests (`photos.html`, `archive.html`, `music.html`) need
an HTTP server; opening files with `file://` won't load them.

## Checks

Run before committing — CI runs the same script on every PR and push to main:

```bash
python3 scripts/check_links.py
```

It verifies every internal `href`/`src` in every HTML file resolves to a real
file, which catches renamed posts, missing images, and typo'd paths before
they reach the live site.
