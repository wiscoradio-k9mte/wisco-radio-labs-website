// Unit tests for the REAL blog content-collection zod schema in src/content.config.ts.
//
// astro:content and astro/loaders are virtual/build-time modules vitest can't resolve,
// so we stub only those two: defineCollection is a pass-through (so collections.blog
// keeps the real schema function), and glob is a no-op loader. The schema itself —
// the zod object that actually validates every post's frontmatter at build — is the
// genuine one from content.config.ts, exercised here. Break a field's type or its
// required-ness and these go red. (Proven by mutation 2026-06-29.)

import { describe, it, expect, vi } from 'vitest';
import { z } from 'astro/zod';

vi.mock('astro:content', () => ({ defineCollection: (c: any) => c }));
vi.mock('astro/loaders', () => ({ glob: () => ({}) }));

import { collections } from '../content.config';

// The schema is defined as ({ image }) => z.object({...}); supply a stub image() that
// returns a zod type so .optional() resolves, exactly as Astro injects at build.
const schema = (collections as any).blog.schema({ image: () => z.string() });

describe('blog content schema', () => {
  it('accepts a minimal valid frontmatter object', () => {
    const res = schema.safeParse({
      title: 'Welcome to Wisco Radio Labs',
      description: 'First post.',
      pubDate: '2026-06-01',
    });
    expect(res.success).toBe(true);
  });

  it('coerces pubDate to a real Date and applies field defaults', () => {
    const res = schema.parse({
      title: 't',
      description: 'd',
      pubDate: '2026-06-01',
    });
    expect(res.pubDate).toBeInstanceOf(Date);
    expect(res.tags).toEqual([]); // default([])
    expect(res.draft).toBe(false); // default(false)
  });

  it('rejects frontmatter missing the required title', () => {
    const res = schema.safeParse({
      description: 'd',
      pubDate: '2026-06-01',
    });
    expect(res.success).toBe(false);
  });

  it('rejects frontmatter missing the required pubDate', () => {
    const res = schema.safeParse({
      title: 't',
      description: 'd',
    });
    expect(res.success).toBe(false);
  });

  it('rejects an unparseable pubDate', () => {
    const res = schema.safeParse({
      title: 't',
      description: 'd',
      pubDate: 'not-a-date',
    });
    expect(res.success).toBe(false);
  });

  it('rejects a wrongly-typed tags field (string instead of string[])', () => {
    const res = schema.safeParse({
      title: 't',
      description: 'd',
      pubDate: '2026-06-01',
      tags: 'cw',
    });
    expect(res.success).toBe(false);
  });
});
