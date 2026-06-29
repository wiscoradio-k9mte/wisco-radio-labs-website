# Wisco Radio Labs — Layouts & Wireframes

Page structure, hierarchy, reading order, and responsive reflow for the five
sections. Read with **`design-system.md`** (tokens + components). Wireframes are
ASCII — they fix *structure and order*, not pixels. Desktop and mobile are both
shown for the three reading-critical pages (Home, Article, Blog index); the other
three describe their reflow in prose + one wireframe.

**Container:** content max-width **1100px**, centered, with `clamp(1rem, 4vw,
2rem)` side gutters. The article column is narrower (**68ch ≈ ~720px**). Nothing
runs full-bleed except the optional hero band and section background tints.

---

## 1. Responsive breakpoints

Mobile-first CSS; these are the reflow points (content-driven, not device-driven):

| Token | Width | What changes |
|---|---|---|
| (base) | <480px | single column, drawer nav, stacked everything, full-width buttons |
| `sm` | ≥480px | larger type step engages, cards gain side padding |
| `md` | ≥768px | **desktop nav appears (drawer retires)**, post cards go 2-up, header inline |
| `lg` | ≥1024px | post cards 3-up where shown, Home hero goes side-by-side, footer row |
| `xl` | ≥1280px | container hits max, generous gutters; no new layout |

Single source of truth for "is the desktop nav showing": **≥768px**. The mobile
drawer and the inline nav are the *same 5 links* — don't build two navs that drift.

---

## 2. Home

Purpose (from brief): say what Wisco Radio Labs *is*, show the **latest posts**,
and tease the **featured product** (CW Trainer). No widget wall.

### 2.1 Home — desktop (≥1024px)

```
┌───────────────────────────────────────────────────────────┐
│ [badge] Wisco Radio Labs   Home Blog Products About Contact  ☾ │  sticky header
├───────────────────────────────────────────────────────────┤
│                                                             │
│  EYEBROW: MADE IN THE DRIFTLESS          ┌───────────────┐  │
│  Ham radio, built in the open.           │               │  │
│  (Hero H1, Space Grotesk 700)            │   logo badge   │  │
│  One-sentence what-this-is, --text-      │   (large, or   │  │
│  secondary, ~2 lines, 50ch.              │   tower mark)  │  │
│  [ Read the blog ]  [ See the CW Trainer ]│               │  │
│                                          └───────────────┘  │
│                                                             │
├───────────────────────────────────────────────────────────┤
│  EYEBROW: LATEST FROM THE BENCH            [ All posts → ]   │
│  ┌─────────┐  ┌─────────┐  ┌─────────┐                      │
│  │ card    │  │ card    │  │ card    │   ← 3-up post cards   │
│  └─────────┘  └─────────┘  └─────────┘                      │
├───────────────────────────────────────────────────────────┤
│  ┌───────────────────────────────────────────────────────┐ │
│  │ [ CW Trainer banner image ]                           │ │  featured
│  │ EYEBROW: FEATURED PROJECT                             │ │  product
│  │ CW Trainer — learn Morse the way hams use it          │ │  teaser
│  │ short blurb · `snap install wr-cw-trainer`            │ │  (full-width
│  │ [ View the CW Trainer → ]                             │ │   panel,
│  └───────────────────────────────────────────────────────┘ │   surface-1)
├───────────────────────────────────────────────────────────┤
│  FOOTER (badge · nav · contact/RSS · © Made in the Driftless)│
└───────────────────────────────────────────────────────────┘
```

Reading order (DOM = visual): header → hero heading → hero copy → hero CTAs → logo
(decorative, after text in DOM) → latest-posts heading → cards → product teaser →
footer. The hero image is **decorative** (`alt=""`) since the wordmark is text.

### 2.2 Home — mobile (<768px)

