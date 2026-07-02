// Unit tests for the pure rule functions extracted from scripts/check-links.mjs.
//
// Each rule gets at least one violating fixture (asserts the error is reported)
// and one clean fixture (asserts no error). Every test here has been mutation-proven
// to bite: the rule's logic was intentionally broken, the test went red, then it was
// restored. (See commit message for the per-rule mutation used.)
//
// These tests run under `npm test` (vitest). No file I/O — the rules are pure
// functions that operate on HTML and frontmatter strings.

import { describe, it, expect } from 'vitest';
import {
  checkBasePathLeaks,
  checkAriaRefs,
  checkSingleH1,
  checkHeadingSkip,
  parseFrontmatterDraft,
  checkDraftHtmlLeak,
  checkDraftInRss,
  checkBmcLink,
} from './check-links-rules.mjs';

const BASE = '/wisco-radio-labs-website';
const BMC_URL = 'https://buymeacoffee.com/wiscoradiolabs';

// ─── Gate 1: checkBasePathLeaks ───────────────────────────────────────────────

describe('checkBasePathLeaks', () => {
  it('reports a root-absolute href missing the base prefix', () => {
    const html = '<a href="/blog">link</a>';
    const vs = checkBasePathLeaks(html, BASE);
    expect(vs).toHaveLength(1);
    expect(vs[0].message).toContain('root-absolute link without base');
    expect(vs[0].message).toContain('href="/blog"');
    expect(vs[0].message).toContain(`Expected prefix: ${BASE}/`);
  });

  it('reports a root-absolute src missing the base prefix', () => {
    const html = '<img src="/images/photo.png">';
    const vs = checkBasePathLeaks(html, BASE);
    expect(vs).toHaveLength(1);
    expect(vs[0].message).toContain('src="/images/photo.png"');
  });

  it('does not report a link that correctly includes the base', () => {
    const html = `<a href="${BASE}/blog">ok</a>`;
    expect(checkBasePathLeaks(html, BASE)).toHaveLength(0);
  });

  it('does not report an external https link', () => {
    const html = '<a href="https://example.com/page">external</a>';
    expect(checkBasePathLeaks(html, BASE)).toHaveLength(0);
  });

  it('does not report a data URI', () => {
    const html = '<img src="data:image/png;base64,abc123">';
    expect(checkBasePathLeaks(html, BASE)).toHaveLength(0);
  });

  it('does not report a protocol-relative URL (double-slash)', () => {
    // //cdn.example.com starts with / but then another /, which the regex excludes
    // via the [^/] character class after the first slash — so it should not match.
    const html = '<script src="//cdn.example.com/x.js"></script>';
    expect(checkBasePathLeaks(html, BASE)).toHaveLength(0);
  });

  it('includes the context label in the violation message', () => {
    const html = '<a href="/about">x</a>';
    const vs = checkBasePathLeaks(html, BASE, '/index.html');
    expect(vs[0].message).toContain('/index.html');
  });

  it('reports multiple leaks in one file', () => {
    const html = '<a href="/about">a</a><a href="/contact">b</a>';
    expect(checkBasePathLeaks(html, BASE)).toHaveLength(2);
  });
});

// ─── Gate 2: checkAriaRefs ────────────────────────────────────────────────────

describe('checkAriaRefs', () => {
  it('reports an aria-labelledby reference to a missing id', () => {
    const html = '<nav aria-labelledby="nav-title"><h2>Nav</h2></nav>';
    // No id="nav-title" present — violation expected
    const vs = checkAriaRefs(html);
    expect(vs).toHaveLength(1);
    expect(vs[0].message).toContain('aria-labelledby="nav-title"');
    expect(vs[0].message).toContain('has no matching id');
  });

  it('reports an aria-describedby reference to a missing id', () => {
    const html = '<input aria-describedby="hint-text"><p>Enter value</p>';
    const vs = checkAriaRefs(html);
    expect(vs).toHaveLength(1);
    expect(vs[0].message).toContain('aria-describedby="hint-text"');
  });

  it('does not report when the id is present on the page', () => {
    const html = '<h2 id="nav-title">Navigation</h2><nav aria-labelledby="nav-title"></nav>';
    expect(checkAriaRefs(html)).toHaveLength(0);
  });

  it('does not report when aria-describedby id is present', () => {
    const html = '<p id="hint-text">Enter a value.</p><input aria-describedby="hint-text">';
    expect(checkAriaRefs(html)).toHaveLength(0);
  });

  it('handles multiple space-separated tokens in aria-labelledby', () => {
    // First token exists; second is missing
    const html = '<span id="first">a</span><div aria-labelledby="first second"></div>';
    const vs = checkAriaRefs(html);
    expect(vs).toHaveLength(1);
    expect(vs[0].message).toContain('"second"');
  });

  it('includes the context label in the violation message', () => {
    const html = '<div aria-labelledby="missing"></div>';
    const vs = checkAriaRefs(html, '/page.html');
    expect(vs[0].message).toContain('/page.html');
  });
});

