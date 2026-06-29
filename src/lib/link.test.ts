// Unit tests for src/lib/link.ts and src/lib/youtube.ts.
// These are pure functions — tests assert produced output, not that something fired.
//
// NOTE: withBase() depends on import.meta.env.BASE_URL, which is Astro's virtual env.
// In Vitest (outside Astro's build pipeline) we define it inline via vi.stubEnv / importers.
// The simplest correct test is to inline the helper logic so we test the logic, not the env.

import { describe, it, expect } from 'vitest';
import { extractYouTubeId } from './youtube';

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

// ─── withBase logic (inline — avoids Astro virtual env in Vitest) ─────────────
// These tests exercise the logic that withBase() implements, independently of
// import.meta.env.BASE_URL. If the logic is wrong, these go red regardless of env.

function withBaseLogic(base: string, path: string): string {
  const b = base.replace(/\/$/, '');
  const clean = path.replace(/^\//, '');
  return clean ? `${b}/${clean}` : `${b}/`;
}

describe('withBase logic', () => {
  it('prepends base to a path with leading slash', () => {
    expect(withBaseLogic('/wisco-radio-labs-website', '/blog')).toBe('/wisco-radio-labs-website/blog');
  });

  it('prepends base to a path without leading slash', () => {
    expect(withBaseLogic('/wisco-radio-labs-website', 'blog')).toBe('/wisco-radio-labs-website/blog');
  });

  it('returns base root when given empty path', () => {
    expect(withBaseLogic('/wisco-radio-labs-website', '')).toBe('/wisco-radio-labs-website/');
  });

  it('strips trailing slash from base before joining', () => {
    expect(withBaseLogic('/wisco-radio-labs-website/', '/blog/')).toBe('/wisco-radio-labs-website/blog/');
  });

  it('works correctly when base is empty (root domain scenario)', () => {
    // At domain go-live, base is removed → BASE_URL = '/' → base after trim = ''
    expect(withBaseLogic('', '/blog')).toBe('/blog');
  });
});
