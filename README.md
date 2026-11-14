# MILCHIS

Personal blog and portfolio of Milchis Catalin-Marian (`DarkSoulEngineer`),
focused on cybersecurity, radio-frequency security and software development.

The site is a fully static [Next.js](https://nextjs.org/) app. Pages are
generated at build time from Markdown posts and JSON data, then served as plain
HTML. There is no backend or database.

## Features

- Home: profile, focus areas, selected projects and latest articles
- Articles archive at `/articles` with tag filtering (`/articles?tag=...`) and pagination
- Post pages rendered from GitHub-flavored Markdown
- Projects page with a client-side language filter
- CV page with a two-page, ATS-friendly print-to-PDF layout
- Radio player (SomaFM "Seven Inch Soul")
- Light and dark theme (follows the system setting, toggle in the header)

## SEO

- Per-page titles, descriptions and canonical URLs (`src/lib/seo.ts`)
- Open Graph and Twitter cards with a shared preview image (`public/og.jpg`)
- JSON-LD structured data: `Person`, `WebSite`, `ProfilePage`, `BreadcrumbList`, `BlogPosting` (`src/lib/structured-data.ts`)
- Generated `sitemap.xml`, `robots.txt` and `manifest.webmanifest`
- Favicons and app icons in `src/app/` and `public/`

Absolute URLs come from `NEXT_PUBLIC_SITE_URL`. On Vercel this falls back to the
production domain automatically (`VERCEL_PROJECT_PRODUCTION_URL`). Set it in the
Vercel project settings if you use a custom domain:

```
NEXT_PUBLIC_SITE_URL=https://your-domain.com
```

## Tech stack

| Layer     | Technology                                             |
| --------- | ------------------------------------------------------ |
| Framework | Next.js 16 (App Router, Turbopack, `output: "export"`) |
| UI        | React 19 + TypeScript                                  |
| Styling   | Tailwind CSS 4                                         |
| Markdown  | `react-markdown` + `remark-gfm`                        |

## Project structure

```
PersonalWEB/
└── frontend/                  # Next.js static site
    ├── src/
    │   ├── app/               # App Router pages
    │   │   ├── page.tsx       # Home: profile hero
    │   │   ├── articles/page.tsx  # Articles archive
    │   │   ├── projects/page.tsx  # Projects + language filter
    │   │   ├── cv/page.tsx    # CV page
    │   │   ├── posts/[slug]/  # Post detail (static via generateStaticParams)
    │   │   └── not-found.tsx  # 404 page
    │   ├── components/        # Feature-grouped views
    │   │   ├── layout/        # SiteHeader, SiteFooter
    │   │   ├── home/          # HomeView
    │   │   ├── articles/      # ArticlesView
    │   │   ├── projects/      # ProjectsView, ProjectCard
    │   │   ├── cv/            # CvView, CvIndex, PrintButton
    │   │   ├── radio/         # RadioProvider, player controls
    │   │   └── ui/            # PageHeader, SectionHeader, JsonLd, Markdown, icons
    │   └── lib/               # posts, profile, projects, cv, seo, site, structured-data
    ├── content/posts/         # Markdown articles (frontmatter + body)
    ├── data/                  # profile, projects, cv (JSON)
    └── public/                # static assets (images)
```

## Getting started

Requires Node.js 20+ and npm.

```powershell
cd frontend
npm install        # first time only
npm run dev        # dev server at http://localhost:3000
```

## Build (static export)

```powershell
cd frontend
npm run build      # writes the static site to frontend/out/
```

Serve `frontend/out/` with any static host (GitHub Pages, Netlify, nginx). Every
route is pre-rendered, including `404.html`.

## Linting

```powershell
cd frontend
npm run lint
```

## Security checks

```powershell
cd frontend
npm audit
npm test
npm run lint
npm run build
```

- A scoped `minimatch` override fixes GHSA-g3hv-75wg-m249 in the TypeScript
  lint tooling. Remove it when the parent dependency adopts a patched version.
- The build adds a per-page Content Security Policy to the static HTML. Inline
  JavaScript is allowed only by its build-generated SHA-256 hash; event-handler
  attributes, plugins and form submissions are blocked. Inline CSS remains
  allowed for React styles. Edit source files and rebuild rather than modifying
  exported scripts after hashing.
- `vercel.json` adds anti-framing, MIME-sniffing, referrer and
  browser-permission protections. Vercel provides HTTPS and HSTS.
- Markdown uses `react-markdown`'s default URL filtering without raw HTML
  execution. JSON-LD escapes `<` to prevent script-tag breakout.
- `start.ps1` serves locally on `127.0.0.1`, restricts files to the export
  directory, and does not expose error stack traces to browsers.

These checks address known findings; they are not a guarantee that the site is
free of all vulnerabilities.

## Deploying to Vercel

Keep Vercel's **Root Directory** set to `.` (the repository root). The root
`vercel.json` preserves the existing deployment setup: install with
`npm --prefix frontend ci`, build with `npm run build`, and serve `frontend/out`
with clean URLs. The root build command delegates to the frontend build,
including its security post-processing. Pushing `main` triggers the connected
production deployment. The HTTP headers are Vercel-specific; other hosts need
equivalent configuration. `frontend/vercel.json` also supports deploying the
frontend directory directly.

## Authoring content

Content lives in `frontend/` and is read at build time.

**Posts** are Markdown files in `frontend/content/posts/`. The file name is the
URL slug, and the frontmatter drives the archive:

```markdown
---
title: My new article
author: Milchis Catalin-Marian
date: 2026-10-09
updated: 2026-10-10
tags: security, radio
likes: 0
---

Article body in Markdown.
```

**Data** is plain JSON in `frontend/data/`:

| File              | Used by                |
| ----------------- | ---------------------- |
| `profile.json`    | Home, footer, SEO      |
| `projects.json`   | Projects page          |
| `cv.json`         | CV page (achievements included) |

## Deploying to GitHub Pages

This is a project site at `https://<user>.github.io/PersonalWEB/`, so Next.js
needs a matching base path before building. Add one in `frontend/next.config.ts`:

```ts
const nextConfig: NextConfig = {
  output: "export",
  basePath: "/PersonalWEB",
  assetPrefix: "/PersonalWEB/",
  images: { unoptimized: true },
};
```

Then publish the contents of `frontend/out/` (for example with the `gh-pages`
package or a GitHub Actions workflow). Omit `basePath`/`assetPrefix` if the site
is served from the domain root.
