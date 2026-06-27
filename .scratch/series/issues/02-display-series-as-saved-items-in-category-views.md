Status: done

# Display Series as Saved Items in Category Views

## Parent

.scratch/series/PRD.md

## What to build

Update the Private Management Area category and uncategorized views to render saved items as a combined list of standalone Marks and Series. Categories should represent saved items rather than storage tables, so a Category can contain both standalone Marks and Series.

A Series with a current Mark should display as the Series Title linked to the current Mark URL. A Series without a current Mark should not be displayed.

## Acceptance criteria

- [X] Categorized views show standalone Marks and Series together in one saved-item list per Category.
- [X] Uncategorized views show uncategorized standalone Marks and uncategorized Series together.
- [X] A Series with a current Mark links to the current Mark URL and displays the Series Title.
- [X] A Series without a current Mark isn't displayed.
- [X] A Mark that does not belong to a Series continues to display its own Title or URL fallback.
- [X] Category membership for Series is based on the Series Category, not any linked Mark Category.
- [X] Share-Only Category visibility remains unchanged for the Private Management Area.
- [X] Tests or manual verification cover categorized Series, uncategorized Series, standalone Marks, and empty Categories.

## Blocked by

- .scratch/series/issues/01-create-empty-series-from-series-management-page.md
