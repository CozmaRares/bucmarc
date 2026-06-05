Status: done

# Add Capture Flow With Optional Title

## Parent

.scratch/private-management-area/PRD.md

## What to build

Add the query-based Capture Flow while keeping the existing encoded-path save endpoint. Both capture endpoints should use the same save behavior: accept a URL, accept an optional Title where available, store blank Titles as no Title, redirect successful capture to the saved URL, and redirect invalid or duplicate capture back to the Private Management Area with a clear status.

The existing encoded-path endpoint must remain compatible for current integrations. Duplicate capture must not overwrite an existing Mark's Title or Category.

## Acceptance criteria

- [ ] A query-based Capture Flow route accepts a URL and optional Title.
- [ ] The existing encoded-path save endpoint still works.
- [ ] Both capture endpoints share URL validation, duplicate handling, and Title normalization behavior.
- [ ] Successful capture redirects to the saved URL.
- [ ] Invalid capture redirects to the Private Management Area with an error state and does not create a Mark.
- [ ] Duplicate capture redirects to the Private Management Area with an error state.
- [ ] Duplicate capture does not overwrite the existing Mark's Title or Category.
- [ ] Blank or missing Title input is stored as no Title.

## Blocked by

None - can start immediately
