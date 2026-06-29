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
//
// The optional `base` parameter exists for unit tests: tests pass the configured base
// explicitly so the join logic is testable without env-injection tricks. Every call site
// in .astro files omits it and gets import.meta.env.BASE_URL as intended.

export const withBase = (path: string, base = import.meta.env.BASE_URL): string => {
  const b = base.replace(/\/$/, ''); // strip trailing slash from base
  const clean = path.replace(/^\//, ''); // strip leading slash from path
  return clean ? `${b}/${clean}` : `${b}/`;
};
