Status: done

# Create Empty Series From the Series Management Page

## Parent

.scratch/series/PRD.md

## What to build

Add first-class Series records and a separate `/series` management page where the App Owner can create Series with a required Title, required Series Pattern, and optional Category. A Series should be manageable before it has a current Mark, and the page should show Series both with and without current Marks.

The Series Pattern must be validated as a regex with exactly one named capture called `episode`, no other named captures.

## Acceptance criteria

- [x] A Series can be created with a required Title and required Series Pattern.
- [x] A Series can optionally be assigned to a Category at creation time.
- [x] A Series can be created without a current Mark.
- [x] The `/series` page lists Series with their Title, Series Pattern, optional Category, and current-Mark state.
- [x] A Series without a current Mark is visible on `/series` and does not link to a URL.
- [x] Series Pattern validation rejects zero named captures.
- [x] Series Pattern validation rejects more than one named capture.
- [x] Series Pattern validation rejects named captures other than `episode`.
- [x] Existing Mark creation, editing, and category behavior remains unchanged for standalone Marks.
- [x] Tests or manual verification cover creating categorized and uncategorized Series.

## Blocked by

None - can start immediately

## Comments

### Implementation - 2026-06-22

Implemented the first Series slice:

- Added the `series` table with required title and series pattern, optional category, optional current mark, and uniqueness for current mark ownership.
- Added reusable Series Pattern validation for one named `episode` capture.
- Added `createSeries` and `getSeries` persistence helpers.
- Added `/api/series/create` and the `/series` management page.
- Verified categorized and uncategorized Series creation directly against the local SQLite database after `bun run db:push`.
- Verified validation rejections for zero named captures, multiple named captures, non-`episode` named capture.
- Ran `bun run typecheck` and `bun run build`.
