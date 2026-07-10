// Pure, exported rule functions for scripts/check-links.mjs.
//
// Each function operates on strings (HTML content or raw frontmatter) and
// returns an array of violation objects — no file I/O, no process.exit,
// no console.error. This makes every rule independently unit-testable.
//
// Callers (the CLI, tests) supply the strings; only the CLI touches the fs.
//
// Violation shape: { message: string }
//   message may contain embedded newlines for multi-line error output, matching
//   the original multi-console.error style the CLI used before extraction.
//
// Gates 8-9 (blog comments) are the PII invariant + draft-comment leak checks —
// see the comment above each for scope/rationale.

// ─── Gate 1: base-path leak detection ───────────────────────────────────────

/**
 * Returns one violation per root-absolute href or src that lacks the base prefix.
 * These links 404 on GitHub Pages because the site is served from a sub-path.
 *
 * @param {string} html  full HTML file content
 * @param {string} base  configured base path, e.g. '/wisco-radio-labs-website'
 * @param {string} [ctx] file label for error messages, e.g. '/blog/index.html'
 * @returns {{ message: string }[]}
 */
export function checkBasePathLeaks(html, base, ctx = '') {
  const violations = [];
  // Matches href="/<non-slash>..." and src="/<non-slash>..." — root-absolute only.
  // Captures just the value so we can inspect it; the full match[0] goes in the message.
  const re = /(?:href|src)="(\/[^/](?:[^"]*))"/g;
  let match;
  while ((match = re.exec(html)) !== null) {
    const value = match[1];
    // Allowlist: skip externals, data URIs, blob URIs (captured by the regex but safe)
    if (/^https?:\/\//.test(value) || /^data:/.test(value) || /^blob:/.test(value)) continue;
    // Skip fragment-only links (shouldn't reach here given the regex, but guard anyway)
    if (value.startsWith('#')) continue;
    // Skip links that correctly include the base
    if (value.startsWith(base + '/') || value === base || value === base + '/') continue;
    // Anything else starting with / that is NOT under the base is a leak
    violations.push({
      message:
        `ERROR: root-absolute link without base in ${ctx}\n` +
        `       Found: ${match[0]}\n` +
        `       Expected prefix: ${base}/`,
    });
  }
  return violations;
}

// ─── Gate 2: aria-labelledby / aria-describedby id resolution ───────────────

/**
 * Returns one violation per aria-labelledby or aria-describedby token that has
 * no matching id="..." attribute anywhere on the page.
 *
 * @param {string} html  full HTML file content
 * @param {string} [ctx] file label for error messages
 * @returns {{ message: string }[]}
 */
export function checkAriaRefs(html, ctx = '') {
  const violations = [];

  // Collect every id present in the page
  const idSet = new Set();
  const idRe = /\bid="([^"]+)"/g;
  let match;
  while ((match = idRe.exec(html)) !== null) idSet.add(match[1]);

  // For each aria-labelledby/describedby, every space-separated token must resolve
  const ariaRe = /aria-(?:labelledby|describedby)="([^"]+)"/g;
  while ((match = ariaRe.exec(html)) !== null) {
    // Extract the attribute name from the full match for the error message
    const attrName = match[0].match(/aria-[\w]+/)[0];
    const refs = match[1].trim().split(/\s+/);
    for (const ref of refs) {
      if (!idSet.has(ref)) {
        violations.push({
          message: `ERROR: ${attrName}="${ref}" has no matching id in ${ctx}`,
        });
      }
    }
  }
  return violations;
}

// ─── Gate 3: exactly one <h1> per page ──────────────────────────────────────

/**
 * Returns a violation if the page does not contain exactly one <h1> element.
 *
 * @param {string} html  full HTML file content
 * @param {string} [ctx] file label for error messages
 * @returns {{ message: string }[]}
 */
export function checkSingleH1(html, ctx = '') {
  const h1Matches = html.match(/<h1[\s>]/gi) || [];
  if (h1Matches.length === 1) return [];
  return [{ message: `ERROR: expected exactly 1 <h1> in ${ctx}, found ${h1Matches.length}` }];
}

// ─── Gate 4: no heading-level skips ─────────────────────────────────────────

