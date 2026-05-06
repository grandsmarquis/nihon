# Nihon Grammar

A Next.js App Router site for browsing Japanese grammar points stored as markdown.

## Development

```bash
npm run dev
npm run lint
npm run build
```

## Grammar Content

Add grammar files to `content/grammar/*.md`. Each file needs YAML frontmatter plus a markdown body:

```md
---
title: "〜たい"
slug: "tai-form"
level: "N5"
tags:
  - desire
  - verb-form
order: 30
summary: "Expresses wanting to do an action by attaching たい to the verb stem."
examples:
  - japanese: "日本に行きたいです。"
    reading: "にほんに いきたいです。"
    english: "I want to go to Japan."
---

## Meaning

Markdown explanation goes here.
```

Metadata is validated during development and builds. Invalid frontmatter throws an error that includes the file path and the failed field.
