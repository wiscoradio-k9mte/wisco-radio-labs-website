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
- **Contact:** a contact **form** (serverless form service, e.g. Formspree free tier —
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
photo** (pending). Brand: military-maintenance discipline + maker's instinct; "Made in
the Driftless."

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

## Current status (2026-06-28) — INTAKE COMPLETE, scaffolding
Profile set and confirmed at intake. Local folder + brief created; git initialized.
GitHub repo **not yet created** (awaiting Travis's go — firm checkpoint). No build yet.

## What v1 must prove
A fast, modern, **genuinely pleasant-to-read-on-a-phone** site with the five sections in
place: a working Home, a Blog that renders Markdown articles well (with at least **one
seed post** so it isn't empty), a CW Trainer Products page, an About page (photo pending),
and a working Contact form — dark-first with a clean light toggle, on the `*.github.io`
preview, ready for a domain when Travis is.

## Open decisions / pending from Travis
- About-page photo (Travis to supply).
- Real article content (Travis writes over time; we seed one sample post).
- Domain name + registration (deferred to go-live; not part of the build).
- Exact social/QRZ links + contact email for the Contact page.
