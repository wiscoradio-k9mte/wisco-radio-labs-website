import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import { unified } from '@astrojs/markdown-remark';
import remarkRewriteLinks from './src/lib/remark-rewrite-links.mjs';
import rehypeInlineFigure from './src/lib/rehype-inline-figure.mjs';

const BASE = '/wisco-radio-labs-website';

// Site + base are the GH Pages linchpin.
// When the custom domain is wired: set site to the domain, REMOVE base, remove remarkRewriteLinks.
// Add public/CNAME at that point.
export default defineConfig({
  site: 'https://wiscoradio-k9mte.github.io',
  base: BASE, // no trailing slash; Astro normalizes
  // Astro 7 changed the default true -> 'jsx' (collapses whitespace between inline
  // elements, a real rendering diff on a prose site). Pin true to keep v6 output.
  compressHTML: true,
  // No React islands in v1 — all interactive elements are plain Astro + module scripts.
  // Re-add @astrojs/react here (and reinstall the package) when a true React island is needed
  // (e.g. the planned tag-filter component on the blog index).
  integrations: [sitemap()],
  markdown: {
    // Rewrite root-absolute links in Markdown content to include the base path.
    // Plain .md files can't call withBase() — this plugin handles it at build time.
    //
    // Wired via markdown.processor (the Astro 6 API) instead of the deprecated
    // markdown.remarkPlugins. The processor is the unified() instance that Astro's
    // markdown pipeline already uses internally; we supply our plugin here and it
    // merges cleanly with GFM/smartypants defaults.
    //
    // Astro 7 demoted @astrojs/markdown-remark from a hard astro dependency to an
    // optional peer, and defaults to its native "Sätteri" renderer instead of this
    // unified() pipeline. Sätteri doesn't run remark/rehype plugins, and both
    // remarkRewriteLinks (base-path safety) and rehypeInlineFigure are load-bearing
    // here, so Sätteri was deliberately NOT adopted — markdown-remark is now an
    // explicit dependency (package.json) so this import keeps resolving.
    //
    // Domain go-live: set site to domain, remove base, remove remarkRewriteLinks.
    processor: unified({
      remarkPlugins: [[remarkRewriteLinks, { base: BASE }]],
      // Promote inline image paragraphs to semantic <figure>/<figcaption>.
      rehypePlugins: [rehypeInlineFigure],
    }),
  },
  // image: defaults (sharp) are fine
});
