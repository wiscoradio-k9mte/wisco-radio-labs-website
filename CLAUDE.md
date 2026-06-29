# Project Brief — Wisco Radio Labs Website

This file is the product's standing memory. The team reads it at the start of every
engagement and tightens it at the end. Keep it terse and accurate; it is loaded each
session, so narration costs tokens forever.

## What it is
The public website for **Wisco Radio Labs (K9MTE)** — Travis Engh's ham-radio maker
brand. Starts as primarily a **blog/vlog**: articles (and embedded videos) about what
Travis is building and how he's trying to make new, exciting things for the ham-radio
community. Five flat sections: **Home, Blog, Products, About, Contact**. The first
product featured is the **CW Trainer** (see `../CW-Trainer/CLAUDE.md`). Tagline from the
logo: *"Made in the Driftless."*

## Product profile (the rules in force)
- **Software-only, web** → **software doctrine** applies (modern/best-available; no
  hardware parts-forever rules).
- **Stack:** **Astro** (static-site generator) + **React islands** for the few
  interactive pieces (dark/light toggle, embeds, any post filtering). Markdown/MDX
  content collections for articles. Astro outputs static HTML — near-zero JS by default.
- **Host:** **GitHub Pages** (static). Build/iterate on the free `*.github.io` preview
  URL; a real domain is registered and wired **later, as a separate go-live step** —
  deliberately decoupled so the build can be perfected first. No domain purchased yet.
- **Authoring:** Travis writes posts as **Markdown files in the repo** (chosen over a
  CMS UI for simplicity/control; a Git-based CMS UI like Decap/Sveltia can be added
  later if Markdown gets old — noted, not built).
- **Look:** **dark-first with a light toggle.** Palette from the logo — charcoal/near-
  black field, warm **orange/amber** primary, gray accents. Modern, sleek.
- **Mobile:** **built desktop-first, but mobile reading is the primary real-world use** —
  most visitors read/scroll on phones. Mobile layout, typography, tap targets (≥48×48px),
  and load speed are **acceptance criteria, not afterthoughts.** (Lesson from CW Trainer:
  "responsive later" became desktop-only — not this time.)
- **No user accounts / auth** — static content site, near-zero security surface. (See
  [[website-security-accounts]]: accounts would need a managed identity service; not in scope.)
- **Contact:** a contact **form** (free static-form service — **Web3Forms**, emails to Gmail —
  GitHub Pages is static) **plus** email + social/QRZ links.
- **Video ("vlog"):** **YouTube embeds** in posts (Travis hosts on YouTube; site embeds).
- **Defaults set at intake:** RSS feed ON; lightweight privacy-friendly analytics ON;
  blog **comments OFF** at launch (spam/moderation not worth it day one; addable later).

## Design intent (grounded in research, 2026-06-28)
Reference point: K4SWL's **qrper.com**, but *more modern and easier to navigate* — beat
its WordPress-era density. Avoid the heavy widget sidebar (search + long category lists +
archives + affiliate boxes) and category sprawl. Instead:
- 5 flat nav items; mobile = clean header + "Menu" drawer.
- Lead with clean post cards + strong featured images; let articles breathe (generous
  whitespace ≈ +20% comprehension; ~65–75 char measure; large readable type).
- One uncluttered place for categories/search, not a wall of widgets.
- Speed as a feature (Astro static) — the retention edge on phones.

## Products page — CW Trainer (first entry)
Cover: what it is, where to find it (`snap install wr-cw-trainer`), how to use it now,
and future plans. May reuse the CW Trainer **banner + screenshots** as assets. CW Trainer
is 🟢 LIVE on the Snap Store at v2.3.0. Source of truth for facts: `../CW-Trainer/CLAUDE.md`.

## About page
Intro to Travis + background + why he started Wisco Radio Labs. **Travis will supply a
photo** (pending). **Background arc (confirmed 2026-06-29):** military maintenance/systems work
→ **software engineer** → **information security engineer** — and that software/infosec career is
what pulled him into ham radio (a love of building hardware + the software that runs it). This
arc is now in the About bio. Brand: that discipline + maker's instinct; "Made in the Driftless."

