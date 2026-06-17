# Sample Vault

Original test content for **🐦 SeaGull MD Viewer** — a small folder of Markdown
(and one HTML) files arranged in nested subfolders, so you can exercise folder
loading, the tree, the filter, favorites, and every rendering feature without
needing any private data.

## What's here

- `kitchen-sink.md` — every Markdown construct in one document (headings, tables,
  task lists, nested quotes/lists, fenced code, inline HTML, images, escapes).
- `guides/` — `getting-started.md`, `advanced-features.md`
- `reference/` — `tables-and-data.md`, `code-and-tasks.md`
- `sample-page.html` — a self-styled HTML file, to test the sandboxed `‹html›`
  iframe path.

## How to use it

- **Drag** this `sample-vault` folder onto the viewer, or
- **Serve** it and load via `?dir=` (no browser flag needed):

  ```sh
  cd seagull-md-viewer-tests && python3 -m http.server 8002
  # then open:  …/seagull-md-viewer.html?dir=http://localhost:8002/sample-vault
  ```

The automated suite (`run-tests.mjs`) also runs its directory-walk integration
test against this folder, so the public test suite is self-contained.

_All files here are original project content under the repo's MIT license._
