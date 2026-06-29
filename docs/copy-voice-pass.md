# Copy Voice Pass — Wisco Radio Labs Website

**Status:** APPLIED 2026-06-29. Brand-truth gate PASSED; Travis approved. Decisions: (1)
"transceivers" removed — replaced with the differentiator + "more projects in progress"
framing (Travis chose "hint at more coming, no specifics"); (2) IOTA added as "SOTA and IOTA
contacts" across the product page + seed post (Travis: yes). The five voice changes below are
live on `feature/initial-build`. All copy checked against shipped facts as of v2.3.0.

**One flag that runs through multiple surfaces:** the current hero sub and `SITE_DESCRIPTION`
in `consts.ts` both say "building CW trainers, transceivers, and tools." The portfolio shows
one live product (CW Trainer) and one site build. No transceiver project is active or
scaffolded. "Transceivers" is not a shipped or announced fact — it is aspirational at best.
The brand-truth gate must confirm with Travis: does an active transceiver project exist and
does he want it surfaced here? My recommendation either way is to cut the word: an in-progress
project that hasn't shipped still violates "only real, shipped claims," and an unstarted one
doubly so. All proposed copy below removes it. If Travis has a project he wants acknowledged,
"more projects in progress" is honest; "transceivers" is not.

---

## 1. Site description (consts.ts / meta / RSS feed title)

**CURRENT:**
```
Ham-radio maker brand from the Driftless. Building CW trainers, transceivers, and more — in the open.
```

**PROPOSED:**
```
Ham-radio maker brand from the Driftless — open-source tools built by an operator who actually uses them, shared freely, one project at a time.
```

**WHY:** Removes the unshipped "transceivers" claim; pulls in the key-message differentiator
("built by an operator who actually uses them") from §4 of the plan; accurate — no new
product claims. Runs to one sentence rather than two fragments.

---

## 2. Home — hero

### 2a. Eyebrow

**CURRENT:** `Made in the Driftless`

**PROPOSED:** Keep as-is.

**WHY:** Exact brand anchor from the logo; endorsed by the plan. No change needed.

---

### 2b. H1 heading

**CURRENT:** `Ham radio, built in the open.`

**PROPOSED:** Keep as-is.

**WHY:** The plan explicitly endorses this line: "it is the brand in five words." Do not touch it.

---

### 2c. Hero sub-paragraph

**CURRENT:**
> Wisco Radio Labs is a one-person ham-radio maker brand in southwest Wisconsin —
> building CW trainers, transceivers, and tools for the amateur-radio community,
> one project at a time.

**PROPOSED:**
> Wisco Radio Labs is a one-person ham-radio maker brand in southwest Wisconsin —
> open-source tools built by an operator who actually uses them, shared freely,
> one project at a time.

**WHY:** Drops "transceivers" (unshipped, no active project — see flag above); replaces the
product-category list with a trust differentiator from the plan's key messages ("built by an
operator who actually uses them"). Keeps the rhythm. No unshipped claim added.

---

### 2d. CTAs

**CURRENT:** `Read the blog` / `See the CW Trainer`

**PROPOSED:** Keep as-is.

**WHY:** Direct, functional, accurate. No change needed.

---

## 3. Home — latest-posts section

### 3a. Section eyebrow

**CURRENT:** `Latest from the bench`

**PROPOSED:** Keep as-is.

**WHY:** On-brand, specific, exactly the register the plan calls for.

---

### 3b. Empty state

**CURRENT:** `No posts yet — check back soon.`

**PROPOSED:**
> Nothing here yet — the bench log is just getting started. Check back soon.

**WHY:** Small voice improvement; "the bench log" is a concrete Wisco Radio Labs phrase that
appears in the About page and the seed post. "No posts yet" is functional but generic.
No factual claim involved.

---

## 4. Home — product teaser

### 4a. Eyebrow

**CURRENT:** `Featured project`

**PROPOSED:** Keep as-is.

---

### 4b. Title

**CURRENT:** `CW Trainer`

**PROPOSED:** Keep as-is.

---

### 4c. Description

**CURRENT:**
> Learn Morse code the way hams actually use it — Koch-method lessons, copy and sending
> practice, and a QSO simulator. Fully offline. Free and open source. On Linux now.

**PROPOSED:** Keep as-is.

**WHY:** This is already strong, specific, and accurate. Hits the plan's key message
("Learn Morse the way hams actually use it — free, open source, and fully offline") and
adds the platform qualifier "On Linux now" which is honest and important. Do not touch it.

---

### 4d. Install command

**CURRENT:** `snap install wr-cw-trainer`

**PROPOSED:** Keep as-is. Verified correct as of v2.3.0.

