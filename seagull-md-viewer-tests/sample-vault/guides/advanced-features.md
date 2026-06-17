# Advanced Features

## Drag-out

Drag a file row from the tree onto another browser window's tab bar to open it
there. Needs the folder location set (or a `?dir=`/`?file=` load).

## Parameters

| Param   | Example                                  | Effect                  |
|---------|------------------------------------------|-------------------------|
| `?file` | `?file=http://localhost:8002/sample-vault/kitchen-sink.md` | render one file |
| `?dir`  | `?dir=http://localhost:8002/sample-vault` | load a whole folder     |

## A nested checklist

- [x] nested folder rendering
- [x] task lists inside a deep file
- [ ] something still to do

## Code sample

```bash
node seagull-md-viewer-tests/run-tests.mjs
```

Back to [getting started](getting-started.md).
