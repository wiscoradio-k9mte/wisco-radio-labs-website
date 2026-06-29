// Vitest configuration.
//
// withBase() accepts an optional `base` parameter (defaulting to import.meta.env.BASE_URL)
// so tests can pass the configured base explicitly without env-injection tricks.
// Vitest 4 does not honor the Vite `base` option to set import.meta.env.BASE_URL — the
// optional param on withBase() is what makes the function unit-testable.
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['src/**/*.test.ts'],
  },
});
