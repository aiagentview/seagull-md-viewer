#!/usr/bin/env node
// Automated tests for seagull-md-viewer.html — the parts that DON'T need a browser:
//   • path / URL normalization (normalizeRoot, encPath, shortLabel)
//   • directory-listing parsers (parseListing: Chromium file:// index + generic <a href>)
//   • tree builders (treeFromSnapshot, and treeFromUrl end-to-end against ~/ai/wiki)
//   • small helpers (isMd/isHtml/isViewable, nodeCmp, timeAgo, recentKey, countFiles)
//
// It loads the REAL functions out of seagull-md-viewer.html (no copy-paste, so tests
// can't silently drift from the source) by evaluating the inline script with the browser
// globals stubbed out. The interactive drag-and-drop cases live in MANUAL-TESTS.md.
//
// Run:  node seagull-md-viewer-tests/run-tests.mjs

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const VIEWER = path.join(HERE, '..', 'seagull-md-viewer.html');
// Bundled, self-contained test content so the suite runs anywhere (no private data).
const VAULT = path.join(HERE, 'sample-vault');

/* ---------------- tiny test harness ---------------- */
let pass = 0, fail = 0;
const fails = [];
function ok(name, cond, detail) {
  if (cond) { pass++; }
  else { fail++; fails.push(name + (detail ? ` — ${detail}` : '')); console.log(`  ✗ ${name}${detail ? ` — ${detail}` : ''}`); }
}
function eq(name, got, want) {
  const g = JSON.stringify(got), w = JSON.stringify(want);
  ok(name, g === w, g === w ? '' : `got ${g}, want ${w}`);
}
function section(t) { console.log(`\n${t}`); }

/* ---------------- load the real functions from seagull-md-viewer.html ---------------- */

function makeEl() {
  // a permissive stub element: any property assignment works, any method is a no-op
  return {
    addEventListener() {}, removeEventListener() {},
    appendChild() {}, append() {}, removeChild() {}, remove() {},
    setAttribute() {}, getAttribute() { return null; },
    querySelector() { return null; }, querySelectorAll() { return []; },
    focus() {}, click() {}, blur() {},
    classList: { add() {}, remove() {}, toggle() {}, contains() { return false; } },
    style: {}, dataset: {}, files: [],
    value: '', textContent: '', innerHTML: '', title: '', draggable: false,
  };
}

function loadViewer() {
  const html = fs.readFileSync(VIEWER, 'utf8');
  const scripts = [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].map(m => m[1]);
  const src = scripts.find(s => s.includes('function normalizeRoot'));
  if (!src) throw new Error('could not locate the main inline <script> (no normalizeRoot)');

  const elCache = new Map();
  const documentStub = {
    getElementById(id) { if (!elCache.has(id)) elCache.set(id, makeEl()); return elCache.get(id); },
    documentElement: Object.assign(makeEl(), { dataset: {} }),
    body: makeEl(),
    createElement: () => makeEl(),
    addEventListener() {}, querySelector() { return null; }, querySelectorAll() { return []; },
    title: '',
  };
  const windowStub = {
    location: { search: '', href: 'file:///Users/me/projects/utils/seagull-md-viewer.html', reload() {} },
    addEventListener() {},
  };
  const markedStub = { setOptions() {}, use() {}, parse: (s) => String(s), parseInline: (s) => String(s) };
  const store = new Map();
  const localStorageStub = {
    getItem: (k) => (store.has(k) ? store.get(k) : null),
    setItem: (k, v) => store.set(k, String(v)),
    removeItem: (k) => store.delete(k),
  };
  const indexedDBStub = { open: () => ({}) };
  // fetch is swapped per-test via a thunk so the same factory can serve integration tests
  let fetchImpl = async () => { throw new Error('fetch not configured'); };
  const fetchStub = (...a) => fetchImpl(...a);

  const exportLine = `\n;return { normalizeRoot, encPath, parseListing, treeFromSnapshot,` +
    ` treeFromUrl, countFiles, shortLabel, isMd, isHtml, isPdf, isViewable, timeAgo, recentKey, nodeCmp, slugify,` +
    ` renderFrontmatter, processFootnotes };`;
  const factory = new Function(
    'window', 'document', 'marked', 'localStorage', 'indexedDB', 'confirm', 'alert', 'fetch', 'FileReader',
    src + exportLine
  );
  const api = factory(
    windowStub, documentStub, markedStub, localStorageStub, indexedDBStub,
    () => true, () => {}, fetchStub, function FileReader() {}
  );
  return { api, setFetch: (fn) => { fetchImpl = fn; } };
}

