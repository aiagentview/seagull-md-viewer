---
title: Obsidian Features Demo
tags:
  - demo
  - obsidian
created: 2026-06-16
---

# Obsidian-Flavored Markdown

A showcase of the Obsidian extensions the viewer supports. The frontmatter above
should render as a **properties table**, not raw `---` text.

## Wikilinks

- [[kitchen-sink]] — link by basename
- [[guides/getting-started]] — link by path
- [[reference/tables-and-data]] — another note
- [[kitchen-sink#Tables|see the Tables section]] — heading link, with an alias
- [[does-not-exist]] — a broken link (clicking shows "note not found")

## Embed

![[assets/diagram.svg]]

## Callouts

> [!note] A note callout
> With **body** text and a [[kitchen-sink|wikilink]] inside it.

> [!warning] Heads up
> Warnings use a different accent colour.

> [!tip]- Collapsible tip (starts folded)
> This body is hidden until you click the title to expand it.

## Highlight & comment

Here is ==highlighted text== inline. %%this comment is hidden in preview%% Done.

## Footnotes

A claim that needs a citation[^1], and another one[^note].

[^1]: First footnote definition.
[^note]: Named footnotes work too.

## Custom task states

- [x] standard done (GFM)
- [ ] standard todo (GFM)
- [/] partial
- [-] cancelled
- [>] forwarded
- [?] question

[↑ Back to top](#obsidian-flavored-markdown)