// ─── Gate 3: checkSingleH1 ────────────────────────────────────────────────────

describe('checkSingleH1', () => {
  it('reports when the page has two <h1> elements', () => {
    const html = '<h1>Title One</h1><h1>Title Two</h1>';
    const vs = checkSingleH1(html);
    expect(vs).toHaveLength(1);
    expect(vs[0].message).toContain('found 2');
  });

  it('reports when the page has zero <h1> elements', () => {
    const html = '<h2>Section</h2>';
    const vs = checkSingleH1(html);
    expect(vs).toHaveLength(1);
    expect(vs[0].message).toContain('found 0');
  });

  it('does not report when exactly one <h1> is present', () => {
    const html = '<h1>Page Title</h1><h2>Section</h2>';
    expect(checkSingleH1(html)).toHaveLength(0);
  });

  it('counts <h1> with attributes as a match', () => {
    // <h1 class="hero"> — should count, not slip past the regex
    const html = '<h1 class="hero">Title</h1>';
    expect(checkSingleH1(html)).toHaveLength(0);
  });

  it('includes the context label in the violation message', () => {
    const html = '<h1>A</h1><h1>B</h1>';
    const vs = checkSingleH1(html, '/about/index.html');
    expect(vs[0].message).toContain('/about/index.html');
  });
});

// ─── Gate 4: checkHeadingSkip ─────────────────────────────────────────────────

describe('checkHeadingSkip', () => {
  it('reports an h1→h3 skip (missing h2)', () => {
    const html = '<h1>Title</h1><h3>Section</h3>';
    const vs = checkHeadingSkip(html);
    expect(vs).toHaveLength(1);
    expect(vs[0].message).toContain('h1 → h3');
    expect(vs[0].message).toContain('missing h2');
  });

  it('reports an h2→h4 skip (missing h3)', () => {
    const html = '<h1>Title</h1><h2>Section</h2><h4>Sub</h4>';
    const vs = checkHeadingSkip(html);
    expect(vs).toHaveLength(1);
    expect(vs[0].message).toContain('h2 → h4');
    expect(vs[0].message).toContain('missing h3');
  });

  it('does not report when headings descend one level at a time', () => {
    const html = '<h1>Title</h1><h2>Section</h2><h3>Sub</h3>';
    expect(checkHeadingSkip(html)).toHaveLength(0);
  });

  it('does not report ascending jumps (h3→h1 is valid)', () => {
    const html = '<h1>A</h1><h2>B</h2><h3>C</h3><h1>D</h1>';
    expect(checkHeadingSkip(html)).toHaveLength(0);
  });

  it('reports only the first skip per page to avoid noise', () => {
    // Two skips: h1→h3 and h2→h4 — only first should surface
    const html = '<h1>A</h1><h3>B</h3><h2>C</h2><h4>D</h4>';
    expect(checkHeadingSkip(html)).toHaveLength(1);
  });

  it('includes the context label in the violation message', () => {
    const html = '<h1>A</h1><h3>C</h3>';
    const vs = checkHeadingSkip(html, '/blog/post.html');
    expect(vs[0].message).toContain('/blog/post.html');
  });
});

// ─── Gate 5a: parseFrontmatterDraft ──────────────────────────────────────────

describe('parseFrontmatterDraft', () => {
  it('returns true when frontmatter contains draft: true', () => {
    const raw = `---
title: My Draft
draft: true
pubDate: 2026-06-01
---
Content here.`;
    expect(parseFrontmatterDraft(raw)).toBe(true);
  });

  it('returns false when frontmatter contains draft: false', () => {
    const raw = `---
title: Published Post
draft: false
pubDate: 2026-06-01
---
Content here.`;
    expect(parseFrontmatterDraft(raw)).toBe(false);
  });

  it('returns false when frontmatter has no draft field', () => {
    const raw = `---
title: Published Post
pubDate: 2026-06-01
---
Content here.`;
    expect(parseFrontmatterDraft(raw)).toBe(false);
  });

  it('returns false when the file has no frontmatter at all', () => {
    const raw = 'No frontmatter here, just content.';
    expect(parseFrontmatterDraft(raw)).toBe(false);
  });

  it('is not tripped by "draft: true" appearing in body text', () => {
    // The word draft: true in the body should not be parsed as frontmatter
    const raw = `---
title: Real Post
pubDate: 2026-06-01
---
Some body text with draft: true mentioned in passing.`;
    expect(parseFrontmatterDraft(raw)).toBe(false);
  });
});

