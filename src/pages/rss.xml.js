// RSS feed endpoint.
// @astrojs/rss generates the feed; it is a package import, not an integrations[] entry.
// Absolute item URLs need the base path; we build them from the configured site + base.
import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import { SITE_TITLE, SITE_DESCRIPTION } from '../consts';

export async function GET(context) {
  const posts = (await getCollection('blog', ({ data }) =>
    // Exclude drafts from the RSS feed in production
    import.meta.env.PROD ? !data.draft : true
  )).sort((a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf());

  // context.site  = https://wiscoradio-k9mte.github.io  (from astro.config site)
  // BASE_URL      = /wisco-radio-labs-website/ or /wisco-radio-labs-website (Astro strips or keeps the slash)
  //
  // The RSS channel <link> should be the site's HTML home URL, including the base path.
  // Item links are root-absolute paths (starting with /wisco-radio-labs-website/…);
  // @astrojs/rss prepends context.site.origin to them to form absolute URLs.
  const base        = import.meta.env.BASE_URL.replace(/\/$/, ''); // /wisco-radio-labs-website
  // Build the canonical site root with a guaranteed trailing slash.
  const siteWithBase = context.site.href.replace(/\/$/, '') + base + '/';
  // = https://wiscoradio-k9mte.github.io/wisco-radio-labs-website/

  return rss({
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    // Use the full URL (origin + base) as the channel <link> so RSS readers
    // surface the correct home page, not just the bare origin.
    site: siteWithBase,
    items: posts.map(post => ({
      title: post.data.title,
      pubDate: post.data.pubDate,
      description: post.data.description,
      // Root-absolute paths work: @astrojs/rss prepends context.site.origin to them.
      link: `${base}/blog/${post.id}/`,
    })),
    xmlns: {
      // Atom self-link namespace — adds xmlns:atom to the root <rss> element.
      atom: 'http://www.w3.org/2005/Atom',
    },
    customData: [
      '<language>en-us</language>',
      `<atom:link href="${siteWithBase}rss.xml" rel="self" type="application/rss+xml"/>`,
      '<managingEditor>K9MTE (Travis Engh)</managingEditor>',
    ].join('\n    '),
  });
}
