#!/usr/bin/env node
// Link-integrity and a11y check (acceptance criteria gates).
//
// Scans the built dist/ for HTML files and asserts:
//   1. No href or src attribute points at a root-absolute path that LACKS the base prefix
//      (i.e., /blog instead of /wisco-radio-labs-website/blog). These 404 on GH Pages.
//   2. Every aria-labelledby and aria-describedby value resolves to an existing id on the page.
//   3. Exactly one <h1> per page.
//   4. No heading-level skips (h1→h3 without an intervening h2, etc.).
//   5. No draft: true post leaks into any dist/blog/<slug>/ directory.
//   6. No draft: true post leaks into dist/rss.xml.
//
// Run after `npm run build`:
//   npm run test:links
//
// In CI this runs after the build step in deploy.yml.
// A leak here means a withBase() call was forgotten or a draft filter was missed.

import { readdir, readFile, stat } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  checkBasePathLeaks,
  checkAriaRefs,
  checkSingleH1,
  checkHeadingSkip,
  parseFrontmatterDraft,
  checkDraftHtmlLeak,
  checkDraftInRss,
} from '../src/lib/check-links-rules.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DIST = join(__dirname, '..', 'dist');
const BLOG_CONTENT = join(__dirname, '..', 'src', 'content', 'blog');
const BASE = '/wisco-radio-labs-website'; // must match astro.config.mjs base

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
  // Relative path is the label used in every error message for this file.
  // Strip the absolute dist prefix so the path reads as /blog/index.html etc.
  const context = filePath.replace(DIST, '');

  // Run each pure rule and print any violations it finds
  const violations = [
    ...checkBasePathLeaks(content, BASE, context),
    ...checkAriaRefs(content, context),
    ...checkSingleH1(content, context),
    ...checkHeadingSkip(content, context),
  ];
  for (const v of violations) {
    console.error(v.message);
    errors++;
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
    if (!parseFrontmatterDraft(raw)) continue;

    const slug = file.replace(/\.(md|mdx)$/, '');
    draftSlugs.push(slug);

    // Gate 5: HTML page must NOT exist. stat() succeeds when the path exists.
    let pageExists = false;
    try {
      await stat(join(DIST, 'blog', slug));
      pageExists = true;
    } catch {
      // Good — no page directory for this draft.
    }
    for (const v of checkDraftHtmlLeak(slug, file, pageExists)) {
      console.error(v.message);
      errors++;
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
  for (const v of checkDraftInRss(rssContent, draftSlugs)) {
    console.error(v.message);
    errors++;
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
