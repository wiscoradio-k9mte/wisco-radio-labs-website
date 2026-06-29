#!/usr/bin/env node
/**
 * generate-brand-assets.mjs
 *
 * One-time (and on-demand) generator: rasterizes brand SVGs to the PNG set
 * the site and social platforms need.  Generated files are committed to the
 * repo and served as static assets — no build-time generation required.
 *
 * Usage:  node scripts/generate-brand-assets.mjs
 *    or:  npm run generate:assets
 *
 * Outputs:
 *   public/og-default.png           1200×630  — default social share card
 *   public/icons/icon-16.png         16×16   — browser favicon (raster)
 *   public/icons/icon-32.png         32×32   — browser favicon (raster)
 *   public/icons/apple-touch-icon.png  180×180 — iOS home-screen icon
 *   public/icons/icon-192.png        192×192 — Android / web-app
 *   public/icons/icon-512.png        512×512 — Android splash / web-app
 *
 * Requires: sharp (bundled with astro; also listed in devDependencies).
 *
 * Font note (OG card):
 *   The card uses Space Grotesk (display) and JetBrains Mono, both OFL-1.1.
 *   TTF files live in scripts/fonts/ (committed for reproducible offline regen).
 *   Sources:
 *     github.com/floriankarsten/space-grotesk  → fonts/ttf/static/SpaceGrotesk-*.ttf
 *     github.com/JetBrains/JetBrainsMono       → fonts/ttf/JetBrainsMono-SemiBold.ttf
 *   librsvg (sharp's SVG engine) resolves fonts via fontconfig.  We point
 *   FONTCONFIG_FILE at a minimal config written to a tmp dir at runtime —
 *   this must happen before the first sharp(svgBuffer) call or librsvg will
 *   fall back to system fonts.  The env var is read lazily by fontconfig, so
 *   setting process.env.FONTCONFIG_FILE in JS before the first SVG render works.
 *
 *   If the brand fonts still don't render (e.g. a future librsvg version
 *   eagerly caches fontconfig), the output will fall back to the system
 *   sans-serif — the card degrades gracefully.  The next step up would be a
 *   Puppeteer/Chromium renderer, which has full web-font support and is the
 *   reliable alternative if librsvg proves too fragile.
 */

import sharp from 'sharp';
import { mkdir, readFile, mkdtemp, writeFile } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { tmpdir } from 'node:os';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT       = join(__dirname, '..');
const PUBLIC     = join(ROOT, 'public');
const ICONS_DIR  = join(PUBLIC, 'icons');
const FONTS_DIR  = join(__dirname, 'fonts');

// ── Palette — exact tokens from design-system.md §2 ──────────────────────────
// (Raw hex because this SVG is rasterized by librsvg, not rendered in a browser
//  where CSS custom properties would resolve.)
const BG         = '#0F1115';  // --bg dark
const AMBER      = '#E8821E';  // --brand
const TEXT       = '#E8EAED';  // --text
const TEXT_SEC   = '#A9B2C0';  // --text-secondary
const TEXT_MUTE  = '#7C8694';  // --text-muted
const BORDER     = '#2A2F3A';  // --border

// ── 0. Font setup — configure fontconfig before any SVG render ────────────────
//
// Write a minimal fontconfig config pointing at scripts/fonts/ (the committed
// TTF directory) so librsvg resolves "Space Grotesk" and "JetBrains Mono".
// The config is written to a tmp dir at runtime so the path is always absolute.
//
async function prepareFontconfig() {
  const cacheDir = await mkdtemp(join(tmpdir(), 'wrl-og-fonts-'));
  const conf = `<?xml version="1.0"?>
<!DOCTYPE fontconfig SYSTEM "fonts.dtd">
<fontconfig>
  <!-- Brand fonts committed at scripts/fonts/ (OFL-1.1): Space Grotesk + JetBrains Mono -->
  <dir>${FONTS_DIR}</dir>
  <cachedir>${cacheDir}</cachedir>
</fontconfig>`;
  const confPath = join(cacheDir, 'fonts.conf');
  await writeFile(confPath, conf);
  // Must be set before the first sharp SVG call — fontconfig reads lazily.
  process.env.FONTCONFIG_FILE = confPath;
  console.log('  Font config: Space Grotesk (display) + JetBrains Mono (mono)');
  console.log(`  FONTCONFIG_FILE → ${confPath}`);
}