```
┌─────────────────────────────┐
│ [badge] Wisco…   ☾  [ Menu ]│  sticky
├─────────────────────────────┤
│        [ logo badge ]       │  centered, ~140px
│ EYEBROW: MADE IN THE DRIFT…  │
│ Ham radio, built in the      │
│ open. (Hero H1)              │
│ one-sentence what-this-is    │
│ [ Read the blog ]           │  full-width
│ [ See the CW Trainer ]      │  full-width, stacked
├─────────────────────────────┤
│ EYEBROW: LATEST FROM THE BENCH│
│ ┌─────────────────────────┐ │
│ │ card                    │ │  1-up, stacked
│ └─────────────────────────┘ │
│ ┌─────────────────────────┐ │
│ │ card                    │ │
│ └─────────────────────────┘ │
│        [ All posts → ]      │
├─────────────────────────────┤
│ ┌─────────────────────────┐ │
│ │ [ CW Trainer banner ]   │ │  product teaser
│ │ FEATURED PROJECT        │ │  stacked
│ │ CW Trainer …            │ │
│ │ [ View the CW Trainer ] │ │
│ └─────────────────────────┘ │
├─────────────────────────────┤
│ FOOTER (stacked groups)     │
└─────────────────────────────┘
```
On mobile the logo moves **above** the heading (centered) so the brand face is the
first thing seen; CTAs go full-width and stack with `--space-3` between (≥48px,
spaced). Show 2–3 latest cards, then "All posts →".

---

## 3. Blog index

Purpose: clean card list; category access **without a widget wall**. One filter
row, not a sidebar.

### 3.1 Blog index — desktop (≥768px)

```
┌───────────────────────────────────────────────────────────┐
│  HEADER + NAV                                               │
├───────────────────────────────────────────────────────────┤
│  H1: Blog                                                   │
│  Lead: what Travis writes about, one line, --text-secondary │
│                                                             │
│  [ All ] [ Builds ] [ CW ] [ Antennas ] [ Field ]  🔎       │  filter row
│   ↑ category chips (toggle) ............... search (optional)│  (wraps, no sidebar)
├───────────────────────────────────────────────────────────┤
│  ┌───────────┐  ┌───────────┐                              │
│  │ post card │  │ post card │     ← 2-up (3-up ≥1024px)     │
│  └───────────┘  └───────────┘                              │
│  ┌───────────┐  ┌───────────┐                              │
│  │ post card │  │ post card │                              │
│  └───────────┘  └───────────┘                              │
│                                                             │
│            [ ← Newer ]   Page 2 of 5   [ Older → ]          │  or "Load more"
├───────────────────────────────────────────────────────────┤
│  FOOTER                                                     │
└───────────────────────────────────────────────────────────┘
```

- **Categories live in the filter row** (chips, §5.6 of design-system), not a
  sidebar. Active chip = amber, `aria-pressed`. Filtering is progressive
  enhancement: the chips are real links to `/blog/category/<x>/` (Astro static
  routes) so it works with no JS; a React island can filter client-side on top.
- **Search** is optional for v1 (the brief wants *one* uncluttered place, not a
  mandate). If included, a single input here — not a persistent widget. If omitted,
  drop it cleanly; categories + good titles carry discovery at this scale.
- **Empty state** (a category with no posts yet): a calm panel — "No posts here
  yet. Check back, or read the latest →" — never a blank grid.
- **Pagination**: prev/next + page count, or a "Load more" button (≥48px). Don't
  infinite-scroll (hurts footer reach + back-button).

### 3.2 Blog index — mobile (<768px)

```
┌─────────────────────────────┐
│ HEADER  ☾ [ Menu ]          │
├─────────────────────────────┤
│ H1: Blog                    │
│ lead line                   │
│ [All][Builds][CW][Antennas] │  chips wrap to 2 rows,
│ [Field]                  🔎 │  horizontally scrollable if long
├─────────────────────────────┤
│ ┌─────────────────────────┐ │
│ │ post card               │ │  1-up stacked
│ └─────────────────────────┘ │
│ ┌─────────────────────────┐ │
│ │ post card               │ │
│ └─────────────────────────┘ │
│        [ Load more ]        │
├─────────────────────────────┤
│ FOOTER                      │
└─────────────────────────────┘
```
Chips: a single horizontally-scrollable row OR wrap to 2 rows — either way each
chip keeps a ≥48px tap height. Cards 1-up. This is the qrper.com fix: where they
have a dense sidebar, we have one calm filter row and a column of generous cards.

