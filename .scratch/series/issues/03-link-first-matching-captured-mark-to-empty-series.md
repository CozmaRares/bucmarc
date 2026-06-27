Status: ready-for-agent

# Link First Matching Captured Mark to an Empty Series

## Parent

.scratch/series/PRD.md

## What to build

Run Series Matching after a newly saved Mark is created through the Capture Flow while preserving the immediate redirect to the saved URL. When the new Mark matches exactly one Series that has no current Mark, make that Mark the Series current Mark and clear the Mark Title and Category.

Series Matching must apply only to newly saved Marks. Creating or editing a Series must not retroactively reorganize existing Marks.

## Acceptance criteria

- [x] Saving a new Mark through `/api/mark/save/:url` still redirects immediately to the saved URL after the Mark is saved.
- [x] Series Matching runs after the new Mark is saved and does not change the successful Capture Flow redirect.
- [x] A newly saved Mark that matches exactly one empty Series becomes that Series current Mark.
- [x] A Mark linked to a Series has its own Title cleared.
- [x] A Mark linked to a Series has its own Category cleared.
- [x] The linked Mark appears through the Series saved item rather than as a standalone Mark in category and uncategorized views.
- [x] A categorized captured Mark does not cause the matched Series to inherit that Category.
- [x] Creating a Series does not retroactively match existing Marks.
- [x] Editing a Series does not retroactively match existing Marks.
- [x] Tests or manual verification cover the Capture Flow redirect and the eventual linked-Series display.

## Blocked by

- .scratch/series/issues/01-create-empty-series-from-series-management-page.md
- .scratch/series/issues/02-display-series-as-saved-items-in-category-views.md

## Comments

- implementation uses a worker pool
