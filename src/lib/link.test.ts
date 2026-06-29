// Unit tests for src/lib/link.ts and src/lib/youtube.ts.
//
// withBase() accepts an optional `base` parameter so the join logic is unit-testable
// without env-injection tricks. The tests pass the real base explicitly — they import
// and exercise the actual exported function. Break withBase() and these go red.
//
// All call sites in .astro files omit the second arg and get import.meta.env.BASE_URL.

import { describe, it, expect } from 'vitest';
import { withBase } from './link';
import { extractYouTubeId } from './youtube';

const BASE = '/wisco-radio-labs-website/'; // matches astro.config.mjs (Astro adds trailing /)

// ─── withBase (the real function from link.ts) ────────────────────────────────

describe('withBase', () => {
  it('prepends base to a path with leading slash', () => {
    expect(withBase('/blog', BASE)).toBe('/wisco-radio-labs-website/blog');
  });

  it('prepends base to a path without leading slash', () => {
    expect(withBase('blog', BASE)).toBe('/wisco-radio-labs-website/blog');
  });

  it('returns base root when given empty path', () => {
    expect(withBase('', BASE)).toBe('/wisco-radio-labs-website/');
  });

  it('handles a path with trailing slash', () => {
    expect(withBase('/blog/', BASE)).toBe('/wisco-radio-labs-website/blog/');
  });

  it('handles a nested path', () => {
    expect(withBase('/blog/welcome-to-wisco-radio-labs/', BASE)).toBe(
      '/wisco-radio-labs-website/blog/welcome-to-wisco-radio-labs/'
    );
  });

  it('is a no-op at root domain (base = "/")', () => {
    // When the custom domain is live and base is removed, BASE_URL = '/' → links are unchanged
    expect(withBase('/blog/', '/')).toBe('/blog/');
  });
});

// ─── extractYouTubeId ─────────────────────────────────────────────────────────

describe('extractYouTubeId', () => {
  it('returns a bare 11-char id unchanged', () => {
    expect(extractYouTubeId('dQw4w9WgXcQ')).toBe('dQw4w9WgXcQ');
  });

  it('extracts id from a youtube.com watch URL', () => {
    expect(extractYouTubeId('https://www.youtube.com/watch?v=dQw4w9WgXcQ')).toBe('dQw4w9WgXcQ');
  });

  it('extracts id from a youtu.be short URL', () => {
    expect(extractYouTubeId('https://youtu.be/dQw4w9WgXcQ')).toBe('dQw4w9WgXcQ');
  });

  it('extracts id from a youtube.com/embed URL', () => {
    expect(extractYouTubeId('https://www.youtube.com/embed/dQw4w9WgXcQ')).toBe('dQw4w9WgXcQ');
  });

  it('returns empty string for empty input', () => {
    expect(extractYouTubeId('')).toBe('');
  });

  it('handles youtu.be URL with query params', () => {
    expect(extractYouTubeId('https://youtu.be/dQw4w9WgXcQ?t=42')).toBe('dQw4w9WgXcQ');
  });
});
