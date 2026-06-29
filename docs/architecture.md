# Architecture — Wisco Radio Labs Website

ADR-style design note. This is a **plan for the implementer**, not code. It names real
files, real Astro APIs, and real package names so the implementer builds against a fixed
structure rather than inventing one. Keep it legible: a newcomer should be able to read
this and understand the whole site.

> **Verification note (read first).** This document was written without live access to the
> Astro docs (no WebFetch/WebSearch in the authoring session). It targets **Astro 5.x**
> conventions as of early 2026. Every version number and framework API flagged with
> **[CONFIRM]** must be verified by the implementer at scaffold time — the source of truth
> is what `npm create astro@latest` actually installs and the current docs at
> https://docs.astro.build. Do not treat a [CONFIRM] line as settled fact; pin the real
> installed versions in `package.json` and adjust call sites if an API has moved.

---

## 1. Goal and acceptance criteria (restated)

**Goal.** A fast, modern, dark-first content site for Wisco Radio Labs (K9MTE) — primarily
a blog/vlog — with five flat sections (Home, Blog, Products, About, Contact). It is a
**static content site**, not an app. It is built and iterated on the GitHub Pages *project*
URL (a sub-path), with a custom domain wired later.

**Acceptance criteria** (what "done" means for this build):

1. `npm run build` passes clean; the site previews correctly **under the `/wisco-radio-labs-website/` base path** — every internal link and asset resolves (no root-absolute `/...` leaks). This is the single most common GitHub Pages project-site failure; it is criterion #1.
2. Five sections render: Home, Blog (index + individual article route), Products (CW Trainer detail), About, Contact.
3. Blog renders Markdown articles well, with **at least one seed post** so the index is not empty. Drafts are excluded from production builds.
4. **Mobile reading is first-class** — readable type, ≥48×48px tap targets, a ~65–75ch measure on article body, fast load. Treated as a primary acceptance gate, not a fallback.
5. **Dark-first theme with a light toggle**, no flash of wrong theme on load (FOUC-free), choice persisted to `localStorage`, `prefers-color-scheme` respected on first visit.
6. Contact form posts to a serverless service (Formspree assumed) via a clearly-marked placeholder endpoint.
7. RSS feed and sitemap are generated. YouTube vlog embeds load lazily/privacy-respecting so a video does not tank mobile load.

**Ambiguities flagged** (none are blockers; placeholdered in §11):
- The Formspree form ID, the About photo, real contact/social/QRZ links, and real article copy are all **pending from Travis**. The build proceeds on placeholders.
- "React islands" is in the profile, but the genuinely React-needing surface is near-zero. See the decision in §4 — this is a real call I'm making and flagging, not silently.

---

## 2. Chosen approach (one paragraph)

A standard Astro 5 static site. Pages and layout are `.astro` (zero JS shipped by default).
Blog content is Markdown in an Astro **content collection** with a zod-typed schema.
Theme and the mobile menu are handled by **tiny inline/module scripts inside `.astro`
components** — not React — because they need a few lines of DOM toggling, not a component
framework, and an inline theme script is the only FOUC-free option anyway. `@astrojs/react`
is still installed (per profile) and reserved for a genuinely stateful future island (e.g.
client-side tag filtering on the blog index); nothing in v1 hydrates React. YouTube embeds
use the `astro-embed` `<YouTube>` component (a lite-youtube web component — privacy-friendly,
no React). Deploy is GitHub Actions → GitHub Pages via the official `withastro/action`.

The whole thing is deliberately boring. For a content site, boring is the correct, doctrine-
aligned answer: the simplest structure that fully meets the brief.

---

## 3. Project structure (directory tree)

