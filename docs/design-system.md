# Wisco Radio Labs — Design System

Design intent for the K9MTE / Wisco Radio Labs website. This is the spec the
implementer builds against — **design intent, not production code.** Token names
are a proposal to align with the architect; the **values are the load-bearing
part.** Every contrast ratio below was computed against the WCAG 2.1 relative-
luminance formula and is stated as a number so it can be verified, not assumed.

> **What the human must verify on a real screen** (a headless team cannot judge
> these): that the amber actually *feels* like the logo on his display; that the
> dark theme reads comfortably in a dim room and the light theme in daylight; and
> the redesign's overall "does it look right." The contrast math below is sound;
> the *taste* call is Travis's. See [Accessibility](#9-accessibility-consolidated).

---

## 1. Design language & mood

**One line:** clean, legible, honest, a little understated — a maker's bench, not
a billboard. Earn attention with clarity and craft, not flash.

The logo is the whole brief in a badge: a near-black field, a warm amber wordmark,
a gray tower throwing amber signal waves, "MADE IN THE DRIFTLESS" set small and
calm around the rim. The site is that badge expanded to a page:

- **Dark charcoal field by default** — the logo's home, and what hams read at
  night and in the shack. Amber is the single accent; it does the work the signal
  waves do — it points, it never shouts.
- **Generous whitespace, no widget wall.** The explicit beat-qrper.com goal: no
  sidebar of search + category sprawl + archives + affiliate boxes. One column of
  air, strong featured images, articles that breathe. Research the brief cites:
  whitespace ≈ +20% comprehension; a ~65–75-character measure is the readable one.
- **Quiet structure.** Thin borders and flat surfaces over heavy shadows and
  gradients (shadows are nearly invisible on a dark field anyway — so dark mode
  leans on *borders + surface lifts*, light mode adds soft shadow). Modest radii.
  Nothing decorative that the next person has to maintain.
- **Technical, not cold.** A geometric display face with engineering character for
  headings; a workhorse screen face for body; a mono for code, callsigns, and
  commands (`snap install …`). It should read like it was made by someone who
  builds radios, because it was.

Restraint is the brand. When in doubt, remove.

---

## 2. Color tokens

Themed via CSS custom properties + a class/attribute on `<html>` (proposal:
`:root` = dark default, `:root[data-theme="light"]` = light). **Dark is the
default — it ships with no class set.**

Two kinds of orange, on purpose:
- **`--brand`** `#E8821E` — the logo amber. Used for **fills and graphic
  identity** (button fills, the active-nav underline, the focus ring base, icon
  accents). It is a *surface* color, not a text-on-background color.
- **`--brand-ink`** — orange used as **text or as a link on the page background.**
  This **must differ per theme** because amber-on-white fails contrast. Dark uses
  the logo amber directly (it passes); light uses a **burnt orange**. This split
  is the single most important accessibility decision in the palette.

### 2.1 Dark theme (default)

| Token | Value | Role | Contrast (against) | Ratio |
|---|---|---|---|---|
| `--bg` | `#0F1115` | page field | — | — |
| `--surface-1` | `#181B22` | cards, header, footer | vs `--bg` | 1.97:1 lift |
| `--surface-2` | `#21252E` | inputs, code, raised | vs `--bg` | — |
| `--text` | `#E8EAED` | body / headings | on `--bg` / `--surface-1` | **15.67:1 / 14.29:1** |
| `--text-secondary` | `#A9B2C0` | sub-text, meta | on `--bg` / `--surface-1` | **8.83:1 / 8.05:1** |
| `--text-muted` | `#7C8694` | captions, disabled-ish | on `--bg` / `--surface-1` | **5.12:1 / 4.67:1** |
| `--brand` | `#E8821E` | fills, identity | (non-text / large) on `--bg` | **6.88:1** |
| `--brand-ink` | `#E8821E` | links, inline accent text | on `--bg` | **6.88:1** (≥4.5 body ✓) |
| `--brand-hover` | `#F59E2C` | link/button hover | on `--bg` | **8.83:1** |
| `--brand-active` | `#D2730F` | pressed | on `--bg` | ~5.6:1 |
| `--on-brand` | `#1A1411` | text on amber fills | on `--brand` | **6.16:1** |
| `--border` | `#2A2F3A` | hairlines, card edges | (non-text) | — |
| `--border-strong` | `#3A4150` | input edges, dividers | (non-text, vs surface) | ≥3:1 ✓ |
| `--link` | `var(--brand-ink)` | inline links | on `--bg` | 6.88:1 |
| `--focus-ring` | `#F59E2C` | focus outline | on `--bg` / `--surface` | ≥8:1 / ≥3:1 ✓ |
| `--success` | `#56C98D` | form success | on `--bg` | **9.12:1** |
| `--error` | `#F4776B` | form error | on `--bg` | **6.93:1** |

