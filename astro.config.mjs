import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';
import remarkRewriteLinks from './src/lib/remark-rewrite-links.mjs';

const BASE = '/wisco-radio-labs-website';

// Site + base are the GH Pages linchpin.
// When the custom domain is wired: set site to the domain, REMOVE base, remove remarkRewriteLinks.
// Add public/CNAME at that point.
export default defineConfig({
  site: 'https://wiscoradio-k9mte.github.io',
  base: BASE, // no trailing slash; Astro normalizes
  integrations: [react(), sitemap()],
  markdown: {
    // Rewrite root-absolute links in Markdown content to include the base path.
    // Plain .md files can't call withBase() — this plugin handles it at build time.
    remarkPlugins: [[remarkRewriteLinks, { base: BASE }]],
  },
  // image: defaults (sharp) are fine
});