```
wisco-radio-labs-website/
├── astro.config.mjs            # site + base + integrations (the GH Pages linchpin — §6)
├── tsconfig.json               # extends astro/tsconfigs/strict
├── package.json                # scripts + pinned deps (§8)
├── src/
│   ├── content.config.ts       # content collections + zod schema (Astro 5 location) [CONFIRM]
│   ├── consts.ts               # SITE_TITLE, SITE_DESCRIPTION, social/contact links, FORMSPREE_ID
│   ├── pages/
│   │   ├── index.astro         # Home
│   │   ├── blog/
│   │   │   ├── index.astro     # Blog listing (cards, sorted date desc)
│   │   │   └── [...slug].astro  # Individual article route (dynamic)
│   │   ├── products/
│   │   │   └── index.astro      # Products → CW Trainer detail (single product for v1)
│   │   ├── about.astro          # About
│   │   ├── contact.astro        # Contact (form + links)
│   │   └── rss.xml.js            # RSS endpoint (@astrojs/rss)
│   ├── layouts/
│   │   ├── BaseLayout.astro      # <html> shell: head, theme init, header, footer, <slot/>
│   │   └── BlogPost.astro        # article frame: hero, title, meta, prose, optional video
│   ├── components/
│   │   ├── BaseHead.astro        # <title>, meta description, canonical, OG/Twitter tags
│   │   ├── Header.astro          # logo + Nav + ThemeToggle + mobile menu trigger
│   │   ├── Nav.astro             # the 5 nav links (shared desktop + drawer)
│   │   ├── ThemeToggle.astro     # button + module script (NOT React) — §4
│   │   ├── MobileMenu.astro      # drawer + module script (NOT React) — §4
│   │   ├── Footer.astro          # links, "Made in the Driftless", © line
│   │   ├── PostCard.astro        # blog index card (image, title, date, description, tags)
│   │   ├── FormattedDate.astro   # consistent date rendering
│   │   ├── YouTubeEmbed.astro    # thin wrapper over astro-embed <YouTube>
│   │   └── ContactForm.astro     # static <form> → Formspree (no JS required)
│   ├── content/
│   │   └── blog/
│   │       └── welcome-to-wisco-radio-labs.md   # the seed post
│   ├── assets/
│   │   └── brand/
│   │       └── wisco-radio-labs-logo.png         # MOVED here from /assets for astro:assets optimization
│   └── styles/
│       ├── tokens.css            # CSS custom properties: the theme token contract (§4)
│       └── global.css            # element + layout base styles, imports tokens.css
├── public/
│   ├── favicon.svg               # (or .ico) — served as-is, base-path aware via <link>
│   └── og-default.png            # fallback social-share image
├── docs/
│   └── architecture.md           # this document
└── .github/
    └── workflows/
        └── deploy.yml            # Astro → GitHub Pages (§6)
```

**`.astro` vs React (`.tsx`) and why.** *Every component above is `.astro`.* None ships as a
hydrated React island in v1. The reasoning is in §4 — the short version is that the
interactive surface (theme toggle, mobile drawer) is a few lines of DOM work best done with a
plain module script, and the theme init **must** be an inline script to be FOUC-free, which a
React island cannot do. `@astrojs/react` stays installed so that the first genuinely stateful
feature (a client-side blog tag filter is the likely candidate) can be added as a `.tsx`
island with `client:visible` without re-tooling. **If/when that island lands, it goes in
`src/components/` as `TagFilter.tsx` and is the one place React hydrates.**

**Asset location matters.** The logo currently lives at `assets/brand/...` (repo root). Move
it to `src/assets/brand/` so `astro:assets` can optimize and, critically, **emit a
base-path-correct hashed URL**. Anything left in `public/` is copied verbatim and must be
referenced through the base helper (§5). Prefer `src/assets` + the `<Image>` component for
anything that can be imported.

---

## 4. Theming

### Token contract (the variable names the designer and implementer share)

The web-designer owns the **values**; this design owns the **system and the names**. Define
all colors as CSS custom properties on `:root` (dark = default) and override the set under
`:root.theme-light`. Component CSS references *only* these tokens, never raw hex — that is what
makes one toggle re-skin the whole site.

`src/styles/tokens.css` defines (names are the contract — fill values per the designer):