### 2.2 Light theme (`[data-theme="light"]`)

| Token | Value | Role | Contrast (against) | Ratio |
|---|---|---|---|---|
| `--bg` | `#F7F4EF` | warm paper field | — | — |
| `--surface-1` | `#FFFFFF` | cards, header, footer | vs `--bg` | subtle lift |
| `--surface-2` | `#F0ECE4` | inputs, code, raised | vs `--bg` | — |
| `--text` | `#1A1D23` | body / headings | on `--bg` | **15.39:1** |
| `--text-secondary` | `#4A515E` | sub-text, meta | on `--bg` | **7.28:1** |
| `--text-muted` | `#5F6875` | captions | on `--bg` | **5.14:1** |
| `--brand` | `#E8821E` | fills, identity | (non-text / large) | use with border |
| `--brand-ink` | `#A14E0B` | links, inline accent text | on `--bg` | **5.30:1** (≥4.5 ✓) |
| `--brand-hover` | `#8A4309` | link/button hover | on `--bg` | ~7:1 |
| `--brand-active` | `#733908` | pressed | on `--bg` | ~9:1 |
| `--on-brand` | `#1A1411` | text on amber fills | on `--brand` | **6.16:1** |
| `--border` | `#E4DED4` | hairlines, card edges | (non-text) | — |
| `--border-strong` | `#D0C6B6` | input edges, dividers | (non-text) | ≥3:1 ✓ |
| `--link` | `var(--brand-ink)` | inline links | on `--bg` | 5.30:1 |
| `--focus-ring` | `#A14E0B` | focus outline | on `--bg` | 5.30:1 ✓ |
| `--success` | `#1E7D4F` | form success | on `--bg` | **4.67:1** |
| `--error` | `#C2362B` | form error | on `--bg` | **4.96:1** |

**Shared / non-themed:**
- `--brand-tint` — a low-alpha amber wash for hover backgrounds and the
  active-nav pill. Use `rgba(232,130,30,0.12)` on dark, `rgba(232,130,30,0.10)`
  on light. (Alpha, so it composites correctly over either field.)
- Primary-button fill on **light** is amber on near-white: the *boundary* contrast
  is ~2.5:1 (below the 3:1 UI rule), so in light mode the primary button **must
  carry a 1px `#B5560E` border** so its edge is perceivable. Dark mode needs no
  such border (amber on charcoal is 6.88:1).

### 2.3 Reference token block (implementer starting point)

```css
:root {                      /* DARK — default, no attribute */
  --bg:#0F1115;  --surface-1:#181B22;  --surface-2:#21252E;
  --text:#E8EAED;  --text-secondary:#A9B2C0;  --text-muted:#7C8694;
  --brand:#E8821E;  --brand-ink:#E8821E;  --brand-hover:#F59E2C;
  --brand-active:#D2730F;  --on-brand:#1A1411;
  --border:#2A2F3A;  --border-strong:#3A4150;
  --link:var(--brand-ink);  --focus-ring:#F59E2C;
  --success:#56C98D;  --error:#F4776B;
  --brand-tint:rgba(232,130,30,0.12);
}
:root[data-theme="light"] {
  --bg:#F7F4EF;  --surface-1:#FFFFFF;  --surface-2:#F0ECE4;
  --text:#1A1D23;  --text-secondary:#4A515E;  --text-muted:#5F6875;
  --brand:#E8821E;  --brand-ink:#A14E0B;  --brand-hover:#8A4309;
  --brand-active:#733908;  --on-brand:#1A1411;
  --border:#E4DED4;  --border-strong:#D0C6B6;
  --link:var(--brand-ink);  --focus-ring:#A14E0B;
  --success:#1E7D4F;  --error:#C2362B;
  --brand-tint:rgba(232,130,30,0.10);
}
```

