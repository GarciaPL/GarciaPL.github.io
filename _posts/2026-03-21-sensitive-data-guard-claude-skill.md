---
layout: post
title: Sensitive Data Guard - A Claude Skill for Protecting Credentials in Chat
author: Lukasz Ciesluk
permalink: "/sensitive-data-guard-claude-skill/"
tags: [ai]
description: "Introducing Sensitive Data Guard, a Claude Code skill that proactively detects and protects against accidental exposure of API keys, tokens, passwords, and other sensitive credentials during development conversations."
---

As users, we sometimes accidentally paste secrets into AI chats — API keys, OAuth tokens, database passwords, private keys, client secrets — and to address this, I built a skill called **Sensitive Data Guard** together with Claude that activates proactively whenever there's any chance sensitive data could surface in a conversation.

## How Sensitive Data Guard Works

The skill activates on any of the following triggers:

- **Explicit pastes** — the user directly shares a credential value in the message
- **Code and config snippets** — files containing fields like `api_key`, `password`, `token`, `secret`, `private_key`, or `certificate`
- **Keyword mentions** — words like "secret", "token", "key", "password", "credential", or "passphrase" appear anywhere in the conversation

When triggered, Claude switches into a protective mode:

1. **Does not echo back** any credential values, even partially
2. **Warns the user** if a value appears to be a real secret (not a placeholder like `<YOUR_API_KEY>`)
3. **Suggests redaction** before continuing — replacing real values with `[REDACTED]` or environment variable references
4. **Avoids storing or referencing** the value in subsequent responses

## Getting Started

Download the skill file and add it at [claude.ai/customize/skills](https://claude.ai/customize/skills). The skill will then be available across all your Claude conversations.

## Download

The skill file is available for direct download: [sensitive-data-guard.skill](/assets/SensitiveDataGuardClaudeSkill/sensitive-data-guard.skill)

The full skill is also available as a [GitHub Gist](https://gist.github.com/GarciaPL/6ac05ce56f5849f6e5636375dc92c0c8).