// ── 1. OG card SVG — 1200×630 ─────────────────────────────────────────────────
//
// Tower polygon coordinate derivation:
//   Source: favicon path  M16,8 L10,22 L14,22 L14,18 L18,18 L18,22 L22,22 Z
//   (an A-frame with two leg recesses, in a 32×32 coordinate space)
//   Scale S=15, translate tx=-20, ty=81
//   Transform: point(x,y) → (x*15 - 20, y*15 + 81)
//
//   Tip:         (16,8 ) → (220, 201)
//   Left outer:  (10,22) → (130, 411)
//   Left inner:  (14,22) → (190, 411)  ← leg bottom
//   Left top:    (14,18) → (190, 351)  ← leg top
//   Right top:   (18,18) → (250, 351)
//   Right inner: (18,22) → (250, 411)  ← leg bottom
//   Right outer: (22,22) → (310, 411)
//
// Signal wave derivation (same transform):
//   Inner wave  M10,10 Q16,14 22,10 → M130,231 Q220,291 310,231
//   Mid wave    M7,7   Q16,13 25,7  → M85,186  Q220,276 355,186
//   Outer wave  (extended beyond favicon bounds for visual depth)
//                                   → M40,143  Q220,238 400,143
//
// ── Lattice tower (truss mast) — matches the brand logo's tower, generated
//    parametrically (center x=220) so the geometry is easy to tune. ──
const TOWER_LINE = '#838B98'; // medium cool gray ≈ the logo's tower
const towerLattice = (() => {
  const cx = 220, yTop = 222, yBase = 408, halfTop = 7, halfBase = 58, levels = 7;
  const half = (y) => halfTop + (halfBase - halfTop) * (y - yTop) / (yBase - yTop);
  const L = (y) => +(cx - half(y)).toFixed(1), R = (y) => +(cx + half(y)).toFixed(1);
  const ys = Array.from({ length: levels }, (_, i) => +(yTop + (yBase - yTop) * i / (levels - 1)).toFixed(1));
  const line = (x1, y1, x2, y2, w, o = 1) =>
    `  <line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${TOWER_LINE}" stroke-width="${w}" stroke-linecap="round"${o < 1 ? ` opacity="${o}"` : ''}/>\n`;
  let s = '';
  // Two converging legs
  s += line(L(yTop), yTop, L(yBase), yBase, 3);
  s += line(R(yTop), yTop, R(yBase), yBase, 3);
  // Rungs + X cross-bracing per bay
  for (let i = 0; i < levels; i++) {
    const y = ys[i];
    s += line(L(y), y, R(y), y, 2);
    if (i < levels - 1) {
      const y2 = ys[i + 1];
      s += line(L(y), y, R(y2), y2, 1.6, 0.85);
      s += line(R(y), y, L(y2), y2, 1.6, 0.85);
    }
  }
  // Top mast to the beacon + splayed feet at the base
  s += line(cx, yTop, cx, 188, 3);
  s += line(L(yBase), yBase, L(yBase) - 15, yBase + 24, 3);
  s += line(R(yBase), yBase, R(yBase) + 15, yBase + 24, 3);
  return s;
})();
const OG_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">

  <!-- Charcoal background -->
  <rect width="1200" height="630" fill="${BG}"/>

  <!-- Thin card border — visible when shared on white-background surfaces -->
  <rect x="1" y="1" width="1198" height="628" rx="3" fill="none" stroke="${BORDER}" stroke-width="2"/>

  <!-- Left amber accent strip -->
  <rect x="0" y="0" width="6" height="630" fill="${AMBER}"/>

  <!-- ── TOWER MARK (horizontal center of left column ≈ x=220) ── -->

  <!-- Signal waves drawn back-to-front (outer = lowest opacity) -->
  <path d="M40,143 Q220,238 400,143"
        stroke="${AMBER}" stroke-width="2" fill="none" stroke-linecap="round" opacity="0.22"/>
  <path d="M85,186 Q220,276 355,186"
        stroke="${AMBER}" stroke-width="2.8" fill="none" stroke-linecap="round" opacity="0.55"/>
  <path d="M130,231 Q220,291 310,231"
        stroke="${AMBER}" stroke-width="3.5" fill="none" stroke-linecap="round" opacity="0.9"/>

  <!-- Lattice tower (truss mast — matches the logo), generated above -->
