// rehype-inline-figure.mjs
// Rehype plugin that promotes inline image paragraphs to semantic <figure> elements.
//
// Why: Markdown has no native figure/figcaption syntax. The convention in this
// blog is to write an image followed by an italic line as the caption. Without
// this plugin that renders as either:
//   - <p><img><em>caption</em></p>  — image and caption in the same paragraph
//     (no blank line between them in source), or
//   - <p><img></p> <p><em>caption</em></p>  — separate paragraphs (blank line)
// Neither is semantic HTML. This plugin detects both patterns and produces:
//   <figure><img><figcaption>caption</figcaption></figure>
//
// An image paragraph with no following caption becomes <figure><img></figure>
// (no empty figcaption).
//
// Styling: global.css already has .prose figure and .prose figcaption rules
// that match the hero's article-hero-caption — no class attributes needed here.

import { visit, SKIP } from 'unist-util-visit';

/** Filter out whitespace-only text nodes (bare newlines between inline elements).
 *  Returns [] for nodes without a children array (void elements, text nodes). */
function meaningfulChildren(node) {
  return (node.children ?? []).filter(
    (c) => !(c.type === 'text' && c.value.trim() === ''),
  );
}

function isEl(node, tag) {
  return node.type === 'element' && node.tagName === tag;
}

/** Build a figcaption element whose children are the em's children. */
function makeFigcaption(emNode) {
  return {
    type: 'element',
    tagName: 'figcaption',
    properties: {},
    children: emNode.children,
  };
}

export default function rehypeInlineFigure() {
  return function (tree) {
    visit(tree, 'element', (node, index, parent) => {
      // Only act on <p> elements that have a real parent with a known position.
      if (!isEl(node, 'p') || !parent || index == null) return;

      const mc = meaningfulChildren(node);

      // Must start with an <img>.
      if (mc.length === 0 || !isEl(mc[0], 'img')) return;

      const img = mc[0];
      let figcaption = null;
      // How many of parent.children to replace (1 = just this <p>; 2 = also consume the next sibling).
      let removeCount = 1;

      if (mc.length === 1) {
        // Image alone in the paragraph — check if the next sibling is a caption-only <p><em>.
        // Guard: check isEl first; hast text nodes between paragraphs have no children array.
        const next = parent.children[index + 1];
        if (next && isEl(next, 'p')) {
          const nextMc = meaningfulChildren(next);
          if (nextMc.length === 1 && isEl(nextMc[0], 'em')) {
            figcaption = makeFigcaption(nextMc[0]);
            removeCount = 2; // consume the caption paragraph too
          }
        }
      } else if (mc.length === 2 && isEl(mc[1], 'em')) {
        // Image followed by inline italic in the same paragraph (no blank line in source).
        figcaption = makeFigcaption(mc[1]);
      } else {
        // Paragraph has other content mixed with the image — leave it alone.
        return;
      }

      const figure = {
        type: 'element',
        tagName: 'figure',
        properties: {},
        children: figcaption ? [img, figcaption] : [img],
      };

      // Replace this <p> (and the caption sibling if present) with the <figure>.
      // Removing a *next* sibling is safe here: visit's iterator increments
      // after the visitor returns, so it will naturally land on the correct
      // next node even though the array shrank by one.
      parent.children.splice(index, removeCount, figure);

      // Skip descending into the new <figure> — its children are already final.
      return SKIP;
    });
  };
}
