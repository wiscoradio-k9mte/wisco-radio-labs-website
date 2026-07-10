// Container-API component tests for CommentThreadView.astro — renders the REAL
// component with the REAL Astro compiler (not a stub), so escaping behavior in
// particular is a genuine guarantee, not an assumption. See vitest.config.ts for
// why getViteConfig is needed for astro/container to resolve .astro imports.
import { describe, it, expect } from 'vitest';
import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import CommentThreadView from './CommentThreadView.astro';
import type { CommentInput } from '../lib/comment-thread';

const c = (id: string, parentId: string | null, author: string, date: string, body: string): CommentInput => ({
  id,
  parentId,
  author,
  date: new Date(date),
  body,
});

async function render(comments: CommentInput[]): Promise<string> {
  const container = await AstroContainer.create();
  return container.renderToString(CommentThreadView, { props: { comments } });
}

describe('CommentThreadView', () => {
  it('T12: renders the honest empty state with no comments', async () => {
    const html = await render([]);
    expect(html).toContain('No comments yet — be the first.');
    // No fake count, no thread markup at all.
    expect(html).not.toContain('class="comment "');
  });

  it('renders a single top-level comment with author and escaped body text', async () => {
    const html = await render([c('c1', null, 'Sarah', '2026-07-09', 'Great post!')]);
    expect(html).toContain('id="comment-c1"');
    expect(html).toContain('Sarah');
    expect(html).toContain('Great post!');
  });

  // ─── T10: bodies render escaped, no HTML/script execution ─────────────────
  it('T10: a <script> tag in a comment body renders as inert escaped text, not a real tag', async () => {
    const malicious = '<script>window.__pwned = true;</script>';
    const html = await render([c('c1', null, 'Attacker', '2026-07-09', malicious)]);
    // The literal executable tag must NOT appear anywhere in the output...
    expect(html).not.toContain('<script>window.__pwned');
    // ...it must appear ESCAPED as inert text instead.
    expect(html).toContain('&lt;script&gt;');
  });

  it('T10: an HTML tag in the author field also renders escaped inside the author span, not as markup', async () => {
    const html = await render([c('c1', null, '<b>bold</b>', '2026-07-09', 'hi')]);
    // Scope to the author-name span specifically — the SAME string legitimately (and
    // harmlessly) appears in a data-reply-name="..." attribute value elsewhere on the
    // page, where '<'/'>' need no escaping per the HTML spec (only '"' would).
    const authorSpan = html.match(/<span class="comment-author-name"[^>]*>([\s\S]*?)<\/span>/)?.[1];
    expect(authorSpan).toBe('&lt;b&gt;bold&lt;/b&gt;');
  });

  // ─── T11: threaded display, non-color reply cues ───────────────────────────
  it('T11: renders a reply with the indent class, the reply border, AND the text marker', async () => {
    const html = await render([
      c('top', null, 'Sarah', '2026-07-09', 'Question about the build'),
      c('reply', 'top', 'K9MTE', '2026-07-09', 'Good question — here is the answer'),
    ]);
    expect(html).toContain('comment--reply'); // structural class (indent + border via CSS)
    expect(html).toContain('↳ In reply to');
    expect(html).toContain('Sarah'); // the marker names the parent
  });

  it('T11: the AUTHOR badge appears only for the exact COMMENT_AUTHOR_NAME, never for others', async () => {
    const html = await render([
      c('top', null, 'Sarah', '2026-07-09', 'hi'),
      c('reply', 'top', 'K9MTE', '2026-07-09', 'reply'),
    ]);
    expect(html).toMatch(/comment-author-badge"[^>]*>AUTHOR</);
    // Sarah's own author span must not be immediately followed by the badge.
    const sarahBlock = html.slice(html.indexOf('Sarah'), html.indexOf('Sarah') + 200);
    expect(sarahBlock).not.toContain('AUTHOR');
  });

  // ─── PII-scan marker contract ───────────────────────────────────────────────
  it('wraps author name and body in data-comment-text (the PII gate scan boundary)', async () => {
    const html = await render([c('c1', null, 'Sarah', '2026-07-09', 'hello there')]);
    expect(html).toMatch(/<span[^>]*data-comment-text[^>]*>Sarah<\/span>/);
    expect(html).toMatch(/data-comment-text[^>]*>hello there</);
  });

  it('a long unbroken string in the body renders intact (no truncation/mangling) inside the escaped span', async () => {
    // The overflow-wrap CSS itself lives in the component's <style> block (code-reviewable,
    // not part of the container's partial-render fragment) — this test proves the DATA path
    // doesn't break on a long unbroken string, which is the thing that could silently fail.
    const long = 'x'.repeat(220);
    const html = await render([c('c1', null, 'Sarah', '2026-07-09', long)]);
    expect(html).toContain(long);
  });
});
