---
layout: post
title: Argos In-Stock Filter Chrome Extension
author: Lukasz Ciesluk
permalink: "/argos-in-stock-filter/"
tags: [javascript, programming]
description: "A Chrome extension that hides out-of-stock items on argos.co.uk clearance pages instantly, with a one-click toggle and no page reload required."
---

Browsing [argos.co.uk](https://www.argos.co.uk/) clearance pages is frustrating. You scroll through item after item only to find most are "Out of stock" in your area. I wanted to see only what I could actually buy.

So I built [Argos In-Stock Filter](https://github.com/GarciaPL/argos-in-stock-filter) — a small Chrome extension that removes out-of-stock cards from the page the moment you toggle it on.

## How it works

Click the toolbar icon, flip the switch, and out-of-stock items disappear. No page reload. Toggle it back off and everything returns.

A few details worth noting:

- **Live badge** — the toolbar icon shows a count of how many items are currently hidden
- **Infinite scroll aware** — catches cards injected after initial load
- **Zero dependencies** — plain vanilla JS, no build step, no external libraries

## Installing

The extension isn't on the Chrome Web Store yet, so you install it directly from source. It takes about two minutes:

1. Download the ZIP from the [repository](https://github.com/GarciaPL/argos-in-stock-filter)
2. Open `chrome://extensions`, enable **Developer mode**, click **Load unpacked**, and select the extracted folder

## References

- [Argos In-Stock Filter — GitHub repository](https://github.com/GarciaPL/argos-in-stock-filter)
