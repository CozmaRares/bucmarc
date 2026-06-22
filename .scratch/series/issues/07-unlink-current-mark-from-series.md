Status: ready-for-agent

# Unlink Current Mark From a Series

## Parent

.scratch/series/PRD.md

## What to build

Add Series Unlinking to the `/series` management page. Series Unlinking should remove the current Mark from the Series while keeping both records. The unlinked Mark becomes standalone, copies the Series Category when present, becomes uncategorized when the Series has no Category, and does not copy the Series Title.

This gives the App Owner a way to change a Series Pattern that would no longer match the old current Mark without destroying the saved URL.

## Acceptance criteria

- [ ] A Series with a current Mark can be unlinked from `/series`.
- [ ] Series Unlinking keeps the Series record.
- [ ] Series Unlinking keeps the Mark record.
- [ ] After unlinking, the Series has no current Mark.
- [ ] After unlinking, the Mark is standalone.
- [ ] If the Series has a Category, the unlinked Mark copies that Category.
- [ ] If the Series has no Category, the unlinked Mark becomes uncategorized.
- [ ] The unlinked Mark does not copy the Series Title.
- [ ] The unlinked Mark remains visible in the appropriate category or uncategorized saved-item list.
- [ ] Tests or manual verification cover unlinking categorized and uncategorized Series.

## Blocked by

- .scratch/series/issues/03-link-first-matching-captured-mark-to-empty-series.md