```
:root {
  /* surfaces */
  --color-bg:            /* page field — charcoal/near-black in dark */
  --color-surface:       /* cards, raised panels */
  --color-surface-muted: /* subtle fills, code blocks */
  --color-border:        /* hairlines, dividers */

  /* text */
  --color-text:          /* primary body text */
  --color-text-muted:    /* meta, captions, secondary */
  --color-text-invert:   /* text on an accent fill */

  /* brand / accent (from the logo: warm orange/amber) */
  --color-accent:        /* primary orange/amber */
  --color-accent-hover:  /* hover/active accent */
  --color-focus:         /* focus ring — must clear AA contrast in BOTH themes */

  /* feedback (used sparingly on a content site) */
  --color-link:          /* in-prose link — often = accent */

  /* typography scale (rem-based; OS large-text must scale body — lesson from CW Trainer) */
  --font-sans:           /* UI + headings stack */
  --font-serif-or-prose: /* optional reading face for article body */
  --text-base:           /* ~1rem-1.125rem; article body leans large/readable */
  --measure:             65ch   /* article line length target, 65–75ch */

  /* spacing / shape */
  --space-unit, --radius, --shadow, --container-max ( ~1100–1180px )
}
:root.theme-light { /* override the color tokens only */ }
```

**Contrast is an acceptance item in BOTH themes** — the designer's values must clear WCAG AA
for body text and the focus ring against their own surface in dark *and* light. Flag any pair
that doesn't before finalize (honesty over polish).

### No-flash (FOUC-free) init — the inline script

In `BaseLayout.astro`, **inside `<head>`, before any stylesheet that paints**, place an
`<script is:inline>` (inline so it is not bundled/deferred and runs before first paint). It:

1. Reads `localStorage.getItem('theme')` (`'light'` | `'dark'`).
2. If absent, falls back to `window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark'` — **default dark** when no preference.
3. Sets `document.documentElement.classList.toggle('theme-light', theme === 'light')` synchronously.

Because this runs before paint and toggles a class on `<html>`, the correct palette is applied
on the first frame — no flash. Keep this script tiny and dependency-free; it is the one piece
of JS that runs on every page regardless of anything else.

### The toggle (an Astro component, not a React island)

`ThemeToggle.astro` renders a `<button>` (with `aria-label`/`aria-pressed`) and a sibling
**module `<script>`** (runs once, deferred — fine, the no-flash work already happened). On
click it flips `document.documentElement.classList.toggle('theme-light')` and writes the new
value to `localStorage`. That's the entire feature.

**Why not React:** this is ~8 lines of DOM. A React island would ship a runtime, hydrate, and
still couldn't own the pre-paint init (that has to be inline). Using a plain script is simpler,
faster, and zero-hydration — the doctrine-correct call. This is a deliberate deviation from a
literal reading of "React island"; flagged here so it's a decision, not a drift.

---

## 5. Layout, nav, SEO, and the base-path-safe link helper

### Layout chain

- `BaseLayout.astro` — owns `<html lang="en">`, `<head>` (via `BaseHead.astro` + the inline theme script), `<body>` with `Header` / `<slot/>` / `Footer`. Takes `title`, `description`, and optional `image` props for SEO.
- `BlogPost.astro` — wraps `BaseLayout`, adds the article frame (hero image via `<Image>`, `<h1>`, `FormattedDate`, tag list, optional `YouTubeEmbed`, then the `<slot/>` rendered Markdown in a `.prose` wrapper constrained to `--measure`).

### Header / nav / mobile drawer

`Header.astro` shows the logo (links Home), the 5-item `Nav.astro` inline on wide viewports, and
the `ThemeToggle`. Below a breakpoint (~720–768px) the inline nav is hidden and a **"Menu"**
button reveals `MobileMenu.astro`, a drawer/overlay containing the same `Nav` links.

`MobileMenu.astro` is an Astro component with a **module script**: toggles an `open` class /
`aria-expanded`, traps nothing fancy (close on link click, on Escape, on overlay click). Tap
targets ≥48×48px. **Why not React:** same reasoning as the toggle — a class flip and two event
listeners. No state machine, no hydration cost.

> Nav single-sourcing: define the nav items once (an array in `consts.ts`) and render it in both
> `Nav.astro` and the drawer, so the 5 links never drift apart.

### SEO head (`BaseHead.astro`)

