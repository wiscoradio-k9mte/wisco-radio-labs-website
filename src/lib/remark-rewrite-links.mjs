// remark-rewrite-links.mjs
// Remark plugin that prepends the Astro base path to root-absolute internal links
// in Markdown content (href="/foo" → href="/wisco-radio-labs-website/foo").
//
// Why: Markdown authors write "/products/" (natural), but withBase() isn't available
// in plain .md files. This plugin runs at build time in the Markdown pipeline and
// rewrites before HTML is emitted — so the dist/ output has base-correct hrefs.
//
// It only rewrites links that:
//   1. Start with exactly "/" (root-absolute internal links)
//   2. Do NOT already start with the base prefix (idempotent)
//   3. Are not protocol-relative ("//") or external ("http")
//
// Usage in astro.config.mjs:
//   import remarkRewriteLinks from './src/lib/remark-rewrite-links.mjs';
//   markdown: { remarkPlugins: [[remarkRewriteLinks, { base: '/wisco-radio-labs-website' }]] }
//
// At domain go-live (base removed from astro.config), omit this plugin or pass base: ''.

import { visit } from 'unist-util-visit';

/** @param {{ base: string }} options */
export default function remarkRewriteLinks({ base = '' } = {}) {
  const b = base.replace(/\/$/, ''); // strip trailing slash
  return function (tree) {
    if (!b) return; // no-op when no base (root domain)

    visit(tree, 'link', (node) => {
      const url = node.url;
      if (
        typeof url === 'string' &&
        url.startsWith('/') &&         // root-absolute
        !url.startsWith('//') &&       // not protocol-relative
        !url.startsWith(b + '/') &&    // not already prefixed
        url !== b                      // not exactly the base
      ) {
        node.url = `${b}${url}`;
      }
    });
  };
}
