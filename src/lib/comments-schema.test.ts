// Unit tests for the REAL comments content-collection zod schema in src/content.config.ts.
// Same stubbing approach as content-schema.test.ts: astro:content / astro/loaders are
// virtual/build-time modules vitest can't resolve, so we stub only those two, exercising
// the genuine schema. (T9's own bite is the strict-mode + email-key test below.)

import { describe, it, expect, vi } from 'vitest';

vi.mock('astro:content', () => ({ defineCollection: (c: any) => c }));
vi.mock('astro/loaders', () => ({ glob: () => ({}) }));

import { collections } from '../content.config';

const schema = (collections as any).comments.schema;

const validComment = {
  postSlug: 'welcome-to-wisco-radio-labs',
  id: 'welcome-to-wisco-radio-labs-1',
  author: 'Sarah',
  date: '2026-07-09',
  body: 'Great post!',
};

describe('comments content schema', () => {
  it('accepts a valid top-level comment (parentId omitted)', () => {
    const res = schema.safeParse(validComment);
    expect(res.success).toBe(true);
  });

  it('defaults parentId to null when omitted', () => {
    const res = schema.parse(validComment);
    expect(res.parentId).toBeNull();
  });

  it('accepts an explicit parentId for a reply', () => {
    const res = schema.safeParse({ ...validComment, id: 'welcome-to-wisco-radio-labs-2', parentId: 'welcome-to-wisco-radio-labs-1' });
    expect(res.success).toBe(true);
  });

  it('coerces date to a real Date', () => {
    const res = schema.parse(validComment);
    expect(res.date).toBeInstanceOf(Date);
  });

  // ─── T9: THE non-negotiable — an email field must fail the build/test ─────
  it('REJECTS a comment carrying an email field (T9, strict schema)', () => {
    const res = schema.safeParse({ ...validComment, email: 'sarah@example.com' });
    expect(res.success).toBe(false);
  });

  it('rejects ANY unknown field, not just email (defense in depth on .strict())', () => {
    const res = schema.safeParse({ ...validComment, notes: 'internal note' });
    expect(res.success).toBe(false);
  });

  it('rejects a missing required author', () => {
    const { author, ...rest } = validComment;
    expect(schema.safeParse(rest).success).toBe(false);
  });

  it('rejects a missing required body', () => {
    const { body, ...rest } = validComment;
    expect(schema.safeParse(rest).success).toBe(false);
  });

  it('rejects a missing required postSlug', () => {
    const { postSlug, ...rest } = validComment;
    expect(schema.safeParse(rest).success).toBe(false);
  });

  it('rejects an id containing characters unsafe for a DOM anchor (e.g. a space or slash)', () => {
    expect(schema.safeParse({ ...validComment, id: 'not a valid id' }).success).toBe(false);
    expect(schema.safeParse({ ...validComment, id: 'has/slash' }).success).toBe(false);
  });
});