Emits: `<title>`, `<meta name="description">`, `<link rel="canonical">`, Open Graph
(`og:title`/`og:description`/`og:image`/`og:type`/`og:url`) and Twitter card tags, favicon link,
and the sitemap/RSS `<link rel="alternate">`. **Every URL it emits (canonical, og:url, og:image,
favicon) must be absolute and base-aware** — build them from `Astro.site` + `Astro.url` (which
already include the base) or from the helper below. A hard-coded `/og-default.png` will 404 on a
project page.

### The base-path-safe link helper (the #1 GH Pages footgun)

GitHub Pages serves this site from `/wisco-radio-labs-website/`. Astro automatically prefixes the
base onto **imported assets** and `<Image>`, but it does **NOT** rewrite raw `href`/`src`
strings you author. So `<a href="/blog">` breaks; it must resolve under the base.

Two complementary rules:

1. **Imported assets** (logo, hero images) → use `import` + `<Image>`/`src`. Base handled for you.
2. **Authored internal links** (`<a href>`, manual `<link href>`, any string URL) → route through a tiny helper.

`src/lib/link.ts` (or in `consts.ts`):

```ts
// import.meta.env.BASE_URL is '/wisco-radio-labs-website/' in build, '/' in some dev configs.
export const withBase = (path: string): string => {
  const base = import.meta.env.BASE_URL.replace(/\/$/, '');   // strip trailing slash
  const clean = path.replace(/^\//, '');                       // strip leading slash
  return clean ? `${base}/${clean}` : `${base}/`;
};
// usage: <a href={withBase('/blog')}>Blog</a>  ->  /wisco-radio-labs-website/blog
```

**[CONFIRM]** the exact shape of `import.meta.env.BASE_URL` in this project's dev vs build
(Astro normalizes it; confirm whether it carries a trailing slash in the installed version) and
adjust the helper's joining if needed. The link-integrity test in §7 is what guarantees this
stays correct.

> Rule of thumb to put in the implementer brief: **no string literal `href`/`src` that starts
> with `/` in any component.** Either import the asset or wrap the path in `withBase()`.

### Responsive / mobile-first quality

Although authored desktop-first, treat phone reading as the primary target:
- Single-column, fluid layout that simply *is* the mobile layout; widen and add the right margins/grid at breakpoints, don't bolt mobile on after.
- Article body capped at `--measure` (65–75ch), `--text-base` large enough to read on a phone, generous line-height and section spacing (the "let it breathe" intent).
- All interactive targets ≥48×48px (nav, menu button, theme toggle, form controls).
- Images responsive via `<Image>` (width/sizes); the YouTube facade (below) keeps video cheap.
- A Lighthouse-mobile pass is part of the QA gate (§7).

### YouTube embeds (privacy + mobile load)

`YouTubeEmbed.astro` wraps the `astro-embed` `<YouTube id={...} />` component **[CONFIRM package
name/version]** — a *lite-youtube* facade that renders a thumbnail + play button and only loads
the YouTube iframe/player on click. This avoids the ~hundreds-of-KB and tracking cost of a raw
iframe on page load, which matters most on phones. It is a web component, **not** a React island.
The blog schema's `youtube` field (§ content model) feeds the `id`; `BlogPost.astro` renders the
embed above the prose when present. Posts can also embed inline videos mid-article by using the
same component in MDX if MDX is enabled (optional — see §8).

---

## 6. Content model (collections, schema, drafts, the seed post)

Astro 5 uses the **Content Layer** API. Define collections in **`src/content.config.ts`**
(root of `src/`, not `src/content/config.ts` — the location moved in Astro 5) **[CONFIRM]**,
using the `glob()` loader from `astro/loaders`.

```ts
// src/content.config.ts
import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const blog = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/blog' }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      description: z.string(),
      pubDate: z.coerce.date(),
      updatedDate: z.coerce.date().optional(),
      heroImage: image().optional(),          // co-located image, optimized by astro:assets
      tags: z.array(z.string()).default([]),
      draft: z.boolean().default(false),
      youtube: z.string().optional(),         // YouTube id (or full URL) for vlog posts
    }),
});

export const collections = { blog };
```

