# MILCHIS

Personal blog and portfolio of Milchis Catalin-Marian (`DarkSoulEngineer`),
focused on cybersecurity, radio-frequency security and software development.

The site is a fully static [Next.js](https://nextjs.org/) app. Pages are
generated at build time from Markdown posts and JSON data, then served as plain
HTML. There is no backend or database.

## Features

- Home: introduction, selected work and recent highlights
- Articles archive at `/articles` with tag filtering (`/articles?tag=...`) and pagination
- Post pages rendered from GitHub-flavored Markdown
- Projects page with a client-side language filter
- CV page with a one-page print / Save as PDF sheet
- Radio player (SomaFM "Seven Inch Soul")

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
    │   │   ├── projects/      # ProjectsView
    │   │   ├── cv/            # CvView, CvIndex, PrintButton
    │   │   ├── radio/         # RadioProvider, player, hero button
    │   │   └── ui/            # Markdown
    │   └── lib/               # posts, profile, projects, cv, languages, format, types
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
| `profile.json`    | Home, CV, footer       |
| `projects.json`   | Projects page          |
| `cv.json`         | CV page (achievements included) |

## Deploying to Vercel

Deploy from the repository root (leave Vercel's Root Directory set to `.`).
The root `vercel.json` installs the frontend dependencies, builds the Next.js
static export, and serves only `frontend/out/`. Clean URLs keep routes such as
`/articles`, `/projects`, and `/cv` accessible without `.html` extensions.

```powershell
npm run build       # optional local build check (install frontend dependencies first)
npx vercel --prod   # build and update the production site
```

### Automatic deployments from GitHub

The Vercel project `personal` is connected to `DarkSoulEngineer/PersonalWEB`.
Push to `main` to build and update production automatically. Pushes to other
branches and pull requests create preview deployments. A local commit alone
does not deploy: push it to GitHub.

```powershell
git add <changed-files>
git commit -m "Update site"
git push origin main
```

Keep the Vercel Root Directory at `.` and Production Branch at `main`.
No GitHub Actions workflow or Vercel token in the repository is needed.
Never commit `.env*`, `.vercel/`, credentials, or generated build output.
All content in `frontend/data/` and `frontend/public/` may be published on the
website, even though the GitHub repository is private.

Before pushing, run `npm audit --prefix frontend`,
`npm run lint --prefix frontend`, and `npm run build`.
Check the commit's Vercel status on GitHub and its deployment logs afterward.

`npx vercel` without `--prod` creates a preview deployment. If visitors see a
Vercel login page, review Project Settings → Deployment Protection for Production.

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

## Printed CV

"Save PDF" on `/cv` prints a separate one-page A4 sheet
(`src/components/cv/CvPrint.tsx`), not the screen layout. It is filled from the
same JSON as the site. The `print` block in `data/cv.json` controls what fits:

| Key                 | Meaning                                                       |
| ------------------- | ------------------------------------------------------------- |
| `detailedRoles`     | How many roles print with bullet points (later ones: one line) |
| `maxProjects`       | How many featured projects to list                            |
| `projectCategories` | Only featured projects in these categories are listed         |
| `maxAchievements`   | How many achievements to list (`featured` ones first)         |

If the sheet spills onto a second page after you add content, lower one of
these numbers.

## Themes

The site has a dark and a light theme. The first visit follows the visitor's
system setting; the sun/moon button in the header switches it and the choice
is remembered in the browser (`localStorage`, key `theme`). Colours live as CSS
variables at the top of `src/app/globals.css`: `:root` is dark,
`:root[data-theme="light"]` is light. Use `--accent` for fills (buttons, dots)
and `--accent-text` for text, because the bright lime is unreadable as text on
the light background. The printed CV ignores the theme and is always black on
white.
