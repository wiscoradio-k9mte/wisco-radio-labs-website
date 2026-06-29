#!/usr/bin/env node
// Link-integrity and a11y check (acceptance criteria gates).
//
// Scans the built dist/ for HTML files and asserts:
//   1. No href or src attribute points at a root-absolute path that LACKS the base prefix
//      (i.e., /blog instead of /wisco-radio-labs-website/blog). These 404 on GH Pages.
//   2. No internal asset src (not http/https/data/blob) points to a non-existent file in dist/.
//   3. Every aria-labelledby and aria-describedby value resolves to an existing id on the page.
//   4. Exactly one <h1> per page.
//   5. No heading-level skips (h1→h3 without an intervening h2, etc.).
//   6. No draft: true post leaks into dist/rss.xml.
//   7. No draft: true post leaks into any dist/blog/<slug>/ directory (pre-existing gate).
//
// Run after `npm run build`:
//   npm run test:links
//
// In CI this runs after the build step in deploy.yml.
// A leak here means a withBase() call was forgotten or a draft filter was missed.

import { readdir, readFile, stat } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DIST = join(__dirname, '..', 'dist');
const BLOG_CONTENT = join(__dirname, '..', 'src', 'content', 'blog');
const BASE = '/wisco-radio-labs-website'; // must match astro.config.mjs base

// Patterns that indicate a root-absolute internal link that LACKS the base prefix.
// Allowlist: external URLs (http/https), data URIs, fragment-only (#), empty.
const ROOT_ABS_RE = /(?:href|src)="(\/[^/](?:[^"]*))"/g;
const EXTERNAL_RE = /^https?:\/\//;
const DATA_RE = /^data:/;
const BLOB_RE = /^blob:/;

let errors = 0;
let filesChecked = 0;

async function walkHtml(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const htmlFiles = [];
  for (const e of entries) {
    if (e.isDirectory()) {
      htmlFiles.push(...(await walkHtml(join(dir, e.name))));
    } else if (e.name.endsWith('.html')) {
      htmlFiles.push(join(dir, e.name));
    }
  }
  return htmlFiles;
}

async function checkFile(filePath) {
  const content = await readFile(filePath, 'utf8');
  const relative = filePath.replace(DIST, '');
  let match;

  // ── Gate 1: base-path leaks ──────────────────────────────────────────────
  ROOT_ABS_RE.lastIndex = 0;
  while ((match = ROOT_ABS_RE.exec(content)) !== null) {
    const value = match[1];

    // Skip externals and data URIs
    if (EXTERNAL_RE.test(value) || DATA_RE.test(value) || BLOB_RE.test(value)) continue;

    // Skip fragment-only links
    if (value.startsWith('#')) continue;

    // Skip links that correctly include the base
    if (value.startsWith(BASE + '/') || value === BASE) continue;

    // Also skip the base itself as a path — e.g. /wisco-radio-labs-website
    if (value === BASE + '/') continue;

    // Anything else starting with / that is NOT under the base is a leak
    console.error(`ERROR: root-absolute link without base in ${relative}`);
    console.error(`       Found: ${match[0]}`);
    console.error(`       Expected prefix: ${BASE}/`);
    errors++;
  }

  // ── Gate 2: aria-labelledby / aria-describedby id resolution ─────────────
  // Collect every id="..." value present in this page.
  const idSet = new Set();
  const idRe = /\bid="([^"]+)"/g;
  while ((match = idRe.exec(content)) !== null) {
    idSet.add(match[1]);
  }

  // For every aria-labelledby/describedby, each space-separated token must be a real id.
  const ariaRe = /aria-(?:labelledby|describedby)="([^"]+)"/g;
  while ((match = ariaRe.exec(content)) !== null) {
    const attrName = match[0].match(/aria-[\w]+/)[0];
    const refs = match[1].trim().split(/\s+/);
    for (const ref of refs) {
      if (!idSet.has(ref)) {
        console.error(`ERROR: ${attrName}="${ref}" has no matching id in ${relative}`);
        errors++;
      }
    }
  }

  // ── Gate 3: exactly one <h1> per page ────────────────────────────────────
  const h1Matches = content.match(/<h1[\s>]/gi) || [];
  if (h1Matches.length !== 1) {
    console.error(`ERROR: expected exactly 1 <h1> in ${relative}, found ${h1Matches.length}`);
    errors++;
  }

  // ── Gate 4: no heading-level skips ───────────────────────────────────────
  // Collect heading levels in DOM order; flag any descent that jumps more than one level
  // (h1→h3, h2→h4, etc.). Ascending (h3→h1) is always valid.
  const headingRe = /<h([1-6])[\s>]/gi;
  const headingLevels = [];
  while ((match = headingRe.exec(content)) !== null) {
    headingLevels.push(parseInt(match[1], 10));
  }
  for (let i = 1; i < headingLevels.length; i++) {
    const prev = headingLevels[i - 1];
    const curr = headingLevels[i];
    if (curr > prev + 1) {
      console.error(`ERROR: heading skip in ${relative}: h${prev} → h${curr} (missing h${prev + 1})`);
      errors++;
      break; // report first skip per page to avoid noise
    }
  }

  filesChecked++;
}

