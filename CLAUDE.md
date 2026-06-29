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
  `website-marketing-plan.md`, `copy-voice-pass.md`, **`voice-style-guide.md`**.
- Known: harmless `markdown.remarkPlugins` deprecation warning on build (Astro 6) — migrate
  `remark-rewrite-links` to the `@astrojs/markdown-remark` API someday; not breaking.

## Status (2026-06-29) — v1 COMPLETE, MERGED TO MAIN, preview LIVE (noindex), domain pending
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
- **Needs Travis:** About **photo** (placeholder slot in place — one-line swap when supplied);
  real article content over time (one seed post shipped).
- **DONE 2026-06-29 (PR #2):** the honest **CW-learner framing** — Travis is NOT on the air with
  CW yet; he built the trainer to learn it. Shipped to the About bio + a **blog voice pass** that
  reframes "why this exists" around the integrated-QSO gap (existing trainers drill the pieces;
  none rehearse the full QSO) — competitors researched (Morse Elmer / MorseMania) but **NOT named**
  per Travis. Brand-truth PASS.
- **Go-live sequence (domain day):** register domain → set `site` + drop `base` in astro.config
  + add `public/CNAME` + enforce HTTPS → flip `PREVIEW_NOINDEX=false` → enable Web3Forms
  captcha/spam + **end-to-end form test** (submit → confirm it lands in Gmail) → wire analytics +
  privacy note → add meta-CSP, Dependabot, SHA-pin the deploy action.
- **Minor deferred:** remark-plugin/content-schema unit tests; blog code-block copy button;
  screenshot lightbox; optional "activations/contacts" parallelism across surfaces.
- Travis's real-phone read-quality check (his standing bar).
