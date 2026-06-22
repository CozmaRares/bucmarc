Status: ready-for-agent

# Show Series in Shared Views

## Parent

.scratch/series/PRD.md

## What to build

Update Shared Views so shared Categories render the same combined saved items as the Private Management Area: standalone Marks plus Series. A shared Series with a current Mark should open the current Mark URL. Category-scoped sharing, Share-Only Category behavior, and Token-Manageable Category permissions should remain unchanged except where they display combined saved items.

## Acceptance criteria

- [ ] A Shared View shows standalone Marks and Series together for the shared Category.
- [ ] A shared Series with a current Mark displays the Series Title and links to the current Mark URL.
- [ ] A shared Series without a current Mark displays without inventing a target URL.
- [ ] Shared View inclusion for Series is based on the Series Category.
- [ ] Linked Mark Title and Category do not override the Series Title or Category in Shared Views.
- [ ] Existing Share Token access remains scoped to one Category.
- [ ] Existing Share-Only Category behavior remains unchanged.
- [ ] Existing Token-Manageable Category permissions remain unchanged for supported Mark operations.
- [ ] Tests or manual verification cover shared categorized Series with and without current Marks.

## Blocked by

- .scratch/series/issues/02-display-series-as-saved-items-in-category-views.md
- .scratch/series/issues/03-link-first-matching-captured-mark-to-empty-series.md
