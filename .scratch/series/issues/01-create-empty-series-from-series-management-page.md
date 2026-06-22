Status: ready-for-agent

# Create Empty Series From the Series Management Page

## Parent

.scratch/series/PRD.md

## What to build

Add first-class Series records and a separate `/series` management page where the App Owner can create Series with a required Title, required Series Pattern, and optional Category. A Series should be manageable before it has a current Mark, and the page should show Series both with and without current Marks.

The Series Pattern must be validated as a regex with exactly one named capture called `episode`, no other named captures, and a numeric captured Episode Identity when tested against matching URLs.

## Acceptance criteria

- [ ] A Series can be created with a required Title and required Series Pattern.
- [ ] A Series can optionally be assigned to a Category at creation time.
- [ ] A Series can be created without a current Mark.
- [ ] The `/series` page lists Series with their Title, Series Pattern, optional Category, and current-Mark state.
- [ ] A Series without a current Mark is visible on `/series` and does not link to a URL.
- [ ] Series Pattern validation rejects zero named captures.
- [ ] Series Pattern validation rejects more than one named capture.
- [ ] Series Pattern validation rejects named captures other than `episode`.
- [ ] Series Pattern validation rejects non-numeric Episode Identity for matched URLs where validation can observe a match.
- [ ] Existing Mark creation, editing, and category behavior remains unchanged for standalone Marks.
- [ ] Tests or manual verification cover creating categorized and uncategorized Series.

## Blocked by

None - can start immediately
