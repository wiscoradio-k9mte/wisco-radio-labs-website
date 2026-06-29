// Unit tests for the real remark plugin in remark-rewrite-links.mjs.
//
// The plugin prepends the Astro base path to root-absolute internal links in
// Markdown (href="/foo" → href="/wisco-radio-labs-website/foo"), leaving external,
// protocol-relative, anchor, and already-prefixed links alone. It is the build-time
// counterpart to withBase() for plain .md content (the #1 GitHub-Pages breakage risk).
//
// These tests import and run the ACTUAL exported transformer over a minimal mdast
// tree of `link` nodes and assert the produced node.url — break the join in the
// plugin and they go red. (Proven by mutation 2026-06-29.)

import { describe, it, expect } from 'vitest';
import remarkRewriteLinks from './remark-rewrite-links.mjs';

const BASE = '/wisco-radio-labs-website';

// Build a minimal mdast root whose children are link nodes with the given urls,
// run the plugin's transformer over it, and return the resulting urls in order.
function rewrite(urls: string[], base: string = BASE): string[] {
  const tree = {
    type: 'root',
    children: urls.map((url) => ({
      type: 'link',
      url,
      children: [{ type: 'text', value: 'x' }],
    })),
  };
  // remarkRewriteLinks(opts) returns the transformer (tree) => void; it mutates in place.
  remarkRewriteLinks({ base })(tree as any);
  return tree.children.map((n: any) => n.url);
}

describe('remarkRewriteLinks', () => {
  it('prepends the base to a root-absolute internal link', () => {
    expect(rewrite(['/products/'])).toEqual(['/wisco-radio-labs-website/products/']);
  });

  it('rewrites a bare root-absolute link with no trailing slash', () => {
    expect(rewrite(['/blog'])).toEqual(['/wisco-radio-labs-website/blog']);
  });

  it('leaves external http(s) links untouched', () => {
    expect(rewrite(['https://snapcraft.io/wr-cw-trainer'])).toEqual([
      'https://snapcraft.io/wr-cw-trainer',
    ]);
  });

  it('leaves protocol-relative links untouched', () => {
    expect(rewrite(['//cdn.example.com/x.js'])).toEqual(['//cdn.example.com/x.js']);
  });

  it('leaves in-page anchor links untouched', () => {
    expect(rewrite(['#section'])).toEqual(['#section']);
  });

  it('leaves relative links untouched', () => {
    expect(rewrite(['./sibling', 'nested/page'])).toEqual(['./sibling', 'nested/page']);
  });

  it('is idempotent — does not double-prefix an already-based link', () => {
    expect(rewrite(['/wisco-radio-labs-website/about/'])).toEqual([
      '/wisco-radio-labs-website/about/',
    ]);
  });

  it('does not rewrite a link that is exactly the base', () => {
    expect(rewrite(['/wisco-radio-labs-website'])).toEqual(['/wisco-radio-labs-website']);
  });

  it('is a no-op when base is empty (root-domain go-live)', () => {
    expect(rewrite(['/products/'], '')).toEqual(['/products/']);
  });

  it('tolerates a base passed with a trailing slash (strips it, no double slash)', () => {
    expect(rewrite(['/products/'], '/wisco-radio-labs-website/')).toEqual([
      '/wisco-radio-labs-website/products/',
    ]);
  });
});