/**
 * Returns a violation if any heading descent skips a level (e.g. h1→h3).
 * Ascending jumps (h3→h1) are always valid. Reports the first skip only.
 *
 * @param {string} html  full HTML file content
 * @param {string} [ctx] file label for error messages
 * @returns {{ message: string }[]}
 */
export function checkHeadingSkip(html, ctx = '') {
  const headingRe = /<h([1-6])[\s>]/gi;
  const levels = [];
  let match;
  while ((match = headingRe.exec(html)) !== null) {
    levels.push(parseInt(match[1], 10));
  }
  for (let i = 1; i < levels.length; i++) {
    const prev = levels[i - 1];
    const curr = levels[i];
    if (curr > prev + 1) {
      return [{
        message: `ERROR: heading skip in ${ctx}: h${prev} → h${curr} (missing h${prev + 1})`,
      }];
    }
  }
  return [];
}

// ─── Gate 5: draft-exclusion ─────────────────────────────────────────────────
// Split into three pure functions so each testable piece can be exercised alone:
//   parseFrontmatterDraft — detect draft in source
//   checkDraftHtmlLeak    — detect the HTML-page emission
//   checkDraftInRss       — detect the RSS mention

/**
 * Returns true if the markdown file's frontmatter contains `draft: true`.
 * The caller is responsible for reading the file; this only parses the string.
 *
 * @param {string} raw  full .md or .mdx file content
 * @returns {boolean}
 */
export function parseFrontmatterDraft(raw) {
  // Frontmatter is the first --- ... --- block at the start of the file
  const fm = raw.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  return fm ? /^\s*draft:\s*true\s*$/m.test(fm[1]) : false;
}

/**
 * Returns a violation if a draft post's HTML page was emitted into dist/.
 * The caller performs the stat() check; this receives the boolean result.
 *
 * @param {string}  slug       post slug (e.g. 'my-draft-post')
 * @param {string}  file       source filename (e.g. 'my-draft-post.md') — for the error message
 * @param {boolean} pageExists true if dist/blog/<slug>/ exists on disk
 * @returns {{ message: string }[]}
 */
export function checkDraftHtmlLeak(slug, file, pageExists) {
  if (!pageExists) return [];
  return [{
    message:
      `ERROR: draft post leaked into production build: dist/blog/${slug}/\n` +
      `       Source ${file} has draft: true but was emitted.`,
  }];
}

/**
 * Returns one violation per draft slug that appears in the RSS feed.
 *
 * @param {string}   rssContent full rss.xml content
 * @param {string[]} draftSlugs list of known draft post slugs
 * @returns {{ message: string }[]}
 */
export function checkDraftInRss(rssContent, draftSlugs) {
  const violations = [];
  for (const slug of draftSlugs) {
    if (rssContent.includes(`/blog/${slug}/`)) {
      violations.push({ message: `ERROR: draft post "${slug}" appears in dist/rss.xml` });
    }
  }
  return violations;
}

// ─── Gate 7: footer "Buy Me a Coffee" link present on every page ───────────

/**
 * Returns a violation if the page's footer is missing the Buy Me a Coffee
 * link, or the link is missing the noopener/noreferrer safety attributes an
 * external target="_blank" anchor needs.
 *
 * @param {string} html full HTML file content
 * @param {string} url  the exact BMC href expected (BMC_URL from src/consts.ts)
 * @param {string} [ctx] file label for error messages
 * @returns {{ message: string }[]}
 */
export function checkBmcLink(html, url, ctx = '') {
  // Escape regex metacharacters in the URL so it matches literally.
  const escaped = url.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const anchorRe = new RegExp(`<a\\b[^>]*href="${escaped}"[^>]*>`, 'i');
  const match = html.match(anchorRe);
  if (!match) {
    return [{ message: `ERROR: missing "Buy Me a Coffee" footer link (href="${url}") in ${ctx}` }];
  }
  const tag = match[0];
  const violations = [];
  if (!/target="_blank"/.test(tag)) {
    violations.push({ message: `ERROR: "Buy Me a Coffee" link in ${ctx} is missing target="_blank"` });
  }
  if (!/rel="[^"]*\bnoopener\b[^"]*\bnoreferrer\b[^"]*"/.test(tag) &&
      !/rel="[^"]*\bnoreferrer\b[^"]*\bnoopener\b[^"]*"/.test(tag)) {
    violations.push({ message: `ERROR: "Buy Me a Coffee" link in ${ctx} is missing rel="noopener noreferrer"` });
  }
  return violations;
}

