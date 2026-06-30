/**
 * Tests for ogMeta() — the pure og:type + article:* decision used by BaseHead.
 *
 * These assert the exact meta the head emits per page type, so a regression
 * (e.g. a refactor dropping ogType back to a hard-coded "website", or breaking
 * the modified_time guard) fails here instead of shipping silently. The
 * article:modified_time branch in particular has no live post exercising it,
 * so this is its only coverage.
 */

import { describe, it, expect } from 'vitest';
import { ogMeta } from './og-meta.mjs';

const props = (t: { property: string }[]) => t.map((x) => x.property);

describe('ogMeta — og:type + article:* tags per page type', () => {
  it('(a) article WITH updatedDate → type=article + published + modified + author', () => {
    const { type, articleTags } = ogMeta({
      ogType: 'article',
      publishedTime: '2026-06-28T00:00:00.000Z',
      modifiedTime: '2026-06-30T00:00:00.000Z',
      author: 'Travis Engh',
    });
    expect(type).toBe('article');
    expect(props(articleTags)).toEqual([
      'article:published_time',
      'article:modified_time',
      'article:author',
    ]);
    expect(articleTags.find((t) => t.property === 'article:modified_time')?.content)
      .toBe('2026-06-30T00:00:00.000Z');
  });

  it('(b) article WITHOUT updatedDate → published + author, NO modified_time', () => {
    const { type, articleTags } = ogMeta({
      ogType: 'article',
      publishedTime: '2026-06-28T00:00:00.000Z',
      author: 'Travis Engh',
    });
    expect(type).toBe('article');
    expect(props(articleTags)).toEqual(['article:published_time', 'article:author']);
    expect(props(articleTags)).not.toContain('article:modified_time');
  });

  it('(c) website page → type=website, NO article:* tags', () => {
    const { type, articleTags } = ogMeta({ ogType: 'website' });
    expect(type).toBe('website');
    expect(articleTags).toEqual([]);
  });

  it('defaults to website (no ogType / empty args) with no article tags', () => {
    expect(ogMeta()).toEqual({ type: 'website', articleTags: [] });
    expect(ogMeta({})).toEqual({ type: 'website', articleTags: [] });
  });

  it('never emits article:* for a non-article page even if dates are passed', () => {
    const { type, articleTags } = ogMeta({
      ogType: 'website',
      publishedTime: '2026-06-28T00:00:00.000Z',
      author: 'Travis Engh',
    });
    expect(type).toBe('website');
    expect(articleTags).toEqual([]);
  });

  it('carries the exact published_time + author values through', () => {
    const { articleTags } = ogMeta({
      ogType: 'article',
      publishedTime: '2026-06-28T00:00:00.000Z',
      author: 'Travis Engh',
    });
    expect(articleTags.find((t) => t.property === 'article:published_time')?.content)
      .toBe('2026-06-28T00:00:00.000Z');
    expect(articleTags.find((t) => t.property === 'article:author')?.content)
      .toBe('Travis Engh');
  });
});
