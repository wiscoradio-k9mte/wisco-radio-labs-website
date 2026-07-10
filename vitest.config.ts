// Vitest configuration.
//
// withBase() accepts an optional `base` parameter (defaulting to import.meta.env.BASE_URL)
// so tests can pass the configured base explicitly without env-injection tricks. Vitest 4
// does not honor the Vite `base` option to set import.meta.env.BASE_URL — the optional
// param on withBase() is what makes the function unit-testable.
//
// getViteConfig (from astro/config) replaces plain defineConfig (from 'vitest/config') as of
// the blog-comments feature: it's Astro's own documented way to let vitest resolve and
// compile .astro files, which the Container API (astro/container) needs to render a
// component to a string inside a test. Every existing plain .ts/.mjs test still runs
// exactly as before — this is a superset, not a behavior change for them.
import { getViteConfig } from 'astro/config';

// astro/config's getViteConfig types its parameter against ITS OWN nested copy of
// Vite's UserConfig (astro/node_modules/vite) — a physically different module than the
// top-level `vite` that vitest's `declare module 'vite' { interface UserConfig { test?:
// ... } }` augments. TS can't merge declarations across two different module instances,
// so it sees an object whose only property (`test`) shares nothing with the target type
// and refuses it (ts2559) even though this is exactly astro's own documented pattern for
// letting vitest resolve .astro files. The `as never` cast is the disclosed, narrow
// escape hatch for that cross-package type mismatch — it does not suppress any other
// type checking in this file.
const viteConfig = {
  test: {
    include: ['src/**/*.test.ts'],
  },
};

export default getViteConfig(viteConfig as never);