// ─── Gate 5b: checkDraftHtmlLeak ─────────────────────────────────────────────

describe('checkDraftHtmlLeak', () => {
  it('returns a violation when a draft post page exists in dist/', () => {
    const vs = checkDraftHtmlLeak('my-draft', 'my-draft.md', true);
    expect(vs).toHaveLength(1);
    expect(vs[0].message).toContain('leaked into production build');
    expect(vs[0].message).toContain('dist/blog/my-draft/');
    expect(vs[0].message).toContain('my-draft.md');
  });

  it('returns no violation when the draft page does not exist', () => {
    expect(checkDraftHtmlLeak('my-draft', 'my-draft.md', false)).toHaveLength(0);
  });
});

// ─── Gate 6: checkDraftInRss ─────────────────────────────────────────────────

describe('checkDraftInRss', () => {
  it('returns a violation when a draft slug appears in the RSS feed', () => {
    const rss = `<item><link>https://example.com/blog/secret-draft/</link></item>`;
    const vs = checkDraftInRss(rss, ['secret-draft']);
    expect(vs).toHaveLength(1);
    expect(vs[0].message).toContain('"secret-draft"');
    expect(vs[0].message).toContain('dist/rss.xml');
  });

  it('returns no violation when no draft slug appears in the RSS', () => {
    const rss = `<item><link>https://example.com/blog/published-post/</link></item>`;
    expect(checkDraftInRss(rss, ['secret-draft'])).toHaveLength(0);
  });

  it('returns no violation for an empty draft slugs list', () => {
    const rss = `<item><link>https://example.com/blog/anything/</link></item>`;
    expect(checkDraftInRss(rss, [])).toHaveLength(0);
  });

  it('reports multiple draft slugs that all appear in the RSS', () => {
    const rss = `/blog/draft-a/ and /blog/draft-b/`;
    expect(checkDraftInRss(rss, ['draft-a', 'draft-b'])).toHaveLength(2);
  });
});

// ─── Gate 7: checkBmcLink ─────────────────────────────────────────────────────

describe('checkBmcLink', () => {
  it('does not report when the link is present with the correct href and safety attrs', () => {
    const html = `<a href="${BMC_URL}" target="_blank" rel="noopener noreferrer">Buy me a coffee</a>`;
    expect(checkBmcLink(html, BMC_URL)).toHaveLength(0);
  });

  it('reports when the footer link is missing entirely', () => {
    const html = '<footer><p>&copy; 2026</p></footer>';
    const vs = checkBmcLink(html, BMC_URL);
    expect(vs).toHaveLength(1);
    expect(vs[0].message).toContain('missing "Buy Me a Coffee" footer link');
    expect(vs[0].message).toContain(BMC_URL);
  });

  it('reports when the href points at the wrong URL', () => {
    const html = '<a href="https://buymeacoffee.com/someone-else" target="_blank" rel="noopener noreferrer">coffee</a>';
    const vs = checkBmcLink(html, BMC_URL);
    expect(vs).toHaveLength(1);
    expect(vs[0].message).toContain('missing "Buy Me a Coffee" footer link');
  });

  it('reports when target="_blank" is missing', () => {
    const html = `<a href="${BMC_URL}" rel="noopener noreferrer">coffee</a>`;
    const vs = checkBmcLink(html, BMC_URL);
    expect(vs).toHaveLength(1);
    expect(vs[0].message).toContain('missing target="_blank"');
  });

  it('reports when rel="noopener noreferrer" is missing', () => {
    const html = `<a href="${BMC_URL}" target="_blank">coffee</a>`;
    const vs = checkBmcLink(html, BMC_URL);
    expect(vs).toHaveLength(1);
    expect(vs[0].message).toContain('missing rel="noopener noreferrer"');
  });

  it('accepts rel attribute order reversed (noreferrer noopener)', () => {
    const html = `<a href="${BMC_URL}" target="_blank" rel="noreferrer noopener">coffee</a>`;
    expect(checkBmcLink(html, BMC_URL)).toHaveLength(0);
  });

  it('includes the context label in the violation message', () => {
    const html = '<footer></footer>';
    const vs = checkBmcLink(html, BMC_URL, '/about/index.html');
    expect(vs[0].message).toContain('/about/index.html');
  });
});
