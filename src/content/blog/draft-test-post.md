---
title: "Draft Post — Not Published"
description: "This post is a draft and should never appear in the production build or RSS feed."
pubDate: 2026-07-01
tags: ["test"]
draft: true
---

This post exists to verify that `draft: true` posts are excluded from production builds.

It should appear in `astro dev` (development) but **not** in `astro build` output, the blog index,
the article route, or the RSS feed when `PROD=true`.

The post-build gate (`npm run test:links`) asserts this behavior — it fails the build if a
`draft: true` post is emitted into `dist/`.
