# Project Brief — Wisco Radio Labs Website

Standing memory for the product. Loaded every session — keep it terse and accurate.

## What it is
Public website for **Wisco Radio Labs (K9MTE)** — Travis Engh's ham-radio maker brand.
Primarily a **blog/vlog** (what he's building for the ham community), plus a Products page.
Five flat sections: **Home, Blog, Products, About, Contact**. First product featured: the
**CW Trainer** (facts: `../CW-Trainer/CLAUDE.md`). Tagline: *"Made in the Driftless."*

## Profile (rules in force)
- **Software-only web** → software doctrine.
- **Stack: Astro 6 static → GitHub Pages.** Markdown content collections for posts. **Ships
  zero JS bundles** — interactivity (theme toggle, mobile drawer, copy button, contact form)
  is small inline/module scripts in plain `.astro`, NOT React. `@astrojs/react` was reserved
  then **removed** (nothing used it); re-add only if a genuinely interactive island (e.g. a
  blog tag filter) is ever built.
- **Repo is PUBLIC** (free-plan Pages needs it; reversible). Served from a project sub-path
  `/wisco-radio-labs-website/` — every link/asset MUST be base-path-safe (`withBase()` +
  `src/lib/remark-rewrite-links.mjs` for Markdown). This is the #1 breakage risk; CI gates it.
- **Deploys from `main`** via GH Actions (`.github/workflows/deploy.yml`; `github-pages` env
  allows `main`). Still a **preview**: `PREVIEW_NOINDEX=true`, **no custom domain yet**.
- **Look:** dark-first + light toggle (no-flash init), palette from the logo (charcoal +
  amber). **Mobile reading is a first-class acceptance criterion**, not an afterthought.
- **No accounts/auth** (near-zero security surface; [[website-security-accounts]]).
- **Contact:** **Web3Forms** form (free; `WEB3FORMS_KEY` in `src/consts.ts`, emails to
  `wiscoradio@gmail.com`) + mailto fallback + QRZ/YouTube/GitHub links. NOT Formspree.
- **Vlog:** YouTube (`youtube.com/@Wisco-Radio-K9MTE`) — embeds via click-to-load facade.
- RSS on; comments off; **analytics OFF until go-live**.

## Architecture & tooling
- `npm run dev` / `build` (runs `astro check` — must pass) / `preview` / `test` (vitest, 12).
- **`npm run test:links`** = the CI gate (`scripts/check-links.mjs`): base-path leaks,
  draft-in-`dist`, draft-in-RSS, `aria-labelledby` id resolution, single-`<h1>`, no
  heading-skips — all proven to bite. CI job "Test & Build" runs build+test+links then deploys.
- Config/seams: `src/consts.ts` (WEB3FORMS_KEY, CONTACT_EMAIL, SOCIAL_LINKS, ANALYTICS_ENABLED,
  PREVIEW_NOINDEX), `src/lib/link.ts` (`withBase`), brand assets via
  `scripts/generate-brand-assets.mjs` (OG card `public/og-default.png`, favicons, manifest).
- Design/intent docs: `docs/architecture.md`, `design-system.md`, `layouts.md`,
  `website-marketing-plan.md`, `copy-voice-pass.md`, **`voice-style-guide.md`**,
  **`image-seo-conventions.md`** (THE image standard: lowercase-kebab filenames,
  `src/assets/blog/<post-slug>/` layout, alt-text-first SEO priority, format/size).
- Known: harmless `markdown.remarkPlugins` deprecation warning on build (Astro 6) — migrate
  `remark-rewrite-links` to the `@astrojs/markdown-remark` API someday; not breaking.

## Blog posts (2026-06-29) — first post LIVE; editorial flow established
- **"Welcome to Wisco Radio Labs" PUBLISHED LIVE** — hero (FT-891 on 20m CW) + QSO screenshot + NorCal 40B
  build, with captions. De-cluttered per a **marketing-lead** image review (one image per beat; a Driftless
  stream was cut from the post and the asset removed in the 2026-06-29 cleanup),
  then tightened per the new **`editor`** agent (broke dense paragraphs, cut repetition), **brand-truth PASS**.
- **Post flow:** *Travis drafts → `editor` (craft: flow/voice, loads `editing-craft` + `voice-style-guide.md`)
  → `brand-truth-reviewer` (gate: shipped-facts/voice/ham) → publish.* The `editor` is NOT gated by the
  marketing-dark directive (editing his own writing isn't advertising).
- **`heroCaption`** schema field + `<figure>/<figcaption>` in `BlogPost.astro` (hero img stays `alt=""`,
  decorative; caption carries the text). Hero CSS fixed: was full-bleed `max-height`+`object-fit:cover` (band
  crop on desktop) → constrained to `--measure`, natural 16:9. **Inline captions** are currently a markdown
  image + italic line; upgrading them to true `<figure>` is a logged backlog item.
- **`draft-test-post.md`** is a permanent hidden fixture that keeps the draft-exclusion gate honest — leave it
  draft. Drafts show in `npm run dev`, hidden in prod (`PROD ? !draft : true`).

## Status (2026-06-29) — v1 COMPLETE, MERGED TO MAIN, preview LIVE (noindex), domain pending; first post published
Built architect→web-designer→implementer→**test-qa**; **marketing engaged** for the site
(plan + Tier-1 brand assets + voice guide); **two full all-team review rounds** (4 expert lanes
+ diverse 5-persona UAT panel each) + two fix batches. **Verdict READY, zero blockers;** all
findings fixed & re-gated. Merged `feature/initial-build` → `main` (PR #1) and deploying from
main; live preview verified (all routes 200, base-path clean, `noindex` on). Panel showed the
gloss pass worked (reachable newcomers rose: Tariq 3→4, Hassan 2→3; expert ham 4/5 throughout).

## Durable decisions
- **Marketing IS in scope for owned brand surfaces** (the site markets the brand/person, not an
  unshipped product); brand-truth gate governs all copy; **external publishing still waits** for
  Travis's explicit launch go. [[feedback-marketing-owned-surfaces]]
- **`voice-style-guide.md` is THE copy reference** (plain first-person, specific, dry, Driftless;
  derived from Travis's fiction — kept private, NOT in repo). **Language line:** brand pages =
  ZERO profanity; blog = occasional earned mild salt (no f-bombs/slurs, never in titles/leads).
- **Imagery: real photos + buildable graphics, NO AI** (authenticity for the ham audience).
- About bio reflects Travis's arc: military maintenance → software engineer → information
  security → ham radio (the infosec/software work is what pulled him in).

## Open / pending
- **About photo SHIPPED** (2026-06-29, PR #4): Travis's bench selfie masked to a **transparent
  circular** crop (`src/assets/about-travis.png`, no background box — both-theme-safe), shown in a
  circular About slot. (Re-mask script approach if ever replaced: detect circle, alpha-mask, crop.)
- **Needs Travis:** real article content over time (one seed post shipped).
- **DONE 2026-06-29 (PR #2):** the honest **CW-learner framing** — Travis is NOT on the air with
  CW yet; he built the trainer to learn it. Shipped to the About bio + a **blog voice pass** that
  reframes "why this exists" around the integrated-QSO gap (existing trainers drill the pieces;
  none rehearse the full QSO) — competitors researched (Morse Elmer / MorseMania) but **NOT named**
  per Travis. Brand-truth PASS.
- **Contact form DONE + VERIFIED (2026-06-29):** hCaptcha enabled in the Web3Forms dashboard
  (advanced filter + strict) + widget wired into `ContactForm.astro` (renders in hCaptcha's
  default LIGHT theme by choice — Travis likes the high-contrast white box; a data-theme match
  attempt had no effect and was removed;
  token rides along in the FormData submit). **End-to-end test PASSED** — real submission lands in
  `wiscoradio@gmail.com` (after a one-time Gmail "never spam" filter; from_name = "Wisco Radio
  Labs — Contact"). Fully working.
- **Go-live hardening DONE (2026-06-29):** meta-CSP in `BaseHead.astro` (allows self + web3forms +
  hcaptcha `*.hcaptcha.com` + youtube-nocookie + self-hosted fonts; `'unsafe-inline'` for
  script/style is deliberate — third parties inject inline, static site has no XSS sink;
  `frame-ancestors` not enforceable via meta — a CDN/proxy would be needed for that) + referrer
  policy; **Dependabot** version-updates (`npm` + `github-actions`, weekly, **majors ignored**) +
  **security alerts & automated-security-fixes ENABLED** on the repo (2026-06-29 — vulnerability
  monitoring was previously OFF; now on, auto-PRs real CVEs, bypasses ignore-majors). Standing
  `npm audit` noise = 7 dev-tooling advisories (esbuild dev-server Win-only, yaml in @astrojs/check)
  — unreachable by visitors, accepted (fix would force breaking Astro 7). deploy actions **SHA-pinned**;
  **/privacy page** (footer link, brand-truth PASS — honestly discloses Web3Forms + hCaptcha +
  the YouTube thumbnail-on-render). **⚠ Needs Travis's real-browser check: confirm hCaptcha still
  renders + submits under the CSP** (headless can't prove it; a wrong CSP domain breaks it silently).
- **TRUE remaining = domain day only:** register domain → set `site` + drop `base` in astro.config
  + add `public/CNAME` + **enable Enforce HTTPS in Pages** → flip `PREVIEW_NOINDEX=false` →
  (optional) wire cookieless analytics (Cloudflare Web Analytics rec; update the privacy page when
  added). That's the whole launch list now.
- **Optionals DONE (2026-06-29):** OG card now renders in the **brand fonts** (Space Grotesk +
  JetBrains Mono via committed `scripts/fonts/` + runtime FONTCONFIG_FILE) AND a **lattice tower**
  matching the logo (parametric truss in `generate-brand-assets.mjs`); **accessible screenshot
  lightbox** on Products (dialog reparented to `<body>` so `#main` inert doesn't disable it —
  Chrome-verified); **blog code-block copy button**; the Astro `markdown.remarkPlugins`
  deprecation cleared (now `markdown.processor: unified()`). **28 tests** (added remark-rewrite-links
  + content-schema, both biting). NOTE: `astro check` caches markdown render in `node_modules/.astro`
  — clean that when changing the remark plugin locally. Open: optional "activations/contacts"
  parallelism (cosmetic); Travis's on-device lightbox tap-check (nice-to-have).
- Travis's real-phone read-quality check (his standing bar).