---

## 4. Blog article — THE reading template (most important screen)

This is where the brand wins or loses: most visitors read here, on a phone. Single
narrow column, big readable type, lots of air.

### 4.1 Article — mobile (<768px) — design this first

```
┌─────────────────────────────┐
│ HEADER  ☾ [ Menu ]          │
├─────────────────────────────┤
│ EYEBROW: BUILDS  (category)  │  amber, wide-tracked
│                             │
│ Article Title That May       │  H1, --fs-h1, Space Grotesk 700,
│ Run Two or Three Lines       │  line-height 1.12
│                             │
│ Jun 28, 2026 · 6 min · K9MTE │  meta, --text-muted, --fs-small
│                             │
│ ┌─────────────────────────┐ │
│ │ [ featured image 16:9 ] │ │  full column width, radius-md
│ └─────────────────────────┘ │
│ caption (muted, centered)   │
│                             │
│ Lead paragraph, slightly     │  --fs-h4/1.6, --text-secondary
│ larger, sets up the piece.   │
│                             │
│ Body paragraph at 16–18px,   │  --fs-body / 1.7, --text
│ line-height 1.7, measure     │  measure = full column (~36–40ch
│ comfortable on a phone.      │  on a phone — that's correct;
│ Links are underlined amber.  │  68ch cap only bites on desktop)
│                             │
│ ## Section heading           │  H2
│ more body…                   │
│                             │
│ ┌─────────────────────────┐ │
│ │ ▶  [ YouTube facade ]   │ │  click-to-load, 16:9
│ └─────────────────────────┘ │
│                             │
│ > blockquote, amber rule     │
│                             │
│ `inline code` and:           │
│ ┌─────────────────────────┐ │
│ │ snap install wr-cw-train…│ │  code block, mono, scroll-x
│ └─────────────────────────┘ │
│                             │
│ ─────────────────────────── │  hr
│ Tags: [CW] [Koch] [practice] │  non-interactive or link to category
│                             │
│ ┌─────────────────────────┐ │
│ │ ← Prev post │ Next post →│ │  prev/next nav (≥48px each)
│ └─────────────────────────┘ │
├─────────────────────────────┤
│ FOOTER                      │
└─────────────────────────────┘
```

Mobile reading rules (acceptance criteria):
- Body **≥16px** (scales to 18px), **line-height 1.7**, paragraph gap `--space-5`.
- Side gutters `clamp(1rem, 4vw, 2rem)` — text never touches the edge.
- Images full-width, lazy, `radius-md`; captions muted + centered.
- Tap targets (links in flowing text are exempt from 48px, but **prev/next, tags-
  as-links, the YouTube facade, and any button are ≥48px**).
- No sticky header overlap: tapped in-page anchors land below the header
  (`scroll-padding-top`).

### 4.2 Article — desktop (≥768px)

Same single column, **centered, capped at 68ch**, on `--bg` (no card, no sidebar —
deliberately *unlike* qrper). The header/footer span full width; the article body
is an island of calm in the middle.

