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

  // context.site = https://wiscoradio-k9mte.github.io (from astro.config site)
  // import.meta.env.BASE_URL = /wisco-radio-labs-website/ (from astro.config base)
  // We need item links to be full absolute URLs including the base.
  const base = import.meta.env.BASE_URL.replace(/\/$/, ''); // /wisco-radio-labs-website

  return rss({
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    site: context.site,
    items: posts.map(post => ({
      title: post.data.title,
      pubDate: post.data.pubDate,
      description: post.data.description,
      link: `${base}/blog/${post.id}/`,
    })),
    customData: '<language>en-us</language>',
  });
}