> **No-FOUC note:** set the theme attribute from an inline `<head>` script before
> first paint (read `localStorage`, fall back to `prefers-color-scheme`). Otherwise
> a light-default flash hits dark-theme users on every load. Also set
> `<meta name="theme-color">` per theme so the mobile browser chrome matches.

---

## 3. Typography

All faces are **Google Fonts, variable, free, and self-hostable** (self-host via
`@fontsource` or Astro's font pipeline for speed + privacy — no third-party
request, which fits the privacy-friendly-analytics intent).

| Role | Family | Fallback stack | Why |
|---|---|---|---|
| Display / headings | **Space Grotesk** | `"Space Grotesk", "Segoe UI", system-ui, sans-serif` | Geometric, technical character with subtle quirks — reads "engineered." Echoes the logo's confident sans without being a novelty face. |
| Body / UI | **Inter** | `Inter, system-ui, -apple-system, "Segoe UI", Roboto, sans-serif` | The most battle-tested screen face for long reading on phones; tall x-height, excellent at 16px. |
| Mono | **JetBrains Mono** | `"JetBrains Mono", ui-monospace, "SF Mono", Menlo, Consolas, monospace` | Code blocks, inline code, **callsigns, frequencies, and commands** (`snap install wr-cw-trainer`). Clear `0/O`, `1/l/I`. |

Load only the weights used: Space Grotesk **500 / 700**; Inter **400 / 500 / 600**;
JetBrains Mono **400 / 500**. Use `font-display: swap` and preload the body 400.

### 3.1 Fluid type scale

Base is **16px minimum, scaling to ~18px** on large screens — body never drops
below 16px on a phone. Modular scale ≈1.2 (mobile) → 1.25 (desktop) via `clamp()`.

```css
:root{
  --fs-caption: clamp(0.78rem, 0.74rem + 0.2vw, 0.86rem);  /* 12.5–13.8px */
  --fs-small:   clamp(0.88rem, 0.85rem + 0.2vw, 0.95rem);  /* 14–15px    */
  --fs-body:    clamp(1.00rem, 0.96rem + 0.3vw, 1.125rem); /* 16–18px    */
  --fs-h4:      clamp(1.12rem, 1.05rem + 0.4vw, 1.25rem);  /* 18–20px    */
  --fs-h3:      clamp(1.35rem, 1.20rem + 0.7vw, 1.62rem);  /* 21.6–26px  */
  --fs-h2:      clamp(1.65rem, 1.40rem + 1.1vw, 2.15rem);  /* 26–34px    */
  --fs-h1:      clamp(2.05rem, 1.65rem + 1.9vw, 2.95rem);  /* 33–47px    */
  --fs-hero:    clamp(2.6rem,  1.9rem  + 3.2vw, 4.2rem);   /* 42–67px    */
}
```

| Element | Size | Weight | Line-height | Tracking | Family |
|---|---|---|---|---|---|
| Hero H1 | `--fs-hero` | 700 | 1.05 | -0.02em | Space Grotesk |
| H1 (page) | `--fs-h1` | 700 | 1.12 | -0.015em | Space Grotesk |
| H2 | `--fs-h2` | 700 | 1.18 | -0.01em | Space Grotesk |
| H3 | `--fs-h3` | 500 | 1.25 | -0.005em | Space Grotesk |
| H4 | `--fs-h4` | 500 | 1.3 | 0 | Space Grotesk |
| Body | `--fs-body` | 400 | **1.7** | 0 | Inter |
| Lead / intro | `--fs-h4` | 400 | 1.6 | 0 | Inter |
| Small / meta | `--fs-small` | 500 | 1.5 | 0 | Inter |
| Caption | `--fs-caption` | 400 | 1.45 | 0.01em | Inter |
| Eyebrow / label | `--fs-caption` | 600 | 1.2 | **0.12em**, uppercase | Space Grotesk |
| Code | `--fs-small` | 400 | 1.6 | 0 | JetBrains Mono |