const { api: T, setFetch } = loadViewer();

/* ================= pure-logic tests ================= */

section('normalizeRoot');
eq('absolute path → file://',          T.normalizeRoot('/Users/me/wiki'), 'file:///Users/me/wiki');
eq('trailing slash trimmed',           T.normalizeRoot('/Users/me/wiki/'), 'file:///Users/me/wiki');
eq('file:// passthrough',              T.normalizeRoot('file:///x/y'), 'file:///x/y');
eq('http passthrough',                 T.normalizeRoot('http://h/x'), 'http://h/x');
eq('https passthrough',                T.normalizeRoot('https://h/x'), 'https://h/x');
eq('empty → null',                     T.normalizeRoot('   '), null);
eq('relative → null',                  T.normalizeRoot('relative/path'), null);
eq('spaces encoded',                   T.normalizeRoot('/Users/me/my recipes'), 'file:///Users/me/my%20recipes');
eq('unicode encoded',                  T.normalizeRoot('/Users/me/café'), 'file:///Users/me/caf%C3%A9');

section('encPath');
eq('space',   T.encPath('a/b c/d'), 'a/b%20c/d');
eq('unicode', T.encPath('x/ü'), 'x/%C3%BC');
eq('plain',   T.encPath('a/b/c'), 'a/b/c');

section('file-type predicates');
for (const n of ['a.md', 'a.markdown', 'a.mdown', 'a.mkd', 'A.MD']) ok(`isMd(${n})`, T.isMd(n));
for (const n of ['a.html', 'a.htm', 'a.xhtml', 'A.HTML']) ok(`isHtml(${n})`, T.isHtml(n));
ok('isMd(a.txt) false', !T.isMd('a.txt'));
ok('isHtml(a.md) false', !T.isHtml('a.md'));
ok('isViewable(a.txt) false', !T.isViewable('a.txt'));
ok('isViewable(a.png) false', !T.isViewable('a.png'));
ok('isViewable(a.md) true', T.isViewable('a.md'));
ok('isPdf(a.pdf) true', T.isPdf('a.pdf'));
ok('isPdf(A.PDF) true', T.isPdf('A.PDF'));
ok('isPdf(a.md) false', !T.isPdf('a.md'));
ok('isViewable(a.pdf) true', T.isViewable('a.pdf'));
ok('isViewable(a.html) true', T.isViewable('a.html'));

section('parseListing — Chromium file:// index');
{
  const chromium = `
    <script>start(...)
    addRow("..","..",1,0,"","",0,"");
    addRow("concepts","concepts/",1,0,"","Apr 15","",0);
    addRow("_index.md","_index.md",0,6940,"6.8 kB","Jun 11","",0);
    addRow("Pasted image 1.png","Pasted%20image%201.png",0,12,"12 B","Apr 15","",0);
  `;
  const r = T.parseListing(chromium);
  eq('chromium: parent .. skipped & 3 entries', r.length, 3);
  eq('chromium: dir flagged',  r.find(e => e.name === 'concepts')?.isDir, true);
  eq('chromium: file flagged', r.find(e => e.name === '_index.md')?.isDir, false);
  ok('chromium: name with spaces decoded', r.some(e => e.name === 'Pasted image 1.png'));
}

