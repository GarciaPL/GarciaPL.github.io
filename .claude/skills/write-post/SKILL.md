---
name: write-post
description: Write a new blog post for the whoishiring.dev Jekyll blog. Use this skill whenever the user wants to write, draft, create, or publish a new blog post — even if they just say "write a post about X" or "new post on Y". This skill handles tag selection, SEO slug generation, frontmatter, and file creation.
---

# Write Blog Post

You are helping write a new post for a Jekyll-based technical blog at https://www.whoishiring.dev. The blog covers Python, Java, financial technology, trading systems, devops, software engineering, and personal topics.

## Step 1: Ask clarifying questions

Before writing anything, ask the user for any details not already provided in the conversation:

- **Topic / title** — what is the post about?
- **Key points** — what should the post cover? (bullet points or a rough outline is fine)
- **References** — any links, repos, docs, or sources to cite?
- **Images** — any screenshots or diagrams to include? (optional)

If the user has already given enough context in the conversation, extract what you need and skip straight to drafting — don't ask for things you already know.

## Step 2: Choose tags

Read the `tag/` directory to get the current list of available tags — each `.md` file in that directory represents a tag (e.g., `tag/python.md` → tag `python`). Do this dynamically so the list is always up to date.

Pick 1-3 tags that best match the post content. If none of the existing tags fit, propose a new tag name (lowercase, hyphenated) and explain why. If the user agrees, create the tag page at `tag/<tagname>.md`:

```markdown
---
layout: tagpage
title: "Tag: <tagname>"
tag: <tagname>
description: "<One sentence describing what posts under this tag cover.>"
---
```

Use `general` as a catch-all only when the post genuinely doesn't fit anywhere else.

## Step 3: Generate the SEO slug

Create a short, keyword-rich slug from the title:
- Lowercase, words separated by hyphens
- Drop stop words: a, an, the, and, or, but, in, on, at, to, for, of, with, by, from
- Keep it under 5-6 words where possible
- Should reflect the primary topic a reader would search for

**Examples:**
- "Python Garbage Collection" → `python-garbage-collection`
- "Custom Domain on GitHub Pages Using Spaceship" → `custom-domain-github-pages-spaceship`
- "Downloading All Feed Images from Famly.co" → `famly-bulk-photo-download`

## Step 4: Write the post

Use today's date from the system context for the filename: `_posts/YYYY-MM-DD-<slug>.md`

### Frontmatter

```yaml
---
layout: post
title: <Title>
author: Lukasz Ciesluk
permalink: "/<slug>/"
tags: [tag1, tag2]
description: "<SEO description, 1-2 sentences, under 160 characters.>"
---
```

No `date:` field — the filename carries the date.

### SEO checklist

Apply these before writing the post body:

- **Title**: Put the primary keyword near the front (e.g., "Python Garbage Collection" not "Understanding Memory in Python")
- **Description**: 1-2 sentences, under 160 characters, include the primary keyword naturally
- **Heading structure**: The post title is the H1 — use `##` (H2) for sections, `###` (H3) for subsections. Never skip levels.
- **Internal linking**: Where relevant, link to related existing posts on the blog using their permalink (e.g., `[Python Garbage Collection](/python-garbage-collection/)`)
- **Image alt text**: Make alt text descriptive and keyword-relevant, not generic (e.g., `![Famly feed download output](/assets/FamlyFetch/output.png)` not `![screenshot]`)

### AI citation optimisation

The full reference is at `.agents/skills/ai-seo/references/content-patterns.md`. Apply the patterns most relevant to the post type:

- **"What is X?" posts** — open with a definition block: one crisp sentence defining the term, followed by 1-2 sentences of context and why it matters. This is the format AI systems extract for direct answers.
- **"How to X" posts** — use a numbered step-by-step block with bold step names. Each step in 1-2 sentences.
- **Comparison posts** — use a markdown table with a "Bottom line" sentence below it.
- **All posts** — where you have a key claim, make it self-contained: the sentence should make sense without surrounding context (AI systems extract passages, not pages).
- **Statistics** — always include the source and year inline, e.g. "According to [Source], X% of...". Statistics increase citation rates by ~37%.
- **Technical posts** — include version numbers and dates for tools/libraries; reference official docs where relevant; add code examples.
- **Finance/trading posts** — reference regulatory bodies (FCA, SEC) and recognised institutions where applicable; include specific numbers with timeframes.

### Post body style

Match the tone and structure of existing posts:

- **Intro**: 1-3 sentences, direct and informative. No preamble like "In this post we will...". Get straight to the point.
- **Sections**: Use `## H2` headings with clear, descriptive names.
- **Lists**: Use bullet points for enumerations; use tables for structured comparisons.
- **Code**: Use Jekyll highlight tags, not markdown fences:
  ```
  {% highlight python %}
  your code here
  {% endhighlight %}
  ```
- **Images**: Reference as `![Alt text](/assets/<PostName>/image.png)` — only include if the user provides them.
- **References**: Add a `## References` section at the end if there are external links or sources. Format as a plain markdown list with descriptive link text.
- **Length**: Focused and complete — cover the topic well but don't pad. Most posts are 300-600 words.
- **Tone**: Technical but readable. Written for engineers. No fluff, no hype.

## Step 5: Write the file

Write the complete post to `_posts/YYYY-MM-DD-<slug>.md`. If a new tag was agreed upon, also write `tag/<tagname>.md`.

Confirm to the user what was created and the URL it will be available at (e.g., `https://www.whoishiring.dev/<slug>/`).