The **eyebrow** (uppercase, wide-tracked, amber or muted) is the recurring brand
device — it's the "WISCO RADIO LABS / MADE IN THE DRIFTLESS" treatment from the
logo, reused as section kickers ("CW TRAINER", "LATEST FROM THE BENCH"). Use it
sparingly.

**Reading measure:** body copy and the article column cap at **68ch**
(`max-width: 68ch`). Headings may run slightly wider (to ~76ch) so they don't wrap
awkwardly.

---

## 4. Spacing, radius, border, shadow, motion

### 4.1 Spacing scale (4px base, rem-expressed)

```css
--space-1:0.25rem; --space-2:0.5rem;  --space-3:0.75rem; --space-4:1rem;
--space-5:1.5rem;  --space-6:2rem;    --space-8:3rem;    --space-10:4rem;
--space-12:6rem;   --space-16:8rem;
```
Rhythm: in-component padding uses 1–4; between stacked elements 4–5; between
sections 8–12 (mobile) / 12–16 (desktop). Section vertical padding:
`clamp(3rem, 6vw, 6rem)`.

### 4.2 Radius

```css
--radius-sm:6px;   /* chips, inputs, small buttons   */
--radius-md:10px;  /* cards, buttons, embeds         */
--radius-lg:16px;  /* hero panels, feature cards     */
--radius-pill:999px; /* tags, theme toggle, nav pill */
```

### 4.3 Border & shadow

- Hairline: `1px solid var(--border)`. Inputs/dividers: `var(--border-strong)`.
- **Dark mode = borders + surface lift, not shadow** (shadows vanish on charcoal).
- **Light mode shadows** (soft, warm-neutral, never harsh black):
  ```css
  --shadow-sm: 0 1px 2px rgba(40,30,15,0.06);
  --shadow-md: 0 4px 14px rgba(40,30,15,0.08);
  --shadow-lg: 0 12px 32px rgba(40,30,15,0.10);
  ```
  In dark mode set these to `none` (or a near-invisible `0 1px 0 rgba(0,0,0,0.4)`)
  and let `--border` carry separation.

### 4.4 Motion

- Default transition: `150ms ease` (color, background, border, transform, opacity).
  Drawer slide / theme cross-fade: `200–240ms ease`.
- **`prefers-reduced-motion: reduce`** → set all transition/animation durations to
  `0.01ms` and remove transforms/slides (drawer appears/disappears instantly; no
  parallax, no auto-animating anything). One global block handles it:
  ```css
  @media (prefers-reduced-motion: reduce){
    *,*::before,*::after{ animation-duration:.01ms!important;
      animation-iteration-count:1!important; transition-duration:.01ms!important;
      scroll-behavior:auto!important; }
  }
  ```

---

## 5. Components — states & a11y

Every interactive component is specced with **rest / hover / focus-visible /
active / disabled** (plus empty / loading / error where it applies). **All tap
targets are ≥48×48px** with ≥8px spacing between adjacent targets. Focus is
**always `:focus-visible`** with a 3px `--focus-ring` outline + 2px offset — never
`outline:none` without a replacement.

### 5.1 Header + primary nav (5 items: Home · Blog · Products · About · Contact)

**Desktop (≥768px):** sticky top bar on `--surface-1`, `1px` bottom `--border`.
Left: logo badge (40px) + "Wisco Radio Labs" wordmark (Space Grotesk 500), the
whole thing a link to Home. Right: 5 nav links + theme toggle. Nav links are
≥48px tall, padded `--space-3` horizontally.

| State | Treatment |
|---|---|
| Rest | `--text-secondary`, no underline |
| Hover | `--text`, 2px `--brand` underline animates in (instant under reduced-motion) |
| Focus-visible | 3px `--focus-ring` outline, 2px offset, radius-sm |
| Active page | `--text`, persistent 2px `--brand` underline; `aria-current="page"` |
| Pressed | `--brand-active` text |

Semantics: `<header>` landmark → `<nav aria-label="Primary">` → `<ul>`. Logo link
has `aria-label="Wisco Radio Labs — home"`. Sticky header must not cover focused
content: set `scroll-padding-top` to header height so in-page anchors land clear.

