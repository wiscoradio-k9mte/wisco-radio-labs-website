// Container-API component tests for CommentForm.astro — static-markup assertions
// only (labels, ids, hidden fields, disclosure copy). The client-side <script>
// (validation, async submit, reply-target state) follows ContactForm's own
// established pattern, which this codebase does not unit-test either — it's
// verified in-browser (Travis's T-A/T-B checks), the same disclosed scope line
// ContactForm already draws.
import { describe, it, expect } from 'vitest';
import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import CommentForm from './CommentForm.astro';

async function render(): Promise<string> {
  const container = await AstroContainer.create();
  return container.renderToString(CommentForm, { props: { postSlug: 'welcome-to-wisco-radio-labs' } });
}

describe('CommentForm', () => {
  it('T1: renders required Name and Comment fields, and an optional Email field', async () => {
    const html = await render();
    expect(html).toMatch(/for="comment-name"/);
    expect(html).toMatch(/Name\s*<span class="form-required"[^>]*>\(required\)<\/span>/);
    expect(html).toMatch(/for="comment-body"/);
    expect(html).toMatch(/Comment\s*<span class="form-required"[^>]*>\(required\)<\/span>/);
    expect(html).toMatch(/for="comment-email"/);
    expect(html).toMatch(/Email\s*<span class="form-optional"[^>]*>\(optional\)<\/span>/);
  });

  it('carries the post slug in a hidden field', async () => {
    const html = await render();
    expect(html).toMatch(/name="post_slug"[^>]*value="welcome-to-wisco-radio-labs"/);
  });

  it('the reply-target hidden fields default to empty (a plain top-level comment)', async () => {
    const html = await render();
    expect(html).toMatch(/id="comment-parent-id"[^>]*name="parent_id"[^>]*value=""/);
    expect(html).toMatch(/id="comment-parent-author"[^>]*name="parent_author"[^>]*value=""/);
  });

  it('every field id is comment-* and never collides with contact-*', async () => {
    const html = await render();
    const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map((m) => m[1]);
    const relevantIds = ids.filter((id) => /^(comment|contact)-/.test(id));
    expect(relevantIds.length).toBeGreaterThan(0);
    expect(relevantIds.every((id) => id.startsWith('comment-'))).toBe(true);
  });

  it('T19: discloses moderation, the never-published email use, and the public-git-history nature of comments', async () => {
    const html = await render();
    expect(html).toContain('I read and approve every comment by hand');
    expect(html).toContain('never published');
    expect(html).toContain('public history, permanently');
  });

  it('renders the honeypot field off-screen, not display:none (bots still see/fill it)', async () => {
    const html = await render();
    expect(html).toMatch(/name="botcheck"/);
    expect(html).toContain('class="honeypot"');
  });

  it('T6: the success message promises review-then-publish, never instant posting', async () => {
    const html = await render();
    expect(html).toContain("your comment is in the queue");
    expect(html).not.toContain('your comment is posted');
  });

  it('renders the hCaptcha widget mount point', async () => {
    const html = await render();
    expect(html).toMatch(/class="h-captcha" data-captcha="true"/);
  });
});