---

## 5. About page

### 5a. Page title (H1)

**CURRENT:** `About Wisco Radio Labs`

**PROPOSED:** Keep as-is.

**WHY:** Clear, functional, works as a nav anchor and browser-tab title. The personal voice
is carried by the body copy; the H1 doesn't need to do that work.

---

### 5b. Eyebrow

**CURRENT:** `Made in the Driftless`

**PROPOSED:** Keep as-is.

---

### 5c. Lead paragraph

**CURRENT:**
> Ham radio, built in the open — one project at a time, out of southwest Wisconsin.

**PROPOSED:** Keep as-is.

**WHY:** Echoes the hero headline and grounds it in place. Good.

---

### 5d. Body, paragraph 1

**CURRENT:**
> I'm Travis Engh, K9MTE. I run Wisco Radio Labs — a one-person maker brand building
> tools and equipment for the amateur-radio community. My background is military
> maintenance and systems work: years of hands-on discipline that taught me to build
> things that are repairable, legible, and honest about what they do and don't do.

**PROPOSED:** Keep as-is.

**WHY:** Personal, honest, specific background. The "repairable, legible, and honest" triplet
is accurate to the doctrine. No change needed.

---

### 5e. Body, paragraph 2

**CURRENT:**
> I started Wisco Radio Labs because I wanted a place to build radio things in the open
> and share the work. The first product is the CW Trainer — a Morse-code training app
> built the way I wanted to learn: Koch method, real copy and sending practice, and a
> QSO simulator that feels like an actual contact. I built it for myself and decided it
> was worth sharing.

**PROPOSED:** Keep as-is.

**WHY:** This is the brand story in its plainest form. "I built it for myself and decided
it was worth sharing" is the most important sentence on the page. Don't touch it.

---

### 5f. Body, paragraph 3 (Driftless)

**CURRENT:**
> "Made in the Driftless" is a place and a posture. The Driftless Area of southwest
> Wisconsin is a pocket of the midwest that the last glacier missed — old hills, ridges,
> river valleys, and a certain stubbornness about doing things your own way. That's the
> attitude. Build it well. Make it last. Show the work.

**PROPOSED:**
> "Made in the Driftless" is a place and a posture. The Driftless Area of southwest
> Wisconsin is a specific place — old hills and river valleys, stubbornly themselves while
> the rest of the midwest was flattened and then sprawled. That's the attitude. Build it
> well. Make it repairable. Show the work.

**WHY:** "stubbornly themselves while the rest of the midwest was flattened and then
sprawled" is more specific and alive than "a certain stubbornness about doing things your
own way" — the contrast does the work the adjective was trying to do. "Make it repairable"
replaced "Make it last" because repairability is the actual doctrine word and more
distinctive. (The seed blog post already uses the better phrasing; this brings the About
page into alignment.) No factual claim involved.

---

### 5g. Body, paragraph 4

**CURRENT:**
> This site is the bench log: what I'm building, how it's going, and what I'm learning.
> More projects are in progress.

**PROPOSED:**
> This site is the bench log: what I'm building, how it's going, and what I got wrong
> the first time. More projects are in progress.

**WHY:** "What I got wrong the first time" is more honest and specific than "what I'm
learning" — it's the honesty pillar made concrete, and it sets the right expectation for
the blog. No factual claim involved.

---

## 6. Products — CW Trainer

### 6a. Eyebrow, title, lead, status line

**CURRENT:**
> Eyebrow: `Wisco Radio Labs · Product`
> H1: `CW Trainer`
> Lead: `Learn Morse code the way hams actually use it.`
> Status: `🟢 Live on the Snap Store · v2.3.0 · free & open source (GPL-3.0)`

**PROPOSED:** Keep all as-is.

**WHY:** Precise, accurate, complete. The status line is exactly what the plan calls for.

---

### 6b. "What it is" section

**CURRENT:**
> The CW Trainer teaches Morse code the way radio operators actually use it — not by
> memorizing dots and dashes on a chart, but by training your ear to recognize characters
> directly. It uses the **Koch method**: start with just a couple of characters, get good
> at them, then add more one at a time until you have the full alphabet.
>
> Once you know the characters, the trainer moves to what matters on the air — copying
> random text at speed (the **COPY drill**), and sending your own with a key or paddle
> while the app grades your fist (the **KEY drill**). The **QSO simulator** walks you
> through realistic exchanges: POTA activations, SOTA contacts, and ragchew conversations.
>
> It runs entirely offline — no network connection, no account, no tracking. It is free
> and open source under the GPL-3.0 license.

**PROPOSED:** Keep as-is, with one factual note for the gate.