```
┌───────────────────────────────────────────────────────────┐
│  HEADER + NAV                                               │
├───────────────────────────────────────────────────────────┤
│            ┌───────────────────────────────┐                │
│            │ EYEBROW: BUILDS               │                │
│            │ Article Title                 │  ← 68ch column │
│            │ Jun 28 · 6 min · K9MTE        │     centered   │
│            │ [ featured image, may bleed   │                │
│            │   to ~76ch ]                  │                │
│            │ Lead paragraph…               │                │
│            │ Body… (measure ~68ch — the    │                │
│            │ comfortable line length)      │                │
│            │ ## Heading                    │                │
│            │ … YouTube facade … quote …    │                │
│            │ ─ tags ─ prev/next ─          │                │
│            └───────────────────────────────┘                │
│  (generous empty margins left + right — let it breathe)     │
├───────────────────────────────────────────────────────────┤
│  FOOTER                                                     │
└───────────────────────────────────────────────────────────┘
```

Optional desktop nicety (only if cheap): a slim, **non-sticky or quietly-sticky**
table-of-contents in the left margin built from H2s — but **default to none** for
v1. The brief's whole thesis is *less clutter*; an empty margin is a feature, not a
gap to fill. If added, it must collapse entirely below `lg` and never on mobile.

---

## 5. Products — CW Trainer detail

Purpose (brief): what it is, where to get it (`snap install wr-cw-trainer`), how to
use it now, future plans. Reuse the CW Trainer **banner + screenshots**
(`../CW-Trainer/build/screenshots/WiscoRadioLabs-*.png`).

### 5.1 Products — desktop

```
┌───────────────────────────────────────────────────────────┐
│  HEADER + NAV                                               │
├───────────────────────────────────────────────────────────┤
│  ┌───────────────────────────────────────────────────────┐ │
│  │ [ WiscoRadioLabs-Banner.png — 3:1 hero banner ]       │ │  banner
│  └───────────────────────────────────────────────────────┘ │
│  EYEBROW: WISCO RADIO LABS · PRODUCT                         │
│  CW Trainer  (H1)                                           │
│  Learn Morse the way hams actually use it. (lead)           │
│  🟢 Live on the Snap Store · v2.3.0 · free & open source    │  status row
│                                                             │
│  ┌─────────────────────────────────────┐                   │
│  │ Get it:                             │   ← install card   │
│  │  snap install wr-cw-trainer         │   (mono, copy btn) │
│  │ [ View on the Snap Store → ]        │                   │
│  └─────────────────────────────────────┘                   │
├───────────────────────────────────────────────────────────┤
│  H2: What it is                                             │
│  2–3 short paras: Koch lessons, copy & sending practice,    │
│  QSO simulator, fully offline, no account.                  │
├───────────────────────────────────────────────────────────┤
│  H2: A look inside           ┌──────┐ ┌──────┐ ┌──────┐     │
│  (screenshot gallery)        │Learn │ │ Key  │ │ QSO  │ …   │  3–4 shots,
│                              └──────┘ └──────┘ └──────┘     │  click → lightbox
├───────────────────────────────────────────────────────────┤
│  H2: How to use it now                                      │
│  Short numbered start: install → pick a lesson → drill →    │
│  practice sending → try a QSO. (ordered list)               │
├───────────────────────────────────────────────────────────┤
│  H2: Where it's headed                                      │
│  Future plans: Windows / macOS / mobile (Capacitor),        │
│  framed honestly as roadmap — no shipped-feature claims.    │
├───────────────────────────────────────────────────────────┤
│  FOOTER                                                     │
└───────────────────────────────────────────────────────────┘
```

### 5.2 Products — mobile

