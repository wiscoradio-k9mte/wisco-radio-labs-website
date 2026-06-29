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

The link-integrity test (`npm run test`) asserts this behavior.