**FLAG FOR GATE:** The QSO simulator also covers IOTA contacts (per the CW Trainer brief:
"POTA/SOTA/IOTA/ragchew"; the QSO builders include `buildIota`). The current text lists
"POTA activations, SOTA contacts, and ragchew conversations" — IOTA is a shipped feature
that's been omitted. This is an omission of a real feature (not a false claim), but it
should be corrected for accuracy. Proposed addition, if Travis confirms: change "POTA
activations, SOTA contacts, and ragchew conversations" to "POTA activations, SOTA and IOTA
contacts, and ragchew conversations." The gate and Travis should confirm the IOTA wording
(e.g. whether "IOTA contact" or "IOTA chase" is the right operating term here).

---

### 6c. "How to use it now" — step 5

**CURRENT:**
> It is a simulation; every real QSO will be different. The goal is confidence.

**PROPOSED:** Keep as-is.

**WHY:** This is exactly right — honest, specific, sets correct expectations. The plan
endorses this kind of "honest about what it doesn't do" voice.

---

### 6d. "Where it's headed" roadmap section

**CURRENT:**
> The CW Trainer is live on Linux via the Snap Store. The roadmap — not a promise, but
> an honest direction — is:
> - Windows via the Microsoft Store
> - macOS via the Mac App Store
> - iOS and Android via Capacitor
>
> The code is pure React and Web Audio with a store facade written for exactly this kind
> of cross-platform extension. None of the above are available yet — they are where this
> is going.

**PROPOSED:** Keep as-is.

**WHY:** "Not a promise, but an honest direction" is the voice and the hard line done
right. "None of the above are available yet" is the brand-truth gate built into the copy.
This is the product page at its best; do not change it.

---

### 6e. Screenshot section heading

**CURRENT:** `A look inside`

**PROPOSED:**
> Inside the trainer

**WHY:** Minor — "A look inside" is generic. "Inside the trainer" is slightly more specific.
Either works; this is optional. Keep current if it feels fine.

---

## 7. Contact page

### 7a. H1

**CURRENT:** `Get in touch`

**PROPOSED:** Keep as-is.

**WHY:** Direct, personal, exactly what the plan calls for.

---

### 7b. Lead paragraph

**CURRENT:**
> Questions, ideas, a bug in the CW Trainer? Want to talk radio? I'd like to hear from you.

**PROPOSED:** Keep as-is.

