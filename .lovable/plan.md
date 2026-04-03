

## Plan: Auto-link URLs in Task Text

**What**: When a task's text contains a URL (e.g. `https://example.com`), render it as a clickable hyperlink that opens in a new tab, instead of plain text.

**How**:

1. **Create a `LinkifiedText` helper component** in `src/components/TodoView.tsx` (or a shared utils file). It will:
   - Use a regex to detect URLs in the task text (e.g. `https?://\S+`)
   - Split the text into segments — plain text and URL matches
   - Render URLs as `<a href="..." target="_blank" rel="noopener noreferrer">` styled with underline and the primary/accent color
   - Render non-URL parts as plain text spans

2. **Replace the plain `{task.text}` render** (line ~182) with `<LinkifiedText text={task.text} />`, preserving the existing strikethrough styling for completed tasks.

**Files changed**: `src/components/TodoView.tsx` only.

