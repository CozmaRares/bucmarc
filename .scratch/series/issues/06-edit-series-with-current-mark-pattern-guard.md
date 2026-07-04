Status: done

# Edit Series With Current-Mark Pattern Guard

## Parent

.scratch/series/PRD.md

## What to build

Add Series editing to the `/series` management page. The App Owner should be able to edit a Series Title, Series Pattern, and Category. Edited Series Patterns must follow the same validation rules as creation.

## Acceptance criteria

- [x] The `/series` page supports editing a Series Title.
- [x] The `/series` page supports editing a Series Category.
- [x] The `/series` page supports editing a Series Pattern.
- [x] Edited Series Patterns require exactly one named capture called `episode`.
- [x] Edited Series Patterns reject any other named captures.
- [x] Editing a Series without a current Mark does not require matching an existing Mark.
- [x] Editing a Series does not retroactively reorganize existing Marks.

## Blocked by

- .scratch/series/issues/01-create-empty-series-from-series-management-page.md
- .scratch/series/issues/03-link-first-matching-captured-mark-to-empty-series.md