**Mobile (<768px):** logo+wordmark left; right shows **theme toggle + a "Menu"
button** (hamburger icon **plus** the visible word "Menu" — recognition over a
bare glyph). Both ≥48×48px.

### 5.2 Mobile nav drawer

Triggered by the Menu button. Slides in from the right (or top sheet), covering
≤85% width, on `--surface-1` with a scrim (`rgba(0,0,0,0.5)`) over the page.

- Contents: the 5 nav links stacked, each a **≥56px** row, `--text`, full-width
  tap area, `--border` divider between; a close ("✕ Close", ≥48px) top-right.
- **Behavior:** opening sets `aria-expanded="true"` on the Menu button, moves
  focus to the drawer (first link or the close button), and **traps focus** within
  the drawer (Tab cycles inside). `Esc` closes and **returns focus to the Menu
  button.** Clicking the scrim closes. Body scroll locked while open.
- The drawer is a `<dialog>` or a `role="dialog" aria-modal="true"
  aria-label="Menu"` container. Links use `aria-current="page"` for the active one.
- **Reduced-motion:** no slide — toggle visibility instantly.
- States per link mirror the desktop nav (rest/hover/focus/active/pressed).

### 5.3 Theme toggle

A single button, ≥48×48px, in the header (both breakpoints). Sun/moon icon that
reflects the **target** state, with a text label for AT.

- `aria-label` reflects action: "Switch to light theme" / "Switch to dark theme"
  (update on toggle). Optionally `aria-pressed` if framed as "dark mode on/off" —
  pick one model and keep it consistent.
- States: rest (icon `--text-secondary`); hover (icon `--text`, `--brand-tint`
  circular bg); focus-visible (ring); active (`--brand-active`).
- Persists choice to `localStorage`; honors `prefers-color-scheme` on first visit.
- Cross-fade theme in 200ms; **instant** under reduced-motion. Icon swap must not
  rely on color alone — the glyph itself changes (sun ↔ moon).

### 5.4 Buttons

Min height **48px**, padding `--space-3 --space-5`, `--radius-md`, Space Grotesk
600, no text-transform (or optional uppercase eyebrow style for CTAs — pick once).

**Primary** (amber fill):
| State | Dark | Light |
|---|---|---|
| Rest | `--brand` bg, `--on-brand` text | `--brand` bg, `--on-brand` text, **1px `#B5560E` border** |
| Hover | `--brand-hover` bg | `--brand-hover` bg, text becomes `#FFF`? — keep `--on-brand`, it passes on `#8A4309`? **verify**: use `#FFF` text on `--brand-hover` light (≈6:1) |
| Focus | + 3px `--focus-ring`, 2px offset | same |
| Active | `--brand-active` bg, slight `translateY(1px)` (none if reduced-motion) | same |
| Disabled | `--surface-2` bg, `--text-muted` text, `cursor:not-allowed`, no hover | same |

> Light-mode hover note: on the darker `--brand-hover` (`#8A4309`), `--on-brand`
> dark text drops in contrast — switch the label to `#FFFFFF` on hover/active in
> light mode (white on `#8A4309` ≈ 6.6:1). Dark mode keeps `--on-brand` throughout.

**Secondary** (outline):
| State | Treatment |
|---|---|
| Rest | transparent bg, `--brand-ink` text, `1px var(--brand-ink)` border |
| Hover | `--brand-tint` bg, text `--brand-hover` |
| Focus | 3px `--focus-ring` outline, 2px offset |
| Active | `--brand-active` text + border |
| Disabled | `--text-muted` text + `--border` border, no hover |

A "link button" (tertiary): text-only, `--brand-ink`, underline on hover — but if
it triggers an action (not navigation) use a real `<button>`. Either way ≥48px tap
height via padding.

### 5.5 Post card

Used on Home (latest) and Blog index. `<article>` inside the card.