Banner first (full-width, keeps 3:1 or crops to a safe focal — banner art has the
badge on the right, so center-crop is safe). Then H1, lead, the **green status
line**, then the **install card** (the `snap install` command in mono with a Copy
button, ≥48px) — this is the page's primary action, keep it high. Then the
sections stack: What it is → screenshots (1-up carousel or stacked, each
tappable) → How to use → Where it's headed. Screenshots get **real `alt`**
describing the screen ("CW Trainer LEARN tab showing the Koch lesson and character
chart").

> Facts are sourced from `../CW-Trainer/CLAUDE.md` and must stay true: 🟢 LIVE,
> v2.3.0, Snap Store, `snap install wr-cw-trainer`, free/GPL-3.0, fully offline, no
> account. **Do not claim Windows/macOS/mobile as available** — they're roadmap.

---

## 6. About

Purpose: intro to Travis, background, why he started Wisco Radio Labs. **A photo is
pending** — leave a clearly-marked slot.

```
┌───────────────────────────────────────────────────────────┐
│  HEADER + NAV                                               │
├───────────────────────────────────────────────────────────┤
│  ┌───────────────┐   EYEBROW: MADE IN THE DRIFTLESS         │
│  │   [ PHOTO     │   H1: About Wisco Radio Labs             │
│  │     PENDING ] │   Lead: one line on who/why              │
│  │   slot, 4:5,  │                                          │
│  │   radius-md   │   Body (68ch): Travis Engh, K9MTE.       │
│  └───────────────┘   Military-maintenance discipline +      │
│                      a maker's instinct. Why the Labs       │
│                      exists; what "Made in the Driftless"   │
│   (desktop: photo    means; what he's building.             │
│    left, text right; │                                      │
│    mobile: photo top,│  [ Read the blog ] [ Get in touch ]  │
│    text below)       │                                      │
├───────────────────────────────────────────────────────────┤
│  FOOTER                                                     │
└───────────────────────────────────────────────────────────┘
```

- **Photo slot spec:** 4:5 portrait, `--radius-md`, `1px --border`. Until the photo
  arrives, render a **branded placeholder** — the tower mark on `--surface-2` with
  a small "Photo coming soon" caption, NOT a gray box or broken image. Mark it in
  the implementation with a clear `TODO: replace with Travis's photo` and a single
  swap point. `alt` when real: "Travis Engh, K9MTE, in his workshop" (Travis can
  refine).
- Mobile: photo on top (centered, ~70% width), text below. Desktop: 2-col, photo
  left ~38%, text right; both vertically centered.

---

## 7. Contact

Purpose: the form (§5.9 of design-system) **plus** email, social, and QRZ links.

```
┌───────────────────────────────────────────────────────────┐
│  HEADER + NAV                                               │
├───────────────────────────────────────────────────────────┤
│  H1: Get in touch                                          │
│  Lead: "Questions, ideas, a bug in the CW Trainer? …"      │
│                                                             │
│  ┌─────────────────────────┐   ┌───────────────────────┐   │
│  │ FORM                    │   │ Other ways to reach me │   │
│  │  Name      [_________]  │   │  ✉  email@…           │   │
│  │  Email     [_________]  │   │  📻 QRZ: K9MTE         │   │
│  │  Subject   [_________]  │   │  ▶  YouTube            │   │
│  │  Message   [_________]  │   │  (social links…)       │   │
│  │            [_________]  │   │                       │   │
│  │  [ Send message ]       │   │  Each row ≥48px,       │   │
│  └─────────────────────────┘   │  icon + label          │   │
│                                └───────────────────────┘   │
├───────────────────────────────────────────────────────────┤
│  FOOTER                                                     │
└───────────────────────────────────────────────────────────┘
```

- Desktop: form left (~60%), contact links right (~40%). Mobile: form first
  (it's the primary action), links below — both full-width, stacked.
- Exact email / social / QRZ URLs are **pending from Travis** (open decision in the
  brief). Spec a single config/data file the implementer fills in; render only the
  links that exist (don't ship empty social icons).
- The `role="status"` success / `role="alert"` error states live on the form per
  §5.9. Always offer the **mailto fallback** in the error state so a service outage
  never strands a message.

---

## 8. Reflow summary (how each page collapses)

| Page | Desktop | → Mobile |
|---|---|---|
| Home | hero side-by-side; cards 3-up; product teaser row | logo-on-top hero, full-width CTAs; cards 1-up; teaser stacked |
| Blog index | filter row + 2/3-up cards | scrollable chip row + 1-up cards |
| Article | 68ch centered column, wide margins | full-width single column, 16px+/1.7 |
| Products | banner + install card + gallery | banner → status → install card → stacked sections |
| About | photo left / text right | photo top / text below |
| Contact | form left / links right | form → links, stacked |
| Header | inline 5-item nav + toggle | logo + toggle + Menu drawer |
| Footer | 3 groups in a row | 3 groups stacked |

---

## 9. Accessibility — consolidated (POUR)

This is part of every spec above, gathered here as the handoff checklist. AA is the
floor, in **both themes**.

**Perceivable**
- **Contrast (AA):** every text/background pair in `design-system.md` §2 is ≥4.5:1
  for body and ≥3:1 for large text/UI — numbers are stated there. Muted text is the
  thinnest at 4.67:1 (dark, on surface-1) / 5.14:1 (light) — still AA; reserve it
  for non-essential meta, never primary content.
- **Never color alone:** links are underlined; form errors carry text + icon;
  active nav has an underline not just a hue; the theme toggle swaps the glyph, not
  just a color; selected chips change shape/fill + `aria-pressed`.
- **Alt text:** decorative images (`alt=""`) — the hero logo (wordmark is real
  text), card images that merely repeat the title. Content images get descriptive
  alt: blog photos describe the scene; product screenshots describe the screen +
  tab; the About photo describes Travis. YouTube facades use the video title.
  Captions via `<figcaption>`.
- **`<meta name="theme-color">`** set per theme; favicon/app icons from the badge.

**Operable**
- **Keyboard:** every interactive element reachable and operable by keyboard in a
  logical order (DOM = visual order on every page above). The **drawer traps focus
  and Esc-closes back to the Menu button**; the **theme toggle** is a real button;
  the **YouTube facade** is a button/link; **form** is fully keyboard-operable.
- **Focus visible:** 3px `--focus-ring` + 2px offset on *everything* interactive
  via `:focus-visible`. Never `outline:none` without a stronger replacement.
- **Tap targets ≥48×48px**, ≥8px apart: nav links, Menu/close, theme toggle,
  buttons, links-as-buttons, chips-as-filters, prev/next, footer/contact rows,
  copy buttons, the play facade. (Inline links within running prose are exempt.)
- **Skip link:** a "Skip to content" link, first in tab order, visible on focus,
  jumping to `<main id="main">`.
- **Reduced motion:** the global `prefers-reduced-motion` block (design-system
  §4.4) kills transitions/transforms; drawer + theme + card/image scale + skeleton
  pulse all degrade to instant/static. No autoplaying motion anywhere.
- **Sticky-header offset:** `scroll-padding-top` so in-page anchors aren't hidden.

**Understandable**
- `<html lang="en">` on every page (prevents the common missing-language failure).
- Consistent nav + layout across pages; the 5 sections never reorder or rename.
- Form labels always visible (no placeholder-as-label); required marked in text;
  errors say what's wrong and how to fix ("Enter a valid email address"); focus
  moves to the first invalid field; success/error use `role="status"`/`role="alert"`.
- Plain language; gloss ham jargon on first use (CW, Koch, QSO) for newcomers.

**Robust**
- Semantic landmarks: one `<header>`, `<nav aria-label="Primary">`, `<main>`,
  `<footer>` per page; articles in `<article>`; the drawer is a labelled
  `role="dialog" aria-modal="true"`.
- Headings nest properly (one H1 per page, no skipped levels).
- Progressive enhancement: nav, category filters, YouTube facade, and the contact
  form all degrade to working HTML without JS (Astro static + tiny islands). Speed
  is the retention edge on phones — keep JS near-zero by default.

**What only the human can verify** (state plainly at handoff; don't claim these are
checked): the amber matches the logo on a real display; the dark theme is
comfortable in a dim shack and the light theme in daylight; the redesign "feels
right" against qrper.com as the beat-this reference; final real-device contrast of
the live amber; a real screen-reader pass (Travis is the primary user — defer to
his call on when that's worth doing, consistent with the CW Trainer stance).