section('parseListing — generic <a href> listing (python http.server / nginx)');
{
  const generic = `
    <html><body><ul>
    <li><a href="../">../</a></li>
    <li><a href="concepts/">concepts/</a></li>
    <li><a href="_index.md">_index.md</a></li>
    <li><a href="b%20c.md">b c.md</a></li>
    <li><a href="/abs/x.md">x</a></li>
    <li><a href="http://other/y.md">y</a></li>
    </ul></body></html>`;
  const r = T.parseListing(generic);
  const names = r.map(e => e.name).sort();
  eq('generic: parent/absolute/remote skipped', names, ['_index.md', 'b c.md', 'concepts']);
  eq('generic: dir flagged',  r.find(e => e.name === 'concepts')?.isDir, true);
  eq('generic: %20 decoded',  r.find(e => e.name === 'b c.md')?.isDir, false);
}

section('treeFromSnapshot');
{
  const tree = T.treeFromSnapshot([
    { path: 'b.md', content: 'B' },
    { path: 'a/c.md', content: 'C' },
    { path: 'a/b.md', content: 'X' },
  ]);
  eq('dirs sort before files', tree.map(n => n.type), ['dir', 'file']);
  eq('top dir name', tree[0].name, 'a');
  eq('top dir path', tree[0].path, 'a');
  eq('children sorted by name', tree[0].children.map(n => n.name), ['b.md', 'c.md']);
  eq('top file path', tree[1].path, 'b.md');
}

section('nodeCmp / shortLabel / timeAgo / recentKey');
ok('nodeCmp dir<file', T.nodeCmp({ type: 'dir', name: 'z' }, { type: 'file', name: 'a' }) < 0);
ok('nodeCmp same-type by name', T.nodeCmp({ type: 'file', name: 'a' }, { type: 'file', name: 'b' }) < 0);
eq('shortLabel keeps last two', T.shortLabel('/a/b/c'), 'b/c');
eq('shortLabel short path unchanged', T.shortLabel('/a'), '/a');
eq('timeAgo now', T.timeAgo(Date.now() - 5_000), 'now');
eq('timeAgo minutes', T.timeAgo(Date.now() - 120_000), '2m');
eq('timeAgo hours', T.timeAgo(Date.now() - 3_700_000), '1h');
eq('timeAgo days', T.timeAgo(Date.now() - 90_000_000), '1d');
eq('recentKey dir', T.recentKey({ type: 'dir', label: 'x' }), 'dir|x');
eq('recentKey url', T.recentKey({ type: 'url', url: 'u', label: 'x' }), 'url|u');

section('slugify (GitHub-compatible heading ids for in-page TOC links)');
eq('simple word', T.slugify('Community'), 'community');
eq('spaces → hyphens', T.slugify('Programming Languages'), 'programming-languages');
eq('keeps existing hyphen', T.slugify('Front-End Development'), 'front-end-development');
eq('strips punctuation', T.slugify('What is it? (really)'), 'what-is-it-really');
eq('strips emoji', T.slugify('Community 🌊'), 'community-');
eq('keeps underscore + digits', T.slugify('Section_2 Notes'), 'section_2-notes');

section('frontmatter → properties table');
{
  const t = T.renderFrontmatter('title: Hello World\ntags:\n  - a\n  - b\nempty:');
  ok('wraps in frontmatter table', t.includes('class="frontmatter"'));
  ok('key/value row', t.includes('<th>title</th>') && t.includes('<td>Hello World</td>'));
  ok('folds block list to comma list', t.includes('a, b'));
  eq('no frontmatter → empty string', T.renderFrontmatter('not: \n   '), T.renderFrontmatter('not: \n   '));
  ok('escapes HTML in values', T.renderFrontmatter('x: <b>hi</b>').includes('&lt;b&gt;'));
}

section('footnotes');
{
  const r = T.processFootnotes('See[^1] and[^a].\n\n[^1]: one\n[^a]: two');
  ok('numbers refs by appearance', r.md.includes('fnref-1') && r.md.includes('>1</a>') && r.md.includes('>2</a>'));
  ok('definitions removed from body', !/\n\[\^1\]:/.test(r.md));
  ok('builds footnotes section', r.footnotesHtml.includes('id="fn-1"') && r.footnotesHtml.includes('one'));
  ok('back-link present', r.footnotesHtml.includes('fnref-1'));
  const none = T.processFootnotes('plain text, no footnotes');
  ok('no footnotes → empty section', none.footnotesHtml === '');
  ok('unknown [^ref] left alone', T.processFootnotes('text[^missing] end').md.includes('[^missing]'));
}