${towerLattice}
  <!-- Beacon at the mast tip -->
  <circle cx="220" cy="176" r="11" fill="${AMBER}"/>

  <!-- Ground line under the feet -->
  <line x1="140" y1="434" x2="300" y2="434" stroke="${BORDER}" stroke-width="2"/>

  <!-- ── TEXT BLOCK (right column, x ≥ 420) ── -->

  <!-- Eyebrow: brand name in amber small-caps treatment -->
  <text x="422" y="242"
        font-family="Space Grotesk, sans-serif" font-size="22" font-weight="600"
        letter-spacing="5" fill="${AMBER}">WISCO RADIO LABS</text>

  <!-- Short amber rule beneath eyebrow (brand device) -->
  <line x1="422" y1="260" x2="660" y2="260" stroke="${AMBER}" stroke-width="2.5" opacity="0.55"/>

  <!-- Main tagline — two lines for legibility at preview scale -->
  <text x="420" y="346"
        font-family="Space Grotesk, sans-serif" font-size="62" font-weight="700"
        fill="${TEXT}">Ham radio,</text>
  <text x="420" y="422"
        font-family="Space Grotesk, sans-serif" font-size="62" font-weight="700"
        fill="${TEXT}">built in the open.</text>

  <!-- Place tagline -->
  <text x="422" y="476"
        font-family="Space Grotesk, sans-serif" font-size="27"
        fill="${TEXT_SEC}">Made in the Driftless.</text>

  <!-- Bottom separator -->
  <line x1="420" y1="564" x2="1140" y2="564" stroke="${BORDER}" stroke-width="1.5"/>

  <!-- Preview URL (left) and callsign (right) -->
  <text x="422" y="598"
        font-family="Space Grotesk, sans-serif" font-size="19"
        fill="${TEXT_MUTE}">wiscoradio-k9mte.github.io</text>
  <text x="1138" y="598"
        font-family="JetBrains Mono, monospace" font-size="22" font-weight="600"
        fill="${AMBER}" text-anchor="end">K9MTE</text>

</svg>`;

// ── 2. Generate OG card PNG ───────────────────────────────────────────────────
async function generateOgCard() {
  console.log('Generating public/og-default.png (1200×630)…');
  await sharp(Buffer.from(OG_SVG))
    .png({ compressionLevel: 9 })
    .toFile(join(PUBLIC, 'og-default.png'));
  console.log('  ✓ public/og-default.png');
}

// ── 3. Generate favicon PNG sizes ─────────────────────────────────────────────
//
// The favicon.svg is already optimized for small sizes (no ring text, no arched
// wordmark — just tower + signal waves, amber on charcoal).  Sharp renders it at
// high DPI then resizes down to each target, so the circular badge stays clean.
//
async function generateIcons() {
  await mkdir(ICONS_DIR, { recursive: true });

  const faviconSvg = await readFile(join(PUBLIC, 'favicon.svg'));

  const sizes = [
    { size: 16,  name: 'icon-16.png' },
    { size: 32,  name: 'icon-32.png' },
    { size: 180, name: 'apple-touch-icon.png' },
    { size: 192, name: 'icon-192.png' },
    { size: 512, name: 'icon-512.png' },
  ];

  for (const { size, name } of sizes) {
    process.stdout.write(`Generating public/icons/${name} (${size}×${size})…`);
    await sharp(faviconSvg, { density: 300 })
      .resize(size, size)
      .png({ compressionLevel: 9 })
      .toFile(join(ICONS_DIR, name));
    console.log(' ✓');
  }
}

// ── Main ──────────────────────────────────────────────────────────────────────
// Font setup MUST run before generateOgCard() — librsvg reads FONTCONFIG_FILE
// lazily (on first SVG text render), so setting it here in time is what matters.
await prepareFontconfig();
await generateOgCard();
await generateIcons();
console.log('\nDone. Commit public/og-default.png and public/icons/ to the repo.');
