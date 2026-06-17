# How SeaGull MD Viewer compares

A look at SeaGull MD Viewer against the leading markdown **viewers** (read-only
renderers — editors like Typora, Obsidian, StackEdit, and MarkText are out of
scope). Star counts and feature notes are as of **June 2026** and will drift.

## The established leaders (open-source, viewer-only)

| Tool | Stars | What it is |
|---|---|---|
| **[glow](https://github.com/charmbracelet/glow)** | ~25.8k★ | Terminal (CLI/TUI) markdown reader — the popularity leader |
| **[grip](https://github.com/joeyespo/grip)** | ~6.8k★ | CLI that serves markdown rendered by **GitHub's own API** to your browser (exact GitHub fidelity) |
| **[simov/markdown-viewer](https://github.com/simov/markdown-viewer)** | ~1.6k★ (GitHub); among the most-*installed* via the browser stores | Browser extension that renders any `.md` you open |

## Feature comparison

| | **SeaGull** | **glow** | **grip** | **markdown-viewer (simov)** |
|---|---|---|---|---|
| Interface | Single HTML file, browser | Terminal (TUI/CLI) | CLI → browser | Browser extension |
| Install needed | **None** (open a file) | Binary install | Python + local server | Per-browser extension |
| Offline / self-contained | **Yes — 1 file, no deps** | Yes (binary) | **No** (needs GitHub API) | Yes (local files) |
| Folder / tree browsing | **Yes — sidebar tree + filter** | Yes (terminal list) | Partial (relative links) | **No** |
| Themes | 4 + 5 reading fonts | dark/light + custom | light/dark | **30+** |
| GFM (tables / task lists) | Yes | Yes | Yes (GitHub) | Yes |
| Code syntax highlighting | **No** | Some | Yes (GitHub) | **Yes (Prism)** |
| Mermaid / Math | **No** (by design) | No (terminal) | Mermaid via GitHub | **Yes (both)** |
| Obsidian (wikilinks, callouts, frontmatter) | **Yes** | No | No | No |
| Favorites / recents | **Yes** | "stash" | No | No |
| Renders local `.html` files | Yes | No | No | No |
| Editing | No | No | No | No |
| License | MIT, single file | MIT | MIT | MIT |

## Where SeaGull stands

**Its distinctive combination** — none of the three has all of these together:

1. **A browsable folder/vault tree in the browser, with no install.** glow has this only in the terminal; the simov extension can't browse folders; grip needs a running server. This is SeaGull's biggest differentiator.
2. **Obsidian-flavored support** — wikilinks (click-to-open), callouts, frontmatter-as-table, highlights, footnotes. None of the three do wikilinks or callouts, which makes SeaGull viable as a read-only **Obsidian vault browser**.
3. **One self-contained MIT HTML file** — fork it, email it, host it on GitHub Pages, run it fully offline. grip needs internet + Python; the extension needs a per-browser install; glow is a terminal binary.

**Where it honestly loses:**

- **No code syntax highlighting, no Mermaid/Math.** The simov extension wins here (Prism + Mermaid + MathJax). This is the direct cost of the "no dependencies, single file" design — adding them means a CDN or a heavy inline library.
- **No exact-GitHub fidelity.** grip's entire point is rendering *exactly* as GitHub will; SeaGull renders its own styling.
- **No CLI / scriptability / ecosystem.** glow is a mature, cross-platform, scriptable binary with years of polish; SeaGull is new.
- **No auto-reload on file change** (the simov extension has it; SeaGull has a manual reload button).

## Honorable mentions (closest feature competitors)

- **[MarkView](https://getmarkview.com/)** — a newer *commercial* Chrome/Edge extension; the nearest match feature-wise (folder-browser sidebar, word count/reading time, export to HTML/DOCX/PDF). Closed-source and browser-locked.
- **Marked 2** (macOS) — the leading native-mac GUI preview/viewer app.
- **[md-reader](https://github.com/md-reader/md-reader)** — a modern auto-refresh browser extension.

## Bottom line

SeaGull isn't trying to beat glow on terminal popularity or grip on GitHub
fidelity. Its niche is **a zero-install, offline, single-file browser viewer that
browses a folder or Obsidian vault as a tree** — and in that specific niche it
does things none of the top three do. The two features that would close the gap
with a general-purpose renderer like the simov extension are **code syntax
highlighting** and **Mermaid/Math**, both of which trade against the
single-file / no-dependency principle — so they're a deliberate choice, not an
oversight.

---

*Sources: [glow](https://github.com/charmbracelet/glow), [grip](https://github.com/joeyespo/grip), [simov/markdown-viewer](https://github.com/simov/markdown-viewer), [MarkView — best markdown viewers 2026](https://getmarkview.com/blog/best-markdown-viewers/), [awesome-markdown-editors](https://github.com/mundimark/awesome-markdown-editors), [md-reader](https://github.com/md-reader/md-reader). Star counts as of June 2026.*
