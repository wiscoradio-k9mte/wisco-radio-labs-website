/**
 * og-meta — pure decision for a page's Open Graph type + article:* tags.
 *
 * Extracted from BaseHead.astro so the conditional logic is unit-testable
 * without rendering a component. In particular the `article:modified_time`
 * branch only fires for posts that carry an `updatedDate`, and no published
 * post does yet — so without this seam that branch would ship unexercised.
 *
 * Pure: inputs in, plain data out. BaseHead maps `articleTags` to <meta> and
 * uses `type` for og:type.
 *
 *   ogMeta({ ogType: 'article', publishedTime, modifiedTime, author })
 *     -> { type: 'article', articleTags: [{ property, content }, ...] }
 *   ogMeta({ ogType: 'website' })  // or {}
 *     -> { type: 'website', articleTags: [] }
 *
 * Only 'article' yields article:* tags, and each tag is emitted only when its
 * value is present (so an article with no updatedDate emits no modified_time).
 *
 * @typedef {Object} OgMetaInput
 * @property {('website'|'article')} [ogType]
 * @property {string} [publishedTime]  ISO 8601
 * @property {string} [modifiedTime]   ISO 8601
 * @property {string} [author]
 *
 * @typedef {Object} OgMetaTag
 * @property {string} property
 * @property {string} content
 *
 * @param {OgMetaInput} [input]
 * @returns {{ type: ('website'|'article'), articleTags: OgMetaTag[] }}
 */
export function ogMeta({ ogType = 'website', publishedTime, modifiedTime, author } = {}) {
  const type = ogType === 'article' ? 'article' : 'website';

  const articleTags = [];
  if (type === 'article') {
    if (publishedTime) articleTags.push({ property: 'article:published_time', content: publishedTime });
    if (modifiedTime)  articleTags.push({ property: 'article:modified_time',  content: modifiedTime });
    if (author)        articleTags.push({ property: 'article:author',         content: author });
  }

  return { type, articleTags };
}