/* ================= integration: ?dir= pipeline against the bundled sample-vault ================= */

section('treeFromUrl — bundled sample-vault via a faked Chromium directory server');
if (!fs.existsSync(VAULT)) {
  console.log('  (skipped — sample-vault not found)');
} else {
  const absWiki = fs.realpathSync(VAULT);
  const base = 'file://' + T.encPath(absWiki);

  // expected: viewable (.md/.html) files under non-dot paths, computed independently
  function walkExpected(dir, prefix, out) {
    for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
      if (e.name.startsWith('.')) continue;
      const rel = prefix ? prefix + '/' + e.name : e.name;
      if (e.isDirectory()) walkExpected(path.join(dir, e.name), rel, out);
      else if (T.isViewable(e.name)) out.push(rel);
    }
  }
  const expected = [];
  walkExpected(absWiki, '', expected);
  expected.sort();

  // fake server: directory URLs (end with '/') return a Chromium-style index;
  // file URLs return real file contents. Mirrors what a flag-launched browser sees.
  function chromiumIndex(dirAbs) {
    let s = 'addRow("..","..",1,0,"","",0,"");\n';
    for (const e of fs.readdirSync(dirAbs, { withFileTypes: true })) {
      const isDir = e.isDirectory();
      const enc = encodeURIComponent(e.name) + (isDir ? '/' : '');
      s += `addRow(${JSON.stringify(e.name)},${JSON.stringify(enc)},${isDir ? 1 : 0},0,"4 kB","Jun 11","",0);\n`;
    }
    return s;
  }
  setFetch(async (url) => {
    const after = String(url).slice(base.length).replace(/^\/+/, '');
    const isDir = String(url).endsWith('/');
    const trimmed = after.replace(/\/+$/, '');
    const rel = trimmed ? trimmed.split('/').map(decodeURIComponent).join('/') : '';
    const real = rel ? path.join(absWiki, rel) : absWiki;
    if (!fs.existsSync(real)) return { ok: false, status: 404, text: async () => '' };
    if (isDir) return { ok: true, status: 200, text: async () => chromiumIndex(real) };
    return { ok: true, status: 200, text: async () => fs.readFileSync(real, 'utf8') };
  });

  const tree = await T.treeFromUrl(base, '');

  // flatten to {path, node}
  const flat = [];
  (function walk(nodes) {
    for (const n of nodes) {
      if (n.type === 'dir') walk(n.children);
      else flat.push(n);
    }
  })(tree);
  const gotPaths = flat.map(n => n.path).sort();

  eq('file count matches independent walk', gotPaths.length, expected.length);
  eq('countFiles() agrees', T.countFiles(tree), expected.length);
  ok('paths match independent walk', JSON.stringify(gotPaths) === JSON.stringify(expected),
    gotPaths.length === expected.length ? '' : `${gotPaths.length} vs ${expected.length}`);
  ok('includes kitchen-sink.md at root', gotPaths.includes('kitchen-sink.md'));
  ok('descends into nested folders', gotPaths.some(p => p.includes('/')));
  ok('no dot-path leaked in', !gotPaths.some(p => p.split('/').some(seg => seg.startsWith('.'))));
  ok('the .html file is present', gotPaths.some(p => T.isHtml(p)));

  // lazy read() of a file goes back through fetch and returns real content
  const idx = flat.find(n => n.path === 'kitchen-sink.md');
  const body = await idx.read();
  ok('read(kitchen-sink.md) returns non-empty content', typeof body === 'string' && body.length > 0,
    `len=${body && body.length}`);
}

/* ================= summary ================= */
console.log(`\n${'─'.repeat(48)}`);
console.log(`${pass} passed, ${fail} failed`);
if (fail) { console.log('\nFAILED:'); for (const f of fails) console.log('  • ' + f); }
process.exit(fail ? 1 : 0);
