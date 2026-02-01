## Project Overview

Jekyll-based technical blog hosted on GitHub Pages at https://www.whoishiring.dev. Topics include Python, Java, financial technology, trading systems, and software engineering.

## Development Commands

```bash
# Install dependencies
gem install jekyll bundler
bundle install
bundle add webrick

# Run local development server (http://localhost:4000)
bundle exec jekyll serve

# Build site
bundle exec jekyll build
```

## Architecture

- **Theme:** Pixyll (modified)
- **Static generator:** Jekyll 3.9.5
- **Markdown:** Kramdown with Redcarpet extensions

### Key Directories

- `_posts/` - Published blog posts in format YYYY-MM-DD-title.md
- `_drafts/` - Draft posts
- `_layouts/` - HTML templates (default.html, post.html, page.html, tagpage.html)
- `_includes/` - Reusable components (head.html, header.html, footer.html, share_buttons.html)
- `_sass/` - Sass stylesheets
- `assets/` - Images organized by post
- `tag/` - Tag pages (one .md file per tag)

### Post formatting

```yaml
---
layout: post
title: Post Title
date: YYYY-MM-DD
tags: [tag1, tag2]
description: SEO description
author: Lukasz Ciesluk
permalink: /custom-url/
---
```