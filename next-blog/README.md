# Manoj's Blog (Next.js)

A Next.js version of [Manoj's Blog](https://manojponugoti64.github.io/) with the same dark theme, homepage tabs, and markdown-based posts.

## Getting started

```bash
cd next-blog
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Project structure

```
next-blog/
├── content/posts/          # Markdown blog posts (frontmatter + body)
├── public/                 # Static assets (images, og-image)
├── src/
│   ├── app/                # Next.js App Router pages
│   ├── components/         # Header, Footer, HomeTabs, PostCard
│   └── lib/posts.ts        # Post loading & markdown rendering
```

## Adding a new post

Create a file in `content/posts/your-slug.md`:

```md
---
title: "YOUR POST TITLE"
date: "2026-08-05"
description: "Short description for SEO."
excerpt: "Preview text shown on the homepage."
---

Your post content in **markdown**...
```

The post will appear at `/posts/your-slug`.

## Build for production

```bash
npm run build
npm start
```

Deploy to [Vercel](https://vercel.com) or any Node.js host.

## Migrating from the static site

Your original HTML blog stays in the repo root. This Next.js app lives in `next-blog/` so you can run both side by side while migrating.

To copy images from the static site:

```bash
cp -r ../gallery ../images ../assets public/
```