```
┌──────────────────────────────┐
│ [ featured image 16:9 ]      │  ← rounded top (radius-md), lazy-loaded
├──────────────────────────────┤
│ CATEGORY-CHIP   · 5 min read │  ← eyebrow row, --text-muted
│ Post Title (H3, --text)      │
│ One-line dekn/excerpt        │  ← --text-secondary, 2-line clamp
│ Jun 28, 2026                 │  ← --fs-caption, --text-muted
└──────────────────────────────┘
```
- Surface `--surface-1`, `1px --border`, `--radius-md`. The **whole card is one
  link** (title is the accessible name; image `alt` empty if decorative-duplicate,
  else descriptive). Don't nest a second link inside the card link — put the
  category chip *outside* the card anchor or render it as non-interactive text on
  the index (filtering lives on the Blog page header, §6.2).
| State | Treatment |
|---|---|
| Rest | flat surface + border |
| Hover | `--border-strong` border, title → `--brand-ink`, image scales 1.02 (none under reduced-motion), light-mode adds `--shadow-md` |
| Focus-visible | 3px `--focus-ring` outline on the card, 2px offset |
| Active | `translateY(1px)` (none under reduced-motion) |
- **Loading (skeleton):** image + two text bars as `--surface-2` blocks, a slow
  pulse (disabled under reduced-motion → static blocks).
- **No image:** fall back to a branded panel — amber-on-charcoal mini-badge or the
  tower mark on `--surface-2` — never a broken-image icon.

### 5.6 Tag / category chip

Pill, `--radius-pill`, `--surface-2` bg, `--text-secondary` text, `--fs-caption`,
padding `--space-1 --space-3`. **As a filter control** (Blog header) it's a
`<button>`/`<a>` with ≥48px tap target (pad vertically even though it looks small);
**as a label** (on a card) it's plain text or a non-focusable span.
| State (interactive) | Treatment |
|---|---|
| Rest | surface-2 / secondary text |
| Hover | `--brand-tint` bg, `--brand-ink` text |
| Focus | ring |
| Selected/active filter | `--brand` bg, `--on-brand` text, `aria-pressed="true"` |
| Disabled (no posts) | `--text-muted`, no pointer |

### 5.7 Article body typography

The article column is **max 68ch, centered**, on `--bg` (no card — let it breathe).

- **H1** (`--fs-h1`): article title, top of page, with eyebrow (category) above and
  meta row (date · read-time · author "K9MTE") below in `--text-muted`.
- **H2/H3/H4**: section heads; `scroll-margin-top` = header height; each heading
  gets an `id` for deep links (an optional `#` anchor link appears on hover,
  hidden from AT or `aria-hidden`).
- **Body** `--fs-body`/1.7, `--text`. Paragraph spacing `--space-5`.
- **Links**: `--link`, **underlined** (offset 2px) — never color-only, so they're
  distinguishable without relying on hue. Hover: `--brand-hover`, thicker
  underline. Focus: ring. External links get a small ↗ glyph + `rel="noopener"`;
  `aria-label` notes "(opens in new tab)" if `target="_blank"`.
- **Blockquote**: 3px `--brand` left border, `--space-5` left padding,
  `--text-secondary`, optional italic. Not centered.
- **Inline code**: JetBrains Mono, `--fs-small`, `--surface-2` bg, `--border`,
  `--radius-sm`, padding `0 .35em`. The `snap install wr-cw-trainer` style.
- **Code block**: `<pre>` on `--surface-2`, `1px --border`, `--radius-md`,
  `--space-4` padding, `overflow-x:auto`, mono. Optional copy button (≥48px,
  top-right, "Copy"→"Copied"). No syntax-color reliance for meaning.
- **Lists**: `--space-2` between items, comfortable indent; markers `--brand-ink`
  for unordered, `--text-secondary` numerals for ordered.
- **Images**: full column width, `--radius-md`, `loading="lazy"`,
  `decoding="async"`; wide images may bleed to ~76ch on desktop. **Every content
  image needs real `alt`** (see §9). Captions: `<figcaption>`, `--fs-caption`,
  `--text-muted`, centered under the image.
- **Horizontal rule**: `1px --border`, `--space-8` vertical margin.
- **First-paragraph "lead"** optional: `--fs-h4`/1.6, `--text-secondary`.

### 5.8 YouTube embed facade (click-to-load)

Performance + privacy: don't load the YouTube iframe until the user asks. Render a
**facade** — the video poster (`maxresdefault`/`hqdefault`, lazy) + a centered
play button — and swap in the real iframe on activation.

