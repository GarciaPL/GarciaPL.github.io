# whoishiring.dev

Personal technical blog at https://www.whoishiring.dev

## Tech Stack

- **Static generator:** Jekyll 3.9.5
- **Theme:** Pixyll (modified)
- **Markdown:** Kramdown
- **Hosting:** GitHub Pages

## Prerequisites

- Ruby

## Setup

Install Jekyll and Bundler:

```bash
gem install jekyll bundler
```

Install project dependencies:

```bash
bundle install
bundle add webrick
```

## Development

Run local server (http://localhost:4000):

```bash
bundle exec jekyll serve
```

Build site:

```bash
bundle exec jekyll build
```

## Project Structure

```
_posts/       # Published blog posts (YYYY-MM-DD-title.md)
_drafts/      # Draft posts
_layouts/     # HTML templates (default, post, page, tagpage)
_includes/    # Reusable components (head, header, footer, share buttons)
_sass/        # Sass stylesheets
assets/       # Images organized by post name
tag/          # Tag pages (one .md file per tag)
```

## Adding a New Post

Create a file in `_posts/` with the format `YYYY-MM-DD-title.md` and the following frontmatter:

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

Place any images in `assets/<PostName>/`.

## Adding a New Tag

1. Add the tag to the post's frontmatter (see above).
2. Create a corresponding tag page at `tag/<tagname>.md`:

```yaml
---
layout: tagpage
title: "Tag: tagname"
tag: tagname
---
```
