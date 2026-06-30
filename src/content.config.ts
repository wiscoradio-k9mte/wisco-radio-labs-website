// Astro 6 Content Layer API.
// Location: src/content.config.ts (top of src/, not src/content/).
import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod'; // z from 'astro:content' is deprecated in Astro 6

const blog = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/blog' }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      description: z.string(),
      pubDate: z.coerce.date(),
      updatedDate: z.coerce.date().optional(),
      // co-located image, optimized by astro:assets — yields base-path-correct hashed URL
      heroImage: image().optional(),
      // optional visible caption rendered under the hero (figcaption)
      heroCaption: z.string().optional(),
      tags: z.array(z.string()).default([]),
      draft: z.boolean().default(false),
      // YouTube video id or full URL for vlog posts; YouTubeEmbed.astro normalizes to id
      youtube: z.string().optional(),
    }),
});

export const collections = { blog };