## Assets
- Logo: dark circular badge — "WISCO RADIO LABS" in orange, radio tower, "MADE IN THE
  DRIFTLESS." (Provided 2026-06-28.) Palette anchor for the whole site.
- CW Trainer banner + screenshots: reuse from `../CW-Trainer/`.
- About photo: pending from Travis.

## Tooling & gates (to establish at scaffold/build)
- Astro project: `npm run dev`, `npm run build` (must pass), `npm run preview`.
- Tests/lint TBD by the team (the **test-qa-engineer** gate still applies — content site,
  so gate = build passes, links valid, a11y/contrast for both themes, mobile layout holds,
  Lighthouse mobile healthy).
- Deploy: GitHub Actions → GitHub Pages (set up at build time).

## Current status (2026-06-29) — v1 BUILT + GATED, PREVIEW LIVE, awaiting Travis's review
Full team flow done: architect → web-designer → implementer → **test-qa PASS** (gate bit:
caught a non-biting draft test + a vacuous link test, both fixed). Astro 6 static site, all
5 sections, dark/light w/ no-flash init, mobile-first reading, seed post, CW Trainer product
page (real banner + screenshots), Web3Forms contact form, RSS+sitemap. 12 unit tests + a
`test:links` base-path/draft gate wired into CI. **Live preview:**
https://wiscoradio-k9mte.github.io/wisco-radio-labs-website/ (verified HTTP 200 on all routes,
base-path clean, `noindex` on).
- **Repo is PUBLIC** (Travis's call 2026-06-29 — free-plan Pages needs public for a private
  repo to deploy; reversible). `PREVIEW_NOINDEX=true` keeps it out of search until go-live.
- Deploys from **`feature/initial-build`** via GH Actions (env branch-policy allows it). Flip
  the workflow trigger + `github-pages` env to `main` after Travis approves and it merges.
- **NOT merged to main** — main holds only the scaffold; the built site is the feature branch
  pending Travis's review (branch discipline: main blessed only after his approval, via PR).
- Manager decisions on record: theme toggle/drawer are plain `.astro`+module scripts (NOT React
  islands — no-flash init can't be an island; @astrojs/react installed, reserved for a future
  tag filter); analytics OFF until domain go-live.

## Marketing engagement (2026-06-29) — Travis brought the marketing team IN for the website
Policy refinement (Travis's call): marketing **IS in scope for owned brand surfaces** (the site
markets the brand/person/mission, not an unshipped product). Brand-truth gate still governs all
of it; active EXTERNAL publishing of a product still waits for explicit launch go. See
[[feedback-marketing-owned-surfaces]]. Done this session:
- **Marketing plan** (`docs/website-marketing-plan.md`, brand-truth PASS): positioning = "one
  ham, K9MTE, building honest open-source tools in the open, from the Driftless — a workbench
  with the door open." Imagery decision: **real photos + buildable graphics, NO AI** (Travis's
  choice; team recommended it — AI-slop reads inauthentic to hams). FCC 97.1 framed spirit-of only.
- **Tier-1 brand assets built** (additive, gated build/test/links green): `public/og-default.png`
  1200×630 social/OG share-card (SVG→PNG via sharp; system font, not Space Grotesk — future polish),
  favicon/app-icon set (`public/icons/`) + `site.webmanifest`, JSON-LD (Org/WebSite + per-post
  BlogPosting via a `head` slot), RSS polish, `SignalWave.astro` motif, post-card + blog empty-state
  brand fallbacks. Asset generator: `scripts/generate-brand-assets.mjs`.
