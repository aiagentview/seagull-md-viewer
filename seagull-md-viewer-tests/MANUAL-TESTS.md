# 🐦 SeaGull MD Viewer — manual test checklist

Browser-only cases for `utils/seagull-md-viewer.html`. The logic-heavy parts
(URL/path normalization, the `?dir=` directory-listing parsers, tree building)
are covered by the automated suite — run that first:

```bash
node seagull-md-viewer-tests/run-tests.mjs        # expect: "57 passed, 0 failed"
```

Everything below needs a real browser (drag events + the File System Access API
can't be automated headlessly).

**Test content.** The repo bundles a self-contained vault at
`seagull-md-viewer-tests/sample-vault/` — **9 viewable files** (7 `.md` + 1 `.html` +
1 `.pdf`) in nested subfolders, including a `kitchen-sink.md` that exercises every
Markdown construct, an `obsidian-features.md`, and a `sample-document.pdf`. Use it
anywhere. The examples below reference the author's private
`~/ai/wiki` (**54 files**); if you don't have it, substitute `sample-vault` and its
file count. For a long/real-world stress test, `~/ai/samples/awesome-list.md`
(~900 lines) is handy too.

Paths used below:
- Viewer: `file:///Users/muralidharan/projects/utils/seagull-md-viewer.html`
- Bundled vault: `seagull-md-viewer-tests/sample-vault/` (portable, 7 files)
- Author's wiki: `/Users/muralidharan/ai/wiki` (54 files; one HTML at `raw/politics/tvk-2026-election-promises.html`)

The top bar has four glyphs: **☆** favorite, **⛶** full-page, **🔄** reload, **❓** help —
plus the color-scheme and reading-font dropdowns.

---

## A. URL parameters over HTTP — no browser flags needed ✅ easiest

Because `fetch()` is allowed for `http://`, this exercises `?file=` and `?dir=`
fully without launching a special browser. Serve the wiki, copy the viewer next
to it so both share one origin, then open it over the server:

```bash
cp /Users/muralidharan/projects/utils/seagull-md-viewer.html ~/ai/seagull-md-viewer.html
cd ~/ai && python3 -m http.server 8001
```

| # | Open this URL | Expect |
|---|---|---|
| A1 | `http://localhost:8001/seagull-md-viewer.html?dir=http://localhost:8001/wiki` | Sidebar tree of the whole wiki; top bar shows **54 file(s)**; folders first |
| A2 | click `_index.md` in the tree | Renders; row highlights |
| A3 | `http://localhost:8001/seagull-md-viewer.html?file=http://localhost:8001/wiki/log.md` | `log.md` renders directly (no sidebar selection needed) |
| A4 | `...?file=http://localhost:8001/wiki/raw/politics/tvk-2026-election-promises.html` | HTML renders inside the framed iframe |
| A5 | In A1, type in the **filter** box (e.g. `index`) | Tree narrows to matching paths; folders auto-expand |

Stop the server with Ctrl-C when done; `rm ~/ai/seagull-md-viewer.html`.

---

## B. URL parameters over `file://` — needs the access flag

`?file=`/`?dir=` with `file://` paths use `fetch()`, which `file://` blocks by
default. Launch a flagged browser instance first:

```bash
open -na "Brave Browser" --args --allow-file-access-from-files
# (or "Google Chrome")
```

In **that** window:

| # | Open this URL | Expect |
|---|---|---|
| B1 | `file:///Users/muralidharan/projects/utils/seagull-md-viewer.html?file=/Users/muralidharan/ai/wiki/_index.md` | `_index.md` renders; bare path auto-prefixed to `file://` |
| B2 | `…/seagull-md-viewer.html?dir=/Users/muralidharan/ai/wiki` | Full wiki tree, **54 file(s)** |
| B3 | same as B2, then reload | Tree reloads from the `?dir=` URL (also now in **Recent** as a 🔗) |
| B4 | bad path `…?dir=/no/such/dir` | Clean "Could not list folder" error, not a blank page |

> If B1/B2 show a fetch/CORS error, the window wasn't launched with the flag.
> Section A avoids this entirely.

---

## C. Drag & drop (the main use case)

Plain double-click `seagull-md-viewer.html` to open it (no flag needed for drag & drop).

| # | Action | Expect |
|---|---|---|
| C1 | Drag the **`wiki` folder** from Finder onto the window | Full-window dashed overlay while dragging; on drop, sidebar tree with **54 file(s)** |
| C2 | Click around the tree | Files render; HTML file (`raw/politics/…html`) shows in an iframe and is tagged `‹html›` in the tree |
| C3 | Drag a **single `.md`** (e.g. `log.md`) onto the window | Renders that file; no sidebar |
| C4 | Drag a **non-viewable file** (e.g. `raw/Pasted image ….png`) | "Unsupported file" / "Nothing to open" message, no crash |
| C5 | Collapse/expand folders via the ▸ triangles | Works; state is per-session |
| C6 | **Chrome/Edge only:** after C1, note no contents were read until you clicked — large folders open instantly (names-only) |
| C7 | **Brave/Safari:** after C1, top bar briefly shows "reading … N files" | Snapshot is cached (tree labeled "cached") |

---

## D. Folder location + drag-out

Drag-out links need each file's absolute path. For a **dropped** folder the
browser hides it, so you supply it once.

| # | Action | Expect |
|---|---|---|
| D1 | After dropping `wiki` (C1), try to drag a **file row** to a new browser tab's address bar | Toast appears: "Drag-out links need this folder's absolute path…"; the **folder location** field flashes amber |
| D2 | Type `/Users/muralidharan/ai/wiki` into the **folder location** field, press Enter | Field saves; the currently open file re-renders |
| D3 | Drag a **file row** onto another browser window's tab bar | Opens a new viewer with `?file=file:///…/that-file.md` (needs the flagged window from §B to actually fetch markdown) |
| D4 | Drag a **folder name** (summary row) to a new tab | Opens with `?dir=file:///…/that-folder` |
| D5 | With a file open, drag the **filename in the top bar** to a new tab | Same as D3 for the current file |
| D6 | Reload, reopen the folder from **Recent** | Folder location is remembered (no re-typing) |
| D7 | If a file references a **relative image**, with the location set it now loads | Image renders (was broken before the location was set) |

> Loading via `?dir=` (§A/§B) skips all of D1–D2 — the path is known, so drag-out
> works immediately. Over the http server (§A) the link is `http://…` and the
> destination renders with no flag.

---

## E. Recent list & persistence

| # | Action | Expect |
|---|---|---|
| E1 | Open a few files/folders | Each appears in **Recent** (newest first), with relative time ("now", "5m") |
| E2 | **Reload the page** | Recent list survives (stored in localStorage + IndexedDB) |
| E3 | Click a recent **folder** — *Chrome/Edge* | One-click "allow access" prompt, then **live** current contents |
| E4 | Click a recent **folder** — *Brave/Safari* | Reopens instantly from the **cached** snapshot (labeled "cached") |
| E5 | Hover a recent row, click **✕** | That entry is removed (and its IndexedDB payload) |
| E6 | Click **clear** in the Recent header | Confirm dialog, then list empties; IndexedDB `payloads` store fully wiped (orphans too) |
| E7 | Open 16+ different folders, then check DevTools → Application → IndexedDB → `mdviewer` → `payloads` | Never holds more than ~15 entries (cap pruning works) |

---

## F. Chrome / UI

| # | Action | Expect |
|---|---|---|
| F1 | Drag the **divider** between sidebar and content | Sidebar resizes (170–640px); long filenames become fully visible |
| F2 | **Double-click** the divider | Resets to 290px |
| F3 | Reload | Sidebar width persists |
| F4 | Click **⛶** in the top bar | **Full-page mode**: sidebar, divider, and top bar all vanish — only the rendered content remains |
| F5 | In full-page, press **Esc** (or click the faint **✕** top-right) | Exits full-page; chrome returns |
| F6 | Change the **theme** dropdown (Midnight / Paper / Dark / Sepia) | Whole UI + rendered markdown restyle instantly |
| F7 | Pick a non-default theme, **reload** | No flash of the old theme on load (anti-FOUC), choice remembered |
| F8 | Click **❓** | Help modal opens; documents all of the above; **Esc** or click-outside closes |
| F9 | Drag a tree item (start a drag-out) | The full-window "drop here" overlay does **not** appear (internal drags are distinguished from Finder drops) |
| F10 | Check branding | **🐦 SeaGull MD Viewer** wordmark in the sidebar header, bird favicon in the tab, brand in the tab title |

---

## G. Favorites (starred files)

| # | Action | Expect |
|---|---|---|
| G1 | Open a file (tree click, drop, or `?file=`), then click **☆** in the top bar | Glyph fills to gold **★**; a **Favorites** section appears above Recent with that file |
| G2 | Click the **★** again (or the ★ on the favorite's row) | File is un-starred; glyph returns to ☆; row disappears; section hides when empty |
| G3 | Star a file, load a different folder, then click the favorite | The starred file renders (from its snapshot) without re-loading its folder |
| G4 | Star a file, **reload** the page | Favorites survive (localStorage + IndexedDB `favorites` store) |
| G5 | Click **☆** with no file open (folder tree showing, nothing selected) | Toast: "Open a file first, then star it…"; nothing added |
| G6 | Star a markdown file and an `.html` file | Both appear (📄 / 🌐 icons); each reopens correctly |
| G7 | Click **clear** under Recent | Favorites are **not** affected (separate store) |

---

## What's covered where

| Area | Automated (`run-tests.mjs`) | Manual (this file) |
|---|---|---|
| `normalizeRoot`, `encPath`, `shortLabel` | ✅ | — |
| `?dir=` listing parsers (Chromium + generic) | ✅ | A1, B2 (live) |
| `treeFromUrl` end-to-end vs real wiki | ✅ (54 files) | A1/B2 (visual) |
| `treeFromSnapshot`, `nodeCmp`, `countFiles` | ✅ | C1 (visual) |
| `isMd`/`isHtml`/`isViewable`, `timeAgo`, `recentKey` | ✅ | — |
| Drag & drop (folder/file), overlay | — | C, F9 |
| File System Access handles / permissions | — | C6, E3 |
| Drag-out links, folder-location field | — | D |
| Recents persistence + cap pruning + clear | — | E |
| Resizer, full-page mode, themes, help, branding | — | F |
| Favorites (star, persist, reopen, separate store) | — | G |
| `?file=`/`?dir=` over http and file:// | — | A, B |