```
┌──────────────────────────────┐
│        [ poster image ]      │
│            ( ▶ )             │  ← 64px amber play button, centered
│  Video: "Building the …"     │  ← visible title, --text on scrim
└──────────────────────────────┘
```
- Container 16:9 (`aspect-ratio`), `--radius-md`, `1px --border`.
- The facade is a **`<button>`** (or link to youtube as no-JS fallback) with
  `aria-label="Play video: <title>"`. ≥48px target (the whole frame is clickable).
- States: rest (play button `--brand` fill, `--on-brand` glyph, subtle scrim for
  title legibility); hover (button `--brand-hover`, poster scales 1.02 / none
  under reduced-motion); focus-visible (ring on the frame); activated (replace
  with `<iframe>` `title="<video title>"` `allowfullscreen`, autoplay the now-
  loaded video).
- **No-JS fallback:** the facade is an `<a href="youtube.com/watch?v=…">` so it
  still works; JS upgrades it to inline play.
- Poster `alt`: the video title.

### 5.9 Contact form fields + validation

Single column, labels **always visible above** the field (never placeholder-as-
label). Fields: Name, Email, Subject (optional), Message (textarea). Submits to a
serverless service (Formspree free tier per the brief).

- **Label**: `--fs-small` 500, `--text`, `--space-1` below. Required fields marked
  with "(required)" text *and* `required`/`aria-required` — not a bare `*`.
- **Input/textarea**: ≥48px tall (textarea ≥120px), `--surface-2` bg, `1px
  --border-strong`, `--radius-sm`, `--space-3` padding, `--fs-body`, `--text`.
  Placeholder (if any) `--text-muted` and only as an *example*, not the label.
| State | Treatment |
|---|---|
| Rest | surface-2 / border-strong |
| Hover | border `--text-muted` |
| Focus | `1px --brand` border + 3px `--focus-ring` outline (or 2px brand ring), `--brand-tint` not needed |
| Filled-valid | border-strong; optional `--success` check at right after blur |
| Error | `1px --error` border, `--error` message below (`--fs-small`), field gets `aria-invalid="true"` + `aria-describedby` → message id |
| Disabled | `--surface-1` bg, `--text-muted`, not-allowed |
- **Validation**: validate on **blur** and on submit, not on every keystroke.
  Errors are **text** ("Enter a valid email address") with `--error` color **and**
  an icon — never color alone. On submit failure, move focus to the **first**
  invalid field; render a summary `role="alert"` if multiple.
- **Submit button**: primary button, full-width on mobile. States:
  - **rest** → "Send message"
  - **loading** → disabled, spinner + "Sending…", `aria-busy="true"` (spinner
    static/hidden under reduced-motion; rely on the text)
  - **success** → `role="status"` confirmation panel "Thanks — I'll get back to
    you. 73!" (`--success` accent), form clears or hides
  - **error (network/service)** → `role="alert"` "Something went wrong — email me
    directly at …" with the mailto fallback, form data preserved
- **Honeypot** (hidden field) for spam, since there's no auth/captcha; keep it
  `aria-hidden` + off-screen, not `display:none`-only.
- Page sets `lang="en"`; the form `<fieldset>`/`<legend>` optional; every input
  has a programmatic label (`for`/`id`).

### 5.10 Footer

`<footer>` landmark, `--surface-1`, top `1px --border`, `--space-10` vertical pad.
Three groups (stack on mobile, row on desktop):
1. Badge + wordmark + one line ("Ham-radio maker brand from the Driftless. Made by
   Travis Engh, K9MTE.").
2. Nav repeat (the 5 sections) + RSS link (the brief sets RSS ON).
3. Contact/social: email, QRZ (K9MTE), and social links — each a ≥48px target,
   `--text-secondary` → `--brand-ink` on hover, focus ring. Icons need
   `aria-label` (e.g. "QRZ profile for K9MTE").
Bottom line: "© 2026 Wisco Radio Labs · Made in the Driftless" in `--text-muted`,
plus the theme toggle may repeat here. Keep it calm — no link wall.

---

See **`layouts.md`** for page wireframes (desktop + mobile), responsive
breakpoints, and the consolidated accessibility checklist.
