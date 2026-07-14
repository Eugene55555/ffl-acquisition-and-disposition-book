---
title: "Why I Built This Blog as a Static Site"
date: 2026-07-14
description: No database, no admin panel, no server to patch. Just Markdown and a deploy.
tags: [meta, web, performance]
author: Katya
---

# Why I Built This Blog as a Static Site

Most people reach for WordPress by default. It works, but it also means a
database, a PHP runtime, plugin updates, and a constant stream of security
patches. For a content site that is overkill.

## What you get with static

- **Speed** — pages are plain HTML, served from a CDN. Sub-second loads.
- **Security** — there is nothing to hack. No login form, no SQL, no runtime.
- **Cheap** — GitHub Pages is free for public repos.
- **Portable** — the whole site is a git repository. Move it anywhere.

## How publishing works

A post is a Markdown file in `content/posts/`. When it is pushed to `main`,
a GitHub Action builds the site and publishes it. No clicking around in a
dashboard — the source of truth is the repository.

That is the whole point: the blog is just text and git.
