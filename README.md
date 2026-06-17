# 🐦 SeaGull MD Viewer

A single-file, dependency-light **Markdown viewer** for the browser. Drop a
folder of `.md`/`.html` files and browse them in a sidebar tree, or open one
file directly. No build step, no server required for drag-and-drop, nothing to
install — it's one HTML file.

## Features

- **Folder browsing** — drop a folder (or use 📂) to get a collapsible, filterable
  file tree in the sidebar; click any file to render it.
- **Favorites** — star individual files (☆) to pin them above the Recent list;
  starred files reopen from a saved snapshot even when their folder isn't loaded.
- **Recent list** — folders and files you open are remembered (localStorage +
  IndexedDB), per browser profile.
- **Themes** — Midnight, Paper, Dark, Sepia (top-bar dropdown).
- **Reading fonts** — System, Serif, Book, Verdana, Mono — all system-built-in,
  applied only to the rendered content (code blocks stay monospace).
- **Full-page reading** (⛶) — hides all chrome; Esc to exit.
- **HTML files** render in a sandboxed iframe (scripts disabled).
- **URL parameters** — `?file=<path-or-url>` and `?dir=<path-or-url>`.
- **Drag-out** — drag a file/folder onto another window's tab bar to open it there.
- **Obsidian-flavored markdown** — wikilinks `[[note]]` (click to open), callouts
  `> [!note]`, frontmatter as a properties table, highlights `==x==`, comments,
  footnotes, and custom task states — all built-in, no plugins.

Open the in-app **❓ help** for full documentation, including how to add your own
theme or font.

## How it compares

See [`COMPARISON.md`](COMPARISON.md) for how SeaGull stacks up against the leading
markdown viewers (glow, grip, simov/markdown-viewer, and others). In short: its
niche is a **zero-install, offline, single-file browser viewer that browses a
folder or Obsidian vault as a tree** — something none of the established viewers
do all at once.

## Usage

There are two ways to run it. Most of the time, the first is all you need.

### 1. Just open it (zero setup)

Open `seagull-md-viewer.html` in a browser and **drag a folder onto the window**:

```sh
open seagull-md-viewer.html      # macOS
```

Everything is read locally in your browser — nothing is uploaded. Drag-and-drop,
the file tree, favorites, themes, and fonts all work with no server and no flags.

### 2. Serve it over a local HTTP server (optional, unlocks more)

For the URL-parameter and deep-linking features, serve the folder over a tiny
local web server. Any static file server works — the simplest, with no install,
is Python's built-in one:

```sh
cd /folder/with/the/viewer/and/your/files
python3 -m http.server 8001 --bind 127.0.0.1   # --bind keeps it to this machine
```

…then open `http://localhost:8001/seagull-md-viewer.html`. (Prefer something
else? `npx serve`, `php -S localhost:8001`, etc. all do the same job.)

The directory you serve becomes the web root, so put the viewer and the content
you want to browse under it. Running over `http://` rather than `file://` unlocks:

- **`?file=` / `?dir=` without a browser flag** — e.g. `…/seagull-md-viewer.html?dir=http://localhost:8001/notes`
- **Folder browsing from a URL** via `?dir=`
- **Relative images** in markdown actually render (they resolve against the http URL)
- **Drag-out links** open and render at the destination instead of hitting the `file://` wall
- It **mirrors the deployed experience**, so it doubles as a pre-publish test for GitHub Pages

> Without a server, the only limitation is that `?file=`/`?dir=` with `file://`
> paths need the browser launched with `--allow-file-access-from-files`.
> Plain drag-and-drop never needs any of this.

## Tests

```sh
node seagull-md-viewer-tests/run-tests.mjs     # logic tests (no browser)
```

`seagull-md-viewer-tests/MANUAL-TESTS.md` covers the browser-only cases.

## License

MIT — © 2026 Sea Gull Way Ventures Inc. See [`LICENSE`](LICENSE).

Markdown rendering by [marked](https://github.com/markedjs/marked) (MIT),
inlined into the single HTML file (no CDN — fully self-contained) — see
[`THIRD-PARTY-NOTICES.md`](THIRD-PARTY-NOTICES.md).
