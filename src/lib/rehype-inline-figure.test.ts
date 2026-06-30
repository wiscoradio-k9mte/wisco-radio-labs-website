// Unit tests for rehype-inline-figure.mjs.
//
// The plugin transforms <p><img></p> (and variants) into <figure> elements.
// Tests run the ACTUAL transformer over real hast trees and assert the HTML
// string produced by hast-util-to-html — not just that the tree mutated.
//
// Bite verification (2026-06-30): the two core assertions were confirmed red
// when the transform was disabled (plugin returned early) and green when restored.

import { describe, it, expect } from 'vitest';
import { toHtml } from 'hast-util-to-html';
import rehypeInlineFigure from './rehype-inline-figure.mjs';

// Run the plugin's transformer over a hast root node and return serialized HTML.
function run(root: any): string {
  const transform = rehypeInlineFigure();
  transform(root);
  return toHtml(root);
}

// Build a minimal hast element node.
function el(tag: string, children: any[] = [], props: Record<string, unknown> = {}): any {
  return { type: 'element', tagName: tag, properties: props, children };
}

function txt(value: string): any {
  return { type: 'text', value };
}

function img(alt = 'alt', src = './img.jpg'): any {
  return el('img', [], { alt, src });
}

function em(content: string): any {
  return el('em', [txt(content)]);
}

function p(...children: any[]): any {
  return el('p', children);
}

function root(...children: any[]): any {
  return { type: 'root', children };
}

describe('rehypeInlineFigure', () => {
  it('wraps an image-only paragraph in <figure>', () => {
    const tree = root(p(img()));
    expect(run(tree)).toContain('<figure>');
    expect(run(tree)).not.toContain('<figcaption>');
    // No bare <p><img> in the output
    expect(run(tree)).not.toMatch(/<p[^>]*><img/);
  });

  it('produces figure > img + figcaption when image and em are in the same paragraph', () => {
    // Pattern: <p><img><em>caption</em></p> — no blank line in source Markdown.
    // This is what the Welcome post produces (norcal image + italic caption).
    const tree = root(p(img(), txt('\n'), em('A NorCal kit, mid-build.')));
    const html = run(tree);
    expect(html).toContain('<figure>');
    expect(html).toContain('<figcaption>A NorCal kit, mid-build.</figcaption>');
    // Caption must be inside the figure, not a sibling paragraph
    expect(html).not.toContain('<p><em>');
    expect(html).toMatch(/<figure>.*<figcaption>/s);
  });

  it('produces figure > img + figcaption when image paragraph is followed by an em-only sibling paragraph', () => {
    // Pattern: <p><img></p>\n<p><em>caption</em></p> — blank line in source.
    const tree = root(p(img()), p(em('Caption text.')));
    const html = run(tree);
    expect(html).toContain('<figure>');
    expect(html).toContain('<figcaption>Caption text.</figcaption>');
    // The sibling <p><em> must be gone — merged into the figure
    expect(html).not.toContain('<p><em>');
  });

  it('wraps image-only paragraph in figure with no figcaption when no caption follows', () => {
    // <p><img></p> followed by a regular paragraph — no caption.
    const tree = root(p(img()), p(txt('Some other text.')));
    const html = run(tree);
    expect(html).toContain('<figure>');
    expect(html).not.toContain('<figcaption>');
    // The following text paragraph is preserved as-is
    expect(html).toContain('<p>Some other text.</p>');
  });

  it('leaves a paragraph with image AND other content alone', () => {
    // <p><img> some text</p> — mixed content, not a pure image paragraph.
    const tree = root(p(img(), txt(' This is caption-like but followed by regular text')));
    const html = run(tree);
    expect(html).toContain('<p>');
    expect(html).not.toContain('<figure>');
  });

  it('leaves a non-image paragraph untouched', () => {
    const tree = root(p(txt('Plain text paragraph.')));
    const html = run(tree);
    expect(html).toContain('<p>Plain text paragraph.</p>');
    expect(html).not.toContain('<figure>');
  });

  it('handles multiple image paragraphs independently', () => {
    // First: image + inline caption; second: image alone with sibling caption.
    const tree = root(
      p(img('first', './a.jpg'), txt('\n'), em('First caption.')),
      p(img('second', './b.jpg')),
      p(em('Second caption.')),
      p(txt('Trailing paragraph.')),
    );
    const html = run(tree);
    expect(html).toContain('First caption.');
    expect(html).toContain('Second caption.');
    expect(html).not.toContain('<p><em>');
    expect(html).toContain('<p>Trailing paragraph.</p>');
    // Both should be figures
    expect(html.match(/<figure>/g)?.length).toBe(2);
    expect(html.match(/<figcaption>/g)?.length).toBe(2);
  });

  it('does not add an empty figcaption for image-only with no caption sibling at end', () => {
    // Image paragraph at the very end of the document (no next sibling).
    const tree = root(p(img()));
    const html = run(tree);
    expect(html).not.toContain('<figcaption>');
    expect(html).not.toContain('<figcaption></figcaption>');
  });

  it('does not crash when the next sibling has no children (void element or text node)', () => {
    // In Astro's hast, text nodes between block elements have no .children.
    // This guards against the "Cannot read properties of undefined (reading 'filter')" crash
    // that occurred when meaningfulChildren() was called on a non-element next sibling.
    const textNode = { type: 'text', value: '\n' };
    const tree = root(p(img()), textNode, p(txt('Next paragraph.')));
    // Must not throw; image-only figure, text node preserved, next para preserved
    const html = run(tree);
    expect(html).toContain('<figure>');
    expect(html).not.toContain('<figcaption>');
    expect(html).toContain('<p>Next paragraph.</p>');
  });
});
