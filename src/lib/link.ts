// Base-path-safe link helper.
//
// GitHub Pages project sites are served from a sub-path (/wisco-radio-labs-website/).
// Astro handles imported assets and <Image> automatically, but raw href/src strings
// you author are NOT rewritten. A bare href="/blog" 404s on the deployed site.
//
// Rule: every authored internal link that starts with "/" goes through withBase().
// Imported assets use <Image> — no helper needed.
//
// In build:   import.meta.env.BASE_URL = '/wisco-radio-labs-website/'
// In dev:     import.meta.env.BASE_URL = '/wisco-radio-labs-website/' (with base set)
// At domain:  remove `base` from astro.config.mjs → BASE_URL becomes '/' → links still correct

export const withBase = (path: string): string => {
  const base = import.meta.env.BASE_URL.replace(/\/$/, ''); // strip trailing slash
  const clean = path.replace(/^\//, ''); // strip leading slash
  return clean ? `${base}/${clean}` : `${base}/`;
};
