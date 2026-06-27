Status: ready-for-agent

# Display Series as Saved Items in Category Views

## Parent

.scratch/series/PRD.md

## What to build

Update the Private Management Area category and uncategorized views to render saved items as a combined list of standalone Marks and Series. Categories should represent saved items rather than storage tables, so a Category can contain both standalone Marks and Series.

A Series with a current Mark should display as the Series Title linked to the current Mark URL. A Series without a current Mark should not be displayed.

## Acceptance criteria

- [ ] Categorized views show standalone Marks and Series together in one saved-item list per Category.
- [ ] Uncategorized views show uncategorized standalone Marks and uncategorized Series together.
- [ ] A Series with a current Mark links to the current Mark URL and displays the Series Title.
- [ ] A Series without a current Mark isn't displayed.
- [ ] A Mark that does not belong to a Series continues to display its own Title or URL fallback.
- [ ] Category membership for Series is based on the Series Category, not any linked Mark Category.
- [ ] Share-Only Category visibility remains unchanged for the Private Management Area.
- [ ] Tests or manual verification cover categorized Series, uncategorized Series, standalone Marks, and empty Categories.

## Blocked by

- .scratch/series/issues/01-create-empty-series-from-series-management-page.md