Notes:
- `image()` (the schema helper exposed via `({ image }) =>`) types `heroImage` as an importable, optimizable asset — store hero images alongside the post in `src/content/blog/` (or `src/assets/`). This yields base-path-correct, optimized images automatically.
- `youtube` is intentionally permissive (id *or* URL); `YouTubeEmbed.astro` normalizes to an id. If you want it strict, narrow with a regex in zod — optional, not required.
- **[CONFIRM]** that `z.coerce.date()` is the current idiom (it has been the standard for date frontmatter) and that the `({ image }) => z.object(...)` schema-function form is current in the installed version.

**Draft exclusion (prod only).** Drafts must be invisible in production but visible in dev so
Travis can preview WIP. Centralize the filter so it's applied identically everywhere posts are
queried:

```ts
// in blog/index.astro, [...slug].astro, rss.xml.js
import { getCollection } from 'astro:content';
const posts = (await getCollection('blog', ({ data }) => import.meta.env.PROD ? !data.draft : true))
  .sort((a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf());  // newest first
```

**Rendering a post** (Astro 5 — `render()` is now imported, replacing `entry.render()`)
**[CONFIRM]**:

```ts
import { render } from 'astro:content';
const { Content } = await render(post);
// <Content /> inside the .prose wrapper
```

**The seed post.** `src/content/blog/welcome-to-wisco-radio-labs.md` — a real, short
"why Wisco Radio Labs exists / what's coming" post (Travis can rewrite later). Valid frontmatter
filling every required field, `draft: false`, so the index, the article route, the RSS feed, and
the sitemap all have at least one real entry to render and to test against. Optionally add a
second `draft: true` post so the draft-exclusion behavior is observable (and testable).

---

## 7. Routing

| Route (under base) | File | Behavior |
|---|---|---|
| `/` | `src/pages/index.astro` | Home: hero/intro, "latest posts" (top 3 from the sorted collection), pointer to Products. |
| `/blog/` | `src/pages/blog/index.astro` | Lists all non-draft posts as `PostCard`s, **sorted pubDate desc**. |
| `/blog/<slug>/` | `src/pages/blog/[...slug].astro` | One article. `getStaticPaths()` maps each post → a page. |
| `/products/` | `src/pages/products/index.astro` | CW Trainer detail (see below). |
| `/about/` | `src/pages/about.astro` | Travis bio + photo (placeholder). |
| `/contact/` | `src/pages/contact.astro` | `ContactForm` + email/social/QRZ links. |
| `/rss.xml` | `src/pages/rss.xml.js` | RSS feed endpoint. |
| `/sitemap-*.xml` | (generated) | `@astrojs/sitemap` integration output. |

**Dynamic article route** (`[...slug].astro`) — note Astro 5 uses `post.id` (the content-layer
entry id from the glob loader), not the legacy `post.slug` **[CONFIRM]**:

```ts
export async function getStaticPaths() {
  const posts = await getCollection('blog', ({ data }) => import.meta.env.PROD ? !data.draft : true);
  return posts.map((post) => ({ params: { slug: post.id }, props: { post } }));
}
const { post } = Astro.props;
const { Content } = await render(post);
```

(A catch-all `[...slug]` is used so nested or dated filenames map cleanly; if all posts are flat
single-segment ids, a `[slug].astro` also works — `[...slug]` is the safe default.)

