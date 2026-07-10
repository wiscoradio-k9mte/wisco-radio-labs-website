import { describe, it, expect } from 'vitest';
import { buildThread, type CommentInput } from './comment-thread';

const c = (id: string, parentId: string | null, date: string, author = id): CommentInput => ({
  id,
  parentId,
  author,
  date: new Date(date),
  body: `body of ${id}`,
});

describe('buildThread', () => {
  it('returns an empty array for no comments', () => {
    expect(buildThread([])).toEqual([]);
  });

  it('returns one group per top-level comment, no replies', () => {
    const groups = buildThread([c('a', null, '2026-07-01'), c('b', null, '2026-07-02')]);
    expect(groups).toHaveLength(2);
    expect(groups.map((g) => g.top.id)).toEqual(['a', 'b']); // chronological, oldest first
    expect(groups[0].replies).toEqual([]);
  });

  it('groups a direct reply under its top-level parent', () => {
    const groups = buildThread([
      c('a', null, '2026-07-01'),
      c('a-reply', 'a', '2026-07-02'),
    ]);
    expect(groups).toHaveLength(1);
    expect(groups[0].top.id).toBe('a');
    expect(groups[0].replies).toHaveLength(1);
    expect(groups[0].replies[0].comment.id).toBe('a-reply');
    expect(groups[0].replies[0].parent.id).toBe('a'); // replying to the top comment itself
  });

  it('flattens a reply-to-a-reply under the ORIGINAL top-level ancestor (one visual level)', () => {
    const groups = buildThread([
      c('a', null, '2026-07-01'),
      c('a-reply-1', 'a', '2026-07-02'),
      c('a-reply-2', 'a-reply-1', '2026-07-03'), // replies to the reply, not to 'a'
    ]);
    expect(groups).toHaveLength(1); // still ONE top-level group, not a second nesting level
    expect(groups[0].replies.map((r) => r.comment.id)).toEqual(['a-reply-1', 'a-reply-2']);
    // The marker text needs the TRUE parent (the reply), not the top-level ancestor.
    const reply2 = groups[0].replies.find((r) => r.comment.id === 'a-reply-2')!;
    expect(reply2.parent.id).toBe('a-reply-1');
  });

  it('keeps replies in chronological order within a group', () => {
    const groups = buildThread([
      c('a', null, '2026-07-01'),
      c('a-reply-late', 'a', '2026-07-05'),
      c('a-reply-early', 'a', '2026-07-03'),
    ]);
    expect(groups[0].replies.map((r) => r.comment.id)).toEqual(['a-reply-early', 'a-reply-late']);
  });

  it('treats a comment with an unresolvable parentId as top-level rather than dropping it', () => {
    const groups = buildThread([c('orphan', 'does-not-exist', '2026-07-01')]);
    expect(groups).toHaveLength(1);
    expect(groups[0].top.id).toBe('orphan');
  });

  it('keeps two independent threads separate', () => {
    const groups = buildThread([
      c('a', null, '2026-07-01'),
      c('a-reply', 'a', '2026-07-02'),
      c('b', null, '2026-07-03'),
      c('b-reply', 'b', '2026-07-04'),
    ]);
    expect(groups).toHaveLength(2);
    expect(groups.find((g) => g.top.id === 'a')!.replies.map((r) => r.comment.id)).toEqual(['a-reply']);
    expect(groups.find((g) => g.top.id === 'b')!.replies.map((r) => r.comment.id)).toEqual(['b-reply']);
  });
});
