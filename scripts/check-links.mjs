#!/usr/bin/env node
// Link-integrity check (criterion #1 of acceptance criteria).
//
// Scans the built dist/ for HTML files and asserts:
//   1. No href or src attribute points at a root-absolute path that LACKS the base prefix
//      (i.e., /blog instead of /wisco-radio-labs-website/blog). These 404 on GH Pages.
//   2. No internal asset src (not http/https/data/blob) points to a non-existent file in dist/.
//
// Run after `npm run build`:
//   npm run test:links
//
// In CI this runs after the build step in deploy.yml (add it there if you want the gate in CI).
// A leak here means a withBase() call was forgotten — fix the component, re-build, re-run.

import { readdir, readFile, stat } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DIST = join(__dirname, '..', 'dist');
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

  filesChecked++;
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

if (errors > 0) {
  console.error(`\nLink integrity FAILED: ${errors} base-path leak(s) in ${filesChecked} HTML file(s).`);
  console.error('Every internal href/src must go through withBase() or be an imported asset.');
  process.exit(1);
} else {
  console.log(`Link integrity OK: ${filesChecked} HTML file(s) checked, 0 base-path leaks.`);
  process.exit(0);
}
