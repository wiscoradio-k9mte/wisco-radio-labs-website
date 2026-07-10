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
//   7. The footer's "Buy Me a Coffee" link is present on every page with the
//      exact expected href and the target="_blank" + rel="noopener noreferrer"
//      safety attributes an external link needs.
//   8. No email-shaped string (other than the site's own CONTACT_EMAIL) appears in
//      rendered comment content or any comment data file — the PII invariant.
//   9. No comment belonging to a draft: true post's slug leaks into dist/ anywhere.
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
  checkBmcLink,
  checkCommentHtmlPii,
  checkCommentSourcePii,
  checkDraftCommentLeak,
} from '../src/lib/check-links-rules.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DIST = join(__dirname, '..', 'dist');
const BLOG_CONTENT = join(__dirname, '..', 'src', 'content', 'blog');
const COMMENTS_CONTENT = join(__dirname, '..', 'src', 'content', 'comments');
const BASE = '/wisco-radio-labs-website'; // must match astro.config.mjs base
const BMC_URL = 'https://buymeacoffee.com/wiscoradiolabs'; // must match BMC_URL in src/consts.ts
const CONTACT_EMAIL = 'wiscoradio@gmail.com'; // must match CONTACT_EMAIL in src/consts.ts — the
                                               // PII gate's one allowed exception (Gate 8)

let errors = 0;
let filesChecked = 0;
// Collected while walking dist/ HTML so the draft-comment-leak check (Gate 9) can
// search across every built page, not just one at a time.
const htmlContents = [];
// Draft post slugs, populated by checkDraftExclusion() before checkCommentsSource() runs.
let draftSlugs = [];

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
  htmlContents.push(content); // Gate 9 needs to search every page's content later.

  // Run each pure rule and print any violations it finds
  const violations = [
    ...checkBasePathLeaks(content, BASE, context),
    ...checkAriaRefs(content, context),
    ...checkSingleH1(content, context),
    ...checkHeadingSkip(content, context),
    ...checkBmcLink(content, BMC_URL, context),
    ...checkCommentHtmlPii(content, [CONTACT_EMAIL], context),
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

// ─── Gates 8-9: comments PII scan + draft-comment leak ──────────────────────
// Reads every comment data file in src/content/comments/ (the whole live set — real
// volume is near zero, per the DoR). Must run AFTER checkDraftExclusion() has
// populated draftSlugs and AFTER every dist/ HTML file has been read into
// htmlContents (both happen in the same top-level sequence below).
async function checkCommentsSource() {
  let files;
  try {
    files = await readdir(COMMENTS_CONTENT);
  } catch {
    return; // no comments content dir — nothing to assert
  }

  for (const file of files) {
    if (!/\.(yaml|yml)$/.test(file)) continue;
    const raw = await readFile(join(COMMENTS_CONTENT, file), 'utf8');

    // Gate 8: raw source-file scan (backstops the schema's .strict() rejection —
    // see check-links-rules.mjs for why this scans the WHOLE file).
    for (const v of checkCommentSourcePii(raw, [CONTACT_EMAIL], file)) {
      console.error(v.message);
      errors++;
    }

    // Gate 9: a comment keyed to a draft post's slug must never appear in dist/.
    // Lightweight field extraction (same style as parseFrontmatterDraft) — these
    // are flat single-line YAML scalars, no need for a full YAML parser here.
    const postSlugMatch = raw.match(/^postSlug:\s*"?([^"\n]+?)"?\s*$/m);
    const idMatch = raw.match(/^id:\s*"?([^"\n]+?)"?\s*$/m);
    if (!postSlugMatch || !idMatch) continue;
    const postSlug = postSlugMatch[1];
    const commentId = idMatch[1];
    if (!draftSlugs.includes(postSlug)) continue;

    // The comment's page anchor id (id="comment-<id>") is what would prove it
    // rendered — see CommentThread.astro for where that anchor is emitted.
    const anchor = `id="comment-${commentId}"`;
    const appearsInDist = htmlContents.some((html) => html.includes(anchor));
    for (const v of checkDraftCommentLeak(commentId, postSlug, appearsInDist)) {
      console.error(v.message);
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
await checkCommentsSource();

if (errors > 0) {
  console.error(`\nBuild-output check FAILED: ${errors} issue(s) found across ${filesChecked} HTML file(s).`);
  console.error('Fix all issues above, rebuild, and re-run.');
  process.exit(1);
} else {
  console.log(`Build-output OK: ${filesChecked} HTML file(s) checked — 0 base-path leaks, 0 aria-id mismatches, 0 h1 violations, 0 heading skips, 0 draft leaks, 0 missing BMC links, 0 comment PII leaks, 0 draft-comment leaks.`);
  process.exit(0);
}
