# Image & SEO Conventions

The standing rules for every image on the site. Goal: consistent, discoverable,
fast-loading images that help search and screen readers — set once, followed every
time. Keep it simple; this is a checklist, not a thesis.

## Honest priority (what actually moves SEO)

A filename is a *minor* signal — and on this site, images under `src/assets/` are
optimized by `astro:assets`, so their final URL is hashed into `/_astro/` (the
original name survives only as a prefix). So spend effort in this order:

1. **Alt text** — the biggest lever for both SEO and accessibility. Describe the
   real thing, specifically. (Decorative-only images get `alt=""`.)
2. **Surrounding copy + caption** — the text near an image is what search reads it
   in context with.
3. **Dimensions set on the element** — prevents layout shift (CLS), a ranking
   factor. `astro:assets` does this for you when you pass a real image import.
4. **File format & weight** — small, modern formats load fast (Astro emits
   WebP/AVIF automatically).
5. **Filename** — necessary hygiene and a small keyword signal. The rule below.

Filenames are last, but we still get them right — they're free and they keep the
repo legible.

## Filename rule

`lowercase-kebab-case-describing-the-subject.ext`

- **All lowercase.** Avoids server case-sensitivity bugs.
- **Hyphens between words** — never spaces or underscores. Google treats hyphens
  as word separators; underscores join words into one token.
- **Describe the real subject, keyword-first**, ~3–6 words. Lead with what it *is*.
- **No camera dumps** (`IMG_1520.jpeg`), **no dates**, **no sequence numbers**,
  **no CamelCase**, **no `final-v2-real`** cruft.
- **Be true** — the filename is indexable text, so the brand-truth rule applies:
  don't name a spec you haven't confirmed (band, power, model). When unsure, name
  the certain thing in the file and put the richer detail in alt text once verified.

Good: `norcal-40b-kit-build.jpg`, `driftless-area-stream-winter.jpg`,
`cw-trainer-qso-simulator.png`
Bad: `IMG_1367.jpeg`, `WiscoRadioLabs-QSO.png`, `radio pic FINAL.JPG`

## Where images live

- **Blog post images:** `src/assets/blog/<post-slug>/` — one folder per post,
  co-located by slug (the slug is itself keyword-rich and keeps posts tidy).
  Reference them with a relative import / relative Markdown path so `astro:assets`
  optimizes them. `heroImage:` in frontmatter resolves against `src/assets`.
- **Brand & product art:** keep in the existing `src/assets/brand/` and
  `src/assets/cw-trainer/` folders.
- **`public/` only** for files that need a *stable, unhashed URL*: `og-default.png`,
  the favicon/icon set, `CNAME`. These are not optimized and keep their exact path —
  so their filename/path IS the URL. Don't put content photos here.

## Format & source size

- **Photos → `.jpg`**; **screenshots, logos, line/graphics → `.png`** (or `.svg`
  for vector). Astro re-encodes to WebP/AVIF for delivery, so source format is about
  *quality*, not what ships.
- **Source width ~1600–2400px** is plenty for a hero. Don't commit a raw 12-megapixel
  phone file — it bloats the repo and slows builds for no visible gain. Astro handles
  the responsive downscales.
- Strip nothing by hand; just don't upload the giant original.

## Alt text & captions (do this every time)

- Every meaningful image gets **specific** alt text naming the real subject
  (e.g. *"A NorCal 40B QRP CW transceiver kit mid-build in a helping-hands clamp."*).
- **Decorative** images (e.g. the hero logo badge, where the wordmark is already
  text) get `alt=""` so screen readers skip them.
- Add a visible **caption** when it adds context or a true, specific detail the ham
  audience will appreciate (the kit name, the band, the place).
- Never keyword-stuff alt text; write it for a human who can't see the image.

## Worked example — the "Welcome to Wisco Radio Labs" post

Folder: `src/assets/blog/welcome-to-wisco-radio-labs/`

| Slot | Filename | Alt (draft — confirm specifics) |
|------|----------|----------------------------------|
| Hero | `k9mte-ham-shack-cw-key.jpg` | K9MTE's ham radio station with the CW key in view |
| Inline · CW Trainer | `cw-trainer-qso-simulator.png` | The CW Trainer's QSO simulator screen |
| Inline · the bench | `norcal-40b-kit-build.jpg` | A NorCal 40B (NM0S Electronics) QRP CW kit mid-build |
| Close · Driftless | `driftless-area-stream-winter.jpg` | A Driftless Area stream in winter, southwest Wisconsin |

(The QSO screenshot already exists as `cw-trainer/WiscoRadioLabs-QSO.png`; reuse or
copy under the new name.)

## Known inconsistency to migrate (when convenient)

The existing `src/assets/cw-trainer/WiscoRadioLabs-*.png` screenshots predate this
convention (CamelCase). Renaming them to kebab-case (e.g. `cw-trainer-qso.png`) is a
small follow-up that also touches their imports in `products/index.astro` + the home
page, so it needs a `test:links` re-run. Not urgent; do it in a dedicated pass.