- **Copy voice-pass APPLIED** (`docs/copy-voice-pass.md`, brand-truth PASS, Travis-approved):
  removed the **"transceivers" overclaim** (manager-introduced, gate caught it) → operator-
  differentiator + "more projects in progress"; **added IOTA** to CW Trainer QSO modes (product
  page + seed post) as "SOTA and IOTA contacts"; About/empty-state voice polish. Live + verified.
- **Brand voice guide** (`docs/voice-style-guide.md`) — THE standing reference for all copy/blog.
  Derived from Travis's own fiction (kept private, NOT in repo): plain first-person, specific to
  proper nouns, dry understated humor, Driftless reverence, "build it well / make it repairable /
  show the work." **Language line (Travis 2026-06-29):** brand pages (Home/Products/About/Contact)
  = ZERO profanity; **blog** = a little earned mild salt OK (hell/damn/ass/crap level), never
  f-bombs/slurs, never gratuitous, never in titles/headings/opening lines. Gate enforces by surface.

## What v1 must prove
A fast, modern, **genuinely pleasant-to-read-on-a-phone** site with the five sections in
place: a working Home, a Blog that renders Markdown articles well (with at least **one
seed post** so it isn't empty), a CW Trainer Products page, an About page (photo pending),
and a working Contact form — dark-first with a clean light toggle, on the `*.github.io`
preview, ready for a domain when Travis is.

## Full once-over review + fix batch (2026-06-29) — DONE, live + verified
Ran the whole team read-only: test-qa, web-designer (a11y), security-engineer, brand-truth + a
**diverse 5-persona UAT panel** (Travis's lens choice). Verdict was READY-WITH-FIXES. Then fixed
**blockers + cheap majors** (Travis's scope) and re-gated brand-truth PASS. Key outcomes:
- **Two factual blockers fixed:** learning order now LEARN→KEY→COPY→QSO (Travis caught it; panel
  did NOT — synthetic UAT has no ground truth for app facts); false "audio input" claim replaced
  with the truth (on-screen paddle / keyboard / VBand-style USB adapter sending `[`/`]`).
- **Light-theme contrast blocker fixed:** `.eyebrow` → `--brand-ink` (was `--brand`, failed AA).
- **Newcomer jargon:** Travis chose "light glosses, keep the voice" — CW/QSO/POTA/SOTA/IOTA/
  ragchew/fist/73/Snap/Driftless glossed first-use, in voice. (Panel split: expert ham 4/5 trust↑;
  newcomers 2–3/5 hit a jargon wall — the gloss pass addresses it.)
- **Contact = Web3Forms** (NOT Formspree — Travis avoided it; Web3Forms free, no cost). Real key
  live, emails to `wiscoradio@gmail.com`; mailto fallback if key unset. `WEB3FORMS_KEY` typed
  `string` so the fallback check passes `astro check`.
- Honest tag labels (no dead filters); Linux-only note; GitHub source link; About/Products body
  → `--text`; home `<h2>` heading fix; GPL-3.0-or-later; SOTA chase; "tools". **YouTube live:**
  `youtube.com/@Wisco-Radio-K9MTE` ("K9MTE (Travis)", verified resolves).
- check-links now also gates aria-id resolution, single-h1, heading-skips, RSS drafts (all bite).

## Open decisions / pending from Travis
- **About-page photo** — branded placeholder in place; one-line swap when Travis supplies it.
- Real article content (Travis writes over time; one seed post shipped).
- **Deferred polish** (reviewed, not done — Travis's call to pick up): theme-color follows OS not
  toggle; drawer slide animation; clipboard AT live-region; weak email regex; ~193KB unused React
  JS in build; remark-plugin unit tests; the analytics HTML comment in `<head>` (cosmetic).
- Domain + go-live sequence (deferred): set `site`+drop `base`, add `public/CNAME`, flip
  `PREVIEW_NOINDEX=false`, wire analytics, switch deploy trigger/env to `main`, + security go-live
  items (privacy disclosure, meta-CSP, Dependabot, SHA-pin action, enforce HTTPS).
- Travis's mobile read-quality check on a real phone (his standing bar).
