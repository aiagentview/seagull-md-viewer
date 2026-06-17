# Code & Tasks

## Several languages

```js
const sum = (a, b) => a + b;
export default sum;
```

```css
:root { --read-font: Georgia, serif; }
#content { font-family: var(--read-font); }
```

```json
{
  "name": "seagull-md-viewer",
  "license": "MIT",
  "themes": ["midnight", "paper", "dark", "sepia"]
}
```

```sql
SELECT title, stars FROM recipes WHERE stars >= 4 ORDER BY title;
```

## A long line that should scroll horizontally inside the code block

```text
this_is_a_deliberately_very_long_single_line_of_code_with_no_spaces_to_verify_that_the_code_block_scrolls_horizontally_instead_of_wrapping_and_breaking_the_layout_of_the_reading_pane
```

## Task tracking

- [x] fenced code in multiple languages
- [x] inline `code` spans
- [ ] mixed checked/unchecked rendering
- [ ] indented sub-tasks
  - [x] done sub-task
  - [ ] pending sub-task