**WHY:** Already in voice. Personal ("I'd like to hear from you"), specific ("a bug in the
CW Trainer? Want to talk radio?"), no filler. The plan's sample ("Questions, ideas, a bug?
Here's how to reach a real person.") is almost identical — the current version is actually
warmer and more specific. Do not touch it.

---

### 7c. "Other ways to reach me" heading

**CURRENT:** `Other ways to reach me`

**PROPOSED:** Keep as-is.

**WHY:** Direct and personal. First-person register, consistent with the page lead.

---

### 7d. Form success message

**CURRENT:** `Thanks — I'll get back to you. 73!`

**PROPOSED:** Keep as-is.

**WHY:** "73!" is the right sign-off for this audience. Personal, on-brand, correct operating
practice. This is the best single sentence on the contact page.

---

## 8. Footer

### 8a. Brand tagline

**CURRENT:** `Ham-radio maker brand from the Driftless. Made by Travis Engh, K9MTE.`

**PROPOSED:** Keep as-is.

**WHY:** Concise, accurate, personal. Names the person — the plan says "the brand is a
person." No change needed.

---

### 8b. Bottom bar

**CURRENT:** `© 2026 Wisco Radio Labs · Made in the Driftless`

**PROPOSED:** Keep as-is.

**WHY:** Clean, correct, brand-anchored. "Made in the Driftless" as a footer sign-off is
consistent with the logo and the overall brand posture.

---

## 9. Seed blog post: "Welcome to Wisco Radio Labs"

### 9a. Post title

**CURRENT:** `Welcome to Wisco Radio Labs`

**PROPOSED:** Keep as-is.

**WHY:** Functional and honest as a first post. The "why I'm doing this" opening post is a
blog convention; no need to be clever with it.

---

### 9b. Opening section ("Why this exists")

**CURRENT:**
> Ham radio, built in the open.
>
> That's the short version of what Wisco Radio Labs is. This is the longer one.
>
> I'm Travis Engh, K9MTE. I've been interested in amateur radio for a while, but the
> thing that finally got me to actually do something with it was Morse code — specifically,
> wanting to learn it the right way and being frustrated with the tools I found.
>
> Most CW training apps teach you dots and dashes. That's not how it works on the air.
> You don't copy code by mentally assembling "dit-dah-dit — that's an R." You copy it by
> recognizing R as a sound, the same way you recognize a word in spoken language without
> spelling it out. The Koch method gets at this — start with just two characters, drill
> them until they're instinctive, then add more. That's what the CW Trainer does.
>
> So I built it. Then I built it again better. Then I shipped it on Linux.

**PROPOSED:** Keep as-is.

**WHY:** This is the brand voice at its best. "So I built it. Then I built it again better.
Then I shipped it on Linux." is exactly the understated, maker cadence the plan calls for.
Every sentence earns its place. Do not touch this section.

---

### 9c. "The CW Trainer" section

**CURRENT:**
> The [CW Trainer](/products/) is the first product out of Wisco Radio Labs. It's live on
> the Snap Store at v2.3.0 — Koch-method lessons, copy and sending practice (including
> graded fist feedback), and a QSO simulator for POTA, SOTA, and ragchew contacts.
>
> It's fully offline. Free. Open source under GPL-3.0.
>
> ```
> snap install wr-cw-trainer
> ```
>
> Windows, macOS, and mobile are on the roadmap, in that order. Linux first because
> that's where I am and where I can ship quickly and actually test.

**PROPOSED:** Keep as-is.

**WHY:** Accurate as of v2.3.0, roadmap is correctly labeled as roadmap, the honest
"Linux first because that's where I am" is the best possible brand-truth demonstration.
Note: IOTA is again omitted from the QSO feature list here (same as the product page) —
same gate question applies, same recommendation: add IOTA if Travis confirms the wording.

---

### 9d. "What this site is for" section

**CURRENT:**
> This site is the bench log. I'll write here about what I'm building, how it's going,
> what I got wrong the first time, and what I learned. Ham radio, electronics, software —
> probably some overlap with the broader world of making things with your hands in a
> corner of the midwest that the last glacier missed.
>
> The Driftless Area of southwest Wisconsin is a specific place: old hills and river
> valleys, stubbornly themselves while the rest of the midwest was flattened and then
> sprawled. "Made in the Driftless" is partly geographic and partly an attitude. Build
> it well. Make it repairable. Show the work.
>
> More projects are in progress. I'll write about them here.
>
> 73 de K9MTE

**PROPOSED:** Keep as-is.

**WHY:** This section is the strongest Driftless paragraph on the site — "stubbornly
themselves while the rest of the midwest was flattened and then sprawled" is more alive
than the About page version, and the sign-off "73 de K9MTE" is the right close. This
is the benchmark; the About page should move toward this, not the reverse.

---

## Summary of proposed changes

**Change:** These five surfaces have proposed rewrites worth reviewing:

| Surface | What changes | Why |
|---|---|---|
| `consts.ts` SITE_DESCRIPTION | Remove "transceivers," pull in key message | Unshipped claim; voice improvement |
| Home hero sub | Remove "transceivers," replace list with differentiator | Unshipped claim; no product categories that don't exist |
| Home empty state | "the bench log is just getting started" | Minor voice improvement; generic → specific |
| About para 3 (Driftless) | "stubbornly themselves while the rest of the midwest was flattened" | Sharper than current; aligns with blog post version |
| About para 4 | "what I got wrong the first time" replaces "what I'm learning" | More honest and specific; honesty pillar |

**Keep (explicitly):** Home hero H1 ("Ham radio, built in the open."), home product teaser
description, About H1, About paras 1 and 2, About lead, the "I built it for myself"
sentence, the entire Products "Where it's headed" section with its "not a promise" framing,
all Contact copy including the form success "73!", the footer, and the entire seed blog post.
The seed blog post is the site's best copy — it is the voice the rest of the site should
match.

**Flag for the gate / Travis before anything ships:**

1. **"transceivers"** — appears in `consts.ts` SITE_DESCRIPTION and home hero sub. Is there
   an active transceiver project Travis wants to surface? If not, cut; if yes, "more projects
   in progress" is the honest framing, not a product category name.

2. **IOTA omission** — the CW Trainer QSO simulator includes an IOTA mode (per the brief,
   `buildIota` is shipped). The product page "What it is" and the blog post's CW Trainer
   section both list "POTA, SOTA, and ragchew" but omit IOTA. This is a shipped feature
   being undersold, not an unshipped claim, so it's lower risk — but it should be corrected.
   Gate + Travis to confirm the right operating term ("IOTA contacts"? "IOTA chasers"?).

3. **FCC 97.1 / "advancing the radio art" language** — not present in the current copy,
   so no gate action needed now. If it appears in future copy (blog posts, About page
   additions), it must be framed as "in the spirit of" — never as a regulatory claim or
   FCC endorsement. This is a standing reminder, not a current issue.
