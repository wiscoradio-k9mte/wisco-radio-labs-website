// Pure, framework-agnostic grouping/ordering logic for the comment thread — kept
// separate from CommentThreadView.astro so it's independently unit-testable without
// touching astro:content or the Astro Container API.

export interface CommentInput {
  id: string;
  parentId: string | null;
  author: string;
  date: Date;
  body: string;
}

export interface ThreadReply {
  comment: CommentInput;
  parent: CommentInput; // who this reply is actually replying to (may be another reply)
}

export interface ThreadGroup {
  top: CommentInput;
  replies: ThreadReply[];
}

/**
 * Groups a flat list of comments into top-level comments + their replies — one
 * VISUAL nesting level (design §3): a reply-to-a-reply still groups flat under its
 * true top-level ancestor, however deep the parentId chain goes. Stable
 * chronological order (oldest first) at both levels.
 *
 * A comment is top-level if it has no parentId, OR its parentId doesn't resolve to
 * another comment in this same list — a bad/stale reference renders as top-level
 * rather than silently disappearing.
 */
export function buildThread(comments: CommentInput[]): ThreadGroup[] {
  const sorted = [...comments].sort((a, b) => a.date.getTime() - b.date.getTime());
  const byId = new Map(sorted.map((c) => [c.id, c]));

  const resolveParent = (c: CommentInput): CommentInput | undefined =>
    c.parentId ? byId.get(c.parentId) : undefined;
  const isTopLevel = (c: CommentInput): boolean => !resolveParent(c);

  const topAncestorId = (c: CommentInput): string => {
    let cur = c;
    while (!isTopLevel(cur)) cur = resolveParent(cur) as CommentInput;
    return cur.id;
  };

  return sorted
    .filter(isTopLevel)
    .map((top) => ({
      top,
      replies: sorted
        .filter((c) => !isTopLevel(c) && topAncestorId(c) === top.id)
        .map((comment) => ({ comment, parent: resolveParent(comment) as CommentInput })),
    }));
}