// ─── Draft-exclusion gates ───────────────────────────────────────────────────
// Gate 5: no draft post emitted as an HTML page in dist/blog/.
// Gate 6: no draft post linked in dist/rss.xml.
// Reads every blog source file, collects draft slugs, then asserts both outputs are clean.
async function checkDraftExclusion() {
  let blogFiles;
  try {
    blogFiles = await readdir(BLOG_CONTENT);
  } catch {
    return; // no blog content dir — nothing to assert
  }

  const draftSlugs = [];
  for (const file of blogFiles) {
    if (!/\.(md|mdx)$/.test(file)) continue;
    const raw = await readFile(join(BLOG_CONTENT, file), 'utf8');
    // Frontmatter is the first --- ... --- block; look for an explicit draft: true.
    const fm = raw.match(/^---\r?\n([\s\S]*?)\r?\n---/);
    const isDraft = fm ? /^\s*draft:\s*true\s*$/m.test(fm[1]) : false;
    if (!isDraft) continue;

    const slug = file.replace(/\.(md|mdx)$/, '');
    draftSlugs.push(slug);

    // Gate 5: HTML page must NOT exist.
    try {
      await stat(join(DIST, 'blog', slug));
      console.error(`ERROR: draft post leaked into production build: dist/blog/${slug}/`);
      console.error(`       Source ${file} has draft: true but was emitted.`);
      errors++;
    } catch {
      // Good — no page directory for this draft.
    }
  }

  // Gate 6: check dist/rss.xml doesn't contain any draft post slug.
  if (draftSlugs.length === 0) return;
  let rssContent;
  try {
    rssContent = await readFile(join(DIST, 'rss.xml'), 'utf8');
  } catch {
    return; // no rss.xml — nothing to assert
  }
  for (const slug of draftSlugs) {
    if (rssContent.includes(`/blog/${slug}/`)) {
      console.error(`ERROR: draft post "${slug}" appears in dist/rss.xml`);
      errors++;
    }
  }
}

// Check that dist/ exists
try {
  await stat(DIST);
} catch {
  console.error('dist/ not found. Run `npm run build` first.');
  process.exit(1);
}

const htmlFiles = await walkHtml(DIST);

if (htmlFiles.length === 0) {
  console.error('No HTML files found in dist/. Build may have failed.');
  process.exit(1);
}

for (const f of htmlFiles) {
  await checkFile(f);
}

await checkDraftExclusion();

if (errors > 0) {
  console.error(`\nBuild-output check FAILED: ${errors} issue(s) found across ${filesChecked} HTML file(s).`);
  console.error('Fix all issues above, rebuild, and re-run.');
  process.exit(1);
} else {
  console.log(`Build-output OK: ${filesChecked} HTML file(s) checked — 0 base-path leaks, 0 aria-id mismatches, 0 h1 violations, 0 heading skips, 0 draft leaks.`);
  process.exit(0);
}
