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

// ─── Comments ────────────────────────────────────────────────────────────────
// A DATA collection (YAML files, not Markdown) — a comment has no rendered body
// of its own, just plain fields, so there's nothing for a Markdown renderer to do.
// Travis hand-writes one file per approved comment at approve time (the pre-moderation
// workflow — see docs/comments-approve-workflow.md). This schema is the STRICT contract
// that keeps every entry honest:
//   - .strict() rejects any field not listed here — in particular there is NO email
//     field, ever. A commenter's optional notify-email travels only in the Web3Forms
//     submission email; it must never be typed into one of these files.
//   - id/postSlug are constrained to DOM-id-safe kebab-case: `id` becomes the page
//     anchor `#comment-<id>` and the Reply flow targets a parent by this same string.
const commentIdPattern = /^[a-z0-9]+(-[a-z0-9]+)*$/;

const comments = defineCollection({
  loader: glob({ pattern: '**/*.{yaml,yml}', base: './src/content/comments' }),
  schema: z
    .object({
      postSlug: z.string().regex(commentIdPattern),
      id: z.string().regex(commentIdPattern),
      // Explicit null for a top-level comment; a reply sets this to its parent's id.
      parentId: z.string().regex(commentIdPattern).nullable().default(null),
      author: z.string(),
      date: z.coerce.date(),
      body: z.string(),
    })
    .strict(),
});

export const collections = { blog, comments };