**Products page.** v1 has exactly one product, so a single `products/index.astro` that *is* the
CW Trainer detail is the simplest correct structure — do **not** build a product collection/index
for one item (YAGNI). Content to include (facts from `../CW-Trainer/CLAUDE.md`): what it is
(Koch-method CW trainer — LEARN/COPY/KEY drills + QSO simulator, fully offline), how to get it
(**`snap install wr-cw-trainer`** — live on the Snap Store at **v2.3.0**), how to use it now, and
future plans. Reuse the CW Trainer banner/screenshots as assets (copy the chosen images into
`src/assets/` so they're optimized and base-correct). If a second product ever appears, *then*
refactor to `products/index.astro` (list) + `products/[slug].astro` — noted, not built.

---

## 8. GitHub Pages deploy

### `astro.config.mjs` — the exact `site`/`base` for this repo

Owner `wiscoradio-k9mte`, repo `wisco-radio-labs-website`, served from the project pages URL:

```js
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://wiscoradio-k9mte.github.io',
  base: '/wisco-radio-labs-website',          // NO trailing slash; Astro normalizes
  integrations: [react(), sitemap()],
  // image service defaults are fine (sharp); markdown/shiki defaults fine
});
```

- `site` + `base` together make `@astrojs/sitemap` and `@astrojs/rss` emit correct absolute URLs and make `Astro.url`/`Astro.site` base-aware.
- **When the custom domain is wired later**, this is the one change point: set `site` to the domain and **remove `base`** (root domain serves from `/`). Add a `public/CNAME` then. Calling this out so the domain switch is a known, small edit — not a surprise.
- `@astrojs/rss` is used inside `rss.xml.js`; it's a package import, not an `integrations[]` entry. `@astrojs/sitemap` and `@astrojs/react` are integrations.

### The workflow — `.github/workflows/deploy.yml`

Use the **official Astro GitHub Pages path**: `withastro/action` to build, then
`actions/deploy-pages` to publish **[CONFIRM action versions against
https://docs.astro.build/en/guides/deploy/github/]**. In the repo settings, set **Pages →
Build and deployment → Source = GitHub Actions** (not "Deploy from a branch").

```yaml
name: Deploy to GitHub Pages
on:
  push:
    branches: [feature/initial-build]   # PREVIEW now; switch to [main] after Travis approves
  workflow_dispatch:                     # allow manual runs
permissions:
  contents: read
  pages: write
  id-token: write
concurrency:
  group: pages
  cancel-in-progress: true
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: withastro/action@v3        # [CONFIRM tag] installs deps, builds, uploads artifact
        # with: { node-version: 20, package-manager: npm }   # if defaults need overriding
  deploy:
    needs: build
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - id: deployment
        uses: actions/deploy-pages@v4    # [CONFIRM tag]
```

**Trigger, stated plainly:** the workflow triggers on push to **`feature/initial-build`** so the
preview deploys *now* from the build branch, plus `workflow_dispatch` for manual runs. **After
Travis approves and the branch merges, change the trigger to `branches: [main]`** (one-line edit)
so the live site tracks `main`. This is the deliberate "preview now, main later" seam the brief
asked for.

> **Firm checkpoint:** turning on Pages and the first public deploy is outward-facing — confirm
> with Travis before the first run publishes. The branch protection / merge-to-main rules from the
> shop's standing orders still apply: this branch merges via PR after approval; the workflow's
> switch to `main` happens at that point.

---

## 9. Testing surface (what the test-qa-engineer gates on)

A content site has little pure logic, so the gate is mostly **build integrity + content
validity + link/asset correctness + mobile/a11y**, with the testable logic kept pure and
importable.

1. **Build passes** — `npm run build` exits 0. This alone catches schema violations (zod throws at build), broken content references, and bad imports. Non-negotiable gate.
2. **Content-schema validity** — covered by the build (collection schema is enforced at build), plus a small unit test that asserts the seed post and any fixture parse and carry the expected fields. Keep any frontmatter-normalizing logic (e.g. the `youtube` id-from-url normalizer) as a **pure function in `src/lib/`** so it is unit-testable in isolation, asserting the **produced value** (the extracted id), not just "it ran."
3. **Link/asset integrity (the base-path gate)** — the highest-value test for this project. After build, scan the generated `dist/` HTML for internal `href`/`src` attributes and assert **none** points at a root-absolute path that escapes the base (i.e. no `href="/blog"` lacking the `/wisco-radio-labs-website` prefix), and that referenced local assets exist in `dist/`. This is what makes the §5 helper *bite* — a missed `withBase()` turns the test red. (A link-checker over `dist/` or a small custom script both work; the point is it runs in CI and catches the #1 failure.)
4. **Draft exclusion** — a test (or a build-output assertion) that a `draft: true` fixture is absent from `dist/` in a production build and present in dev. Make it bite by toggling the fixture.
5. **Mobile/a11y/perf (gate, partly manual)** — Lighthouse-mobile healthy (perf + a11y), AA contrast verified in **both** themes, tap targets ≥48px, layout holds at a phone width. The automatable parts (Lighthouse CI, an axe pass over key pages) run in CI; the "does it feel good to read on a phone" judgment is Travis's on-device check — name it as such, don't claim it from a headless run.

**Keep logic pure and importable.** There is very little logic here; what exists (the base-link
helper, the youtube normalizer, post sorting) lives in `src/lib/` as pure functions so tests
assert real outputs. Don't manufacture tests for `.astro` templates' markup; gate templates via
the build + the link-integrity scan instead.

---

## 10. Tooling

- **Node 20 LTS** (or 22) — match `withastro/action`'s default; pin in the workflow and a local `.nvmrc` **[CONFIRM the action's expected Node]**.
- **TypeScript on** — `tsconfig.json` extends `astro/tsconfigs/strict`. `.astro` files get type-checking via `astro check`.
- **`package.json` scripts:**

```json
{
  "scripts": {
    "dev": "astro dev",
    "build": "astro check && astro build",
    "preview": "astro preview",
    "test": "<vitest or the chosen runner>",            // unit tests for src/lib
    "test:links": "<post-build link-integrity scan>",   // §9.3 — runs against dist/
    "astro": "astro"
  }
}
```

- Dependencies (install via `npm create astro@latest` then add integrations — **pin whatever versions actually install; the numbers below are indicative, [CONFIRM]**):
  - `astro` (^5.x)
  - `@astrojs/react`, `react`, `react-dom` (per profile; reserved for a future island)
  - `@astrojs/sitemap`
  - `@astrojs/rss`
  - `astro-embed` (YouTube facade) — **[CONFIRM exact package/import; the YouTube component may be `astro-embed` or a sub-package]**
  - `sharp` (image optimization — usually pulled in by Astro)
  - dev: `typescript`, the test runner (`vitest` keeps parity with the shop's other product), and a link-checker dep if not hand-rolled
- **MDX (optional):** add `@astrojs/mdx` only if Travis wants components/embeds *inside* article bodies (e.g. an inline second video). Plain Markdown + the schema's single `youtube` field covers the stated vlog need. Default to **not** installing MDX (YAGNI); the schema's `**/*.{md,mdx}` glob already accepts it if added later. Flagged as a small either/or.

---

## 11. Open questions / pending inputs (and how to placeholder each)

All are non-blocking — the build proceeds on clearly-marked placeholders the implementer can
grep for (`PLACEHOLDER`) and Travis swaps later.

| Pending from Travis | Placeholder strategy so the build proceeds |
|---|---|
| **Formspree form ID** | `FORMSPREE_ID = 'PLACEHOLDER_FORM_ID'` constant in `src/consts.ts`; `ContactForm.astro` posts to `https://formspree.io/f/${FORMSPREE_ID}`. Form renders and validates client-side; submission is inert until the real ID lands. One-line swap. (Endpoint lives in `consts.ts`, not an env var — it's a public client-side ID, no secret; keeps it visible and simple.) |
| **About photo** | Ship a labeled placeholder image in `src/assets/` (or a CSS placeholder block) with a `PLACEHOLDER` alt note; About page layout is complete around it. |
| **Real contact email + social/QRZ links** | `SOCIAL_LINKS` array + `CONTACT_EMAIL` in `src/consts.ts`, seeded with `PLACEHOLDER` values; rendered in Footer + Contact. (Note the CW Trainer brief lists `wiscoradio@gmail.com` as the escalation email — confirm with Travis whether that is also the public contact address before using it; do not assume.) |
| **Real article content** | The one seed post stands in; Travis adds Markdown files over time. Optionally a second `draft: true` post to exercise draft handling. |
| **Custom domain** | Out of scope for the build (per brief). The §8 note documents the exact `astro.config` change + `public/CNAME` for the later go-live step. |
| **Analytics** (profile says "lightweight privacy-friendly analytics ON") | **Decision for Travis** — which provider (e.g. a privacy-respecting, cookieless service). Not specified in the brief beyond "on." Leave a single, clearly-marked insertion point in `BaseHead.astro` (one `<script>` slot, base-aware, behind a `consts.ts` flag) so adding it is one edit. Don't pick a vendor silently. |

---

## 12. Risks and unknowns (what's most likely to bite)

1. **Base-path leaks (highest risk).** A single `href="/..."` or `src="/..."` string anywhere — including in the seed Markdown, the OG/canonical tags, or the favicon link — 404s on the project page and often *only* shows up on the deployed site, not in `astro dev`. Mitigation: the §5 helper rule (no root-absolute string literals), prefer imported assets, and the §9.3 link-integrity test that fails the build on a leak. Treat this as the thing to get right.
2. **Astro 5 API drift vs this doc.** Content config location (`src/content.config.ts`), the `glob()` loader, `render(entry)` vs `entry.render()`, `post.id` vs `post.slug`, and the `({ image }) => z.object` schema form are all **[CONFIRM]** points written from memory without live docs. The implementer must verify against the installed version at scaffold; an Astro-template scaffold (`npm create astro@latest` → blog template) is the safest reference for the *current* idioms.
3. **`astro-embed` YouTube specifics.** Package/import name and the prop API for the lite-youtube component need confirming. If it's friction, the fallback is hand-rolling a click-to-load facade (a thumbnail `<button>` that swaps in the iframe on click) — same UX, a few more lines, no dependency. Either is acceptable; don't ship a raw eager iframe (it tanks mobile load).
4. **Workflow action versions / Pages source setting.** `withastro/action` + `actions/deploy-pages` tags and the "Source = GitHub Actions" repo setting must match current docs; a stale major or the wrong Pages source is a common first-deploy failure. Confirm before the first run.
5. **Theme contrast in light mode.** Dark-first means light gets less attention; AA contrast (esp. the amber accent on light surfaces, and the focus ring) is the likely defect. It's an explicit gate item in §9.5 — verify both themes, flag any failing pair to the designer.
6. **Formspree free-tier limits.** Submission caps/branding on the free tier may surprise later; a non-blocking known. The config is isolated to one constant, so swapping providers (or to a different form service) is cheap if it bites.
7. **"Most visitors are on phones" is the real bar.** Headless Lighthouse proves metrics, not feel. The on-device read-quality check is Travis's, and it's part of done — don't report mobile-readiness as proven from CI alone (software-craft: on-device check is part of done for the experience).

---

## 13. Summary of key decisions

- **Boring-by-design static Astro 5 site**; `.astro` everywhere, zero React hydration in v1.
- **Theme toggle + mobile drawer are plain `.astro` + module scripts, not React islands** — simpler, faster, and the no-flash init *must* be inline anyway. `@astrojs/react` stays installed, reserved for a future stateful island (likely a blog tag filter). *Deliberate deviation from a literal "React island" reading — flagged, not silent.*
- **Base path is the project's defining constraint**: `base: '/wisco-radio-labs-website'`, a `withBase()` helper for all authored links, imported assets for everything else, and a CI link-integrity test that makes a leak fail the build.
- **Content collection** with a zod schema (`title, description, pubDate, updatedDate?, heroImage?, tags[], draft, youtube?`); drafts excluded in prod via a centralized filter; one real seed post.
- **YouTube via a lite-youtube facade** (`astro-embed`, with a hand-rolled fallback) so video never tanks mobile load.
- **Deploy** via the official `withastro/action` → `actions/deploy-pages`, triggered on `feature/initial-build` now and switched to `main` after approval (one-line change). Custom-domain switch is a documented, small future edit.
- **One product page** for the CW Trainer (no premature product collection).
- **Pending inputs** (Formspree ID, About photo, contact/social links, analytics vendor) are isolated to `src/consts.ts` placeholders so the build proceeds and each is a one-line swap. **Analytics vendor is an open decision for Travis**, not picked silently.
```
