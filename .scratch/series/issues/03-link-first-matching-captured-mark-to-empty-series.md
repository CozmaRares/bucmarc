Status: ready-for-agent

# Link First Matching Captured Mark to an Empty Series

## Parent

.scratch/series/PRD.md

## What to build

Run Series Matching after a newly saved Mark is created through the Capture Flow while preserving the immediate redirect to the saved URL. When the new Mark matches exactly one Series that has no current Mark, make that Mark the Series current Mark and clear the Mark Title and Category.

Series Matching must apply only to newly saved Marks. Creating or editing a Series must not retroactively reorganize existing Marks.

## Acceptance criteria

- [ ] Saving a new Mark through `/api/mark/save/:url` still redirects immediately to the saved URL after the Mark is saved.
- [ ] Series Matching runs after the new Mark is saved and does not change the successful Capture Flow redirect.
- [ ] A newly saved Mark that matches exactly one empty Series becomes that Series current Mark.
- [ ] A Mark linked to a Series has its own Title cleared.
- [ ] A Mark linked to a Series has its own Category cleared.
- [ ] The linked Mark appears through the Series saved item rather than as a standalone Mark in category and uncategorized views.
- [ ] A categorized captured Mark does not cause the matched Series to inherit that Category.
- [ ] Creating a Series does not retroactively match existing Marks.
- [ ] Editing a Series does not retroactively match existing Marks.
- [ ] Tests or manual verification cover the Capture Flow redirect and the eventual linked-Series display.

## Blocked by

- .scratch/series/issues/01-create-empty-series-from-series-management-page.md
- .scratch/series/issues/02-display-series-as-saved-items-in-category-views.md