// ─── Gate 8: comments PII invariant (blog-comments T14) ─────────────────────
// No email-shaped string from the comments pipeline may ever reach the repo or dist/.
// Two scan surfaces, each with its own scoping rationale:
//   - Rendered HTML: scoped to <span data-comment-text>…</span> regions only — the
//     marker every comment author/body render uses. Scanning the WHOLE page would
//     false-positive on the site's own CONTACT_EMAIL, which legitimately appears many
//     times in unrelated chrome (footer mailto, contact/privacy pages) — narrowing to
//     just the user-submitted comment text is both more precise AND the literal ask
//     ("the rendered comment output").
//   - Source data files: the ENTIRE raw file is scanned — a comment YAML file has
//     nothing but comment fields, so there is no legitimate chrome to exempt.
// In both scopes the ONLY allowed exception is an EXACT match for the site's own
// CONTACT_EMAIL (never a substring/prefix match) — so nothing else can hide behind
// it, and a genuine leak (any other email-shaped string) still bites.

const EMAIL_RE = /[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/g;

/**
 * Every email-shaped string in `text` that is NOT an exact match for one of the
 * allowed strings (normally just [CONTACT_EMAIL]).
 *
 * @param {string} text
 * @param {string[]} allowlist
 * @returns {string[]}
 */
export function findLeakedEmails(text, allowlist = []) {
  const matches = text.match(EMAIL_RE) || [];
  return matches.filter((m) => !allowlist.includes(m));
}

/**
 * Scans only the `data-comment-text` marked regions of a rendered HTML page —
 * the boundary the comment templates use to wrap user-submitted author names
 * and comment bodies — for non-allowlisted email-shaped strings.
 *
 * @param {string} html
 * @param {string[]} allowlist
 * @param {string} [ctx]
 * @returns {{ message: string }[]}
 */
export function checkCommentHtmlPii(html, allowlist, ctx = '') {
  const regionRe = /<span[^>]*\bdata-comment-text\b[^>]*>([\s\S]*?)<\/span>/g;
  const violations = [];
  let match;
  while ((match = regionRe.exec(html)) !== null) {
    for (const email of findLeakedEmails(match[1], allowlist)) {
      violations.push({
        message: `ERROR: email-shaped string "${email}" found in rendered comment content in ${ctx}`,
      });
    }
  }
  return violations;
}

/**
 * Scans an entire comment data-file's raw text for non-allowlisted email-shaped
 * strings — catches both a body that contains one and an `email:` key someone
 * added by hand (backstop for Gate T9's schema strictness).
 *
 * @param {string} raw  full comment data-file content (YAML)
 * @param {string[]} allowlist
 * @param {string} [ctx]
 * @returns {{ message: string }[]}
 */
export function checkCommentSourcePii(raw, allowlist, ctx = '') {
  return findLeakedEmails(raw, allowlist).map((email) => ({
    message: `ERROR: email-shaped string "${email}" found in comment source file ${ctx}`,
  }));
}

// ─── Gate 9: a draft post's comment must never leak into dist/ (T13) ───────
// Extends the existing draft-exclusion gate to comment data: a comment keyed to a
// draft: true post's slug should never render anywhere, because that post's own page
// is never built. This asserts it directly rather than relying only on the absence
// of the post page.

/**
 * @param {string}  commentId
 * @param {string}  postSlug
 * @param {boolean} appearsInDist  true if any dist HTML contains this comment's anchor id
 * @returns {{ message: string }[]}
 */
export function checkDraftCommentLeak(commentId, postSlug, appearsInDist) {
  if (!appearsInDist) return [];
  return [{
    message:
      `ERROR: comment "${commentId}" for draft post "${postSlug}" leaked into dist/\n` +
      '       (that post\'s page should never be built, so this comment should never appear).',
  }];
}
