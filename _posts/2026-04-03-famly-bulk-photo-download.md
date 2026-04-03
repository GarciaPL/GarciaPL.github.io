---
layout: post
title: Downloading All Feed Images from Famly.co
author: Lukasz Ciesluk
permalink: "/famly-bulk-photo-download/"
tags: [python, general]
description: "Famly.co does not offer bulk photo download. Here is how I extended famly-fetch to add a -f flag that downloads all feed images at once."
---

[Famly.co](https://famly.co) is a nursery management platform that shares daily photos of children with parents — but offers no way to download them in bulk. [famly-fetch](https://github.com/jacobbunk/famly-fetch) is an open-source Python CLI tool by Jacob Bunk Nielsen that fills this gap via the Famly API. This fork adds a `-f` flag that downloads all feed images at once, organised by upload timestamp.

## Bulk Download via famly-fetch

Using Claude Code, I extended famly-fetch with a new `-f` flag that downloads all feed images in one go. The change iterates over the feed, extracts image URLs, and saves them locally. Claude Code made the implementation straightforward though the process was briefly interrupted by a known token billing issue that is currently affecting Claude users.

```bash
famly-fetch -f
```

Run the command and all feed images are downloaded to your local machine, categorized by the timestamp of when they were added to the platform.

The implementation is available on my fork under the `feature/download-all-feed-images` branch.

## References

- [jacobbunk/famly-fetch](https://github.com/jacobbunk/famly-fetch) — original project by Jacob Bunk Nielsen
- [GarciaPL/famly-fetch (feature/download-all-feed-images)](https://github.com/GarciaPL/famly-fetch/tree/feature/download-all-feed-images) — fork with the bulk feed image download feature
