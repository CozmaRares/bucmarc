Status: ready-for-agent

# PRD: First-Class Series

## Problem Statement

Bucmarc needs to manage serial saved URLs without turning every new episode into another visible Mark the App Owner must clean up manually.

A serial work should have stable presentation and organization even as its current episode URL changes. Marks should remain saved URLs, while Series should represent the durable saved item for serial works.

The Capture Flow must remain fast. Saving from `/api/mark/save/:url` should immediately redirect to the saved URL after a successful save. Any Series Matching and Episode Replacement work must happen after the save and must be allowed to fail without changing the saved Mark.

## Solution

Add first-class Series.

A Series is a user-facing saved item with a required title, required Series Pattern, optional category, and optional current Mark. A Mark can stand alone with its own title and category, or it can become the current Mark for one Series. When a Mark belongs to a Series, Bucmarc clears the Mark title and category, displays the Series instead of the Mark, and uses the Series category for display and sharing.

When a new Mark is saved, Bucmarc enqueues Series Matching in the background and immediately completes the Capture Flow redirect. Matching applies only to newly saved Marks. Creating or editing a Series does not retroactively reorganize existing Marks.

Series Patterns are regex matchers with exactly one named capture, `episode`, and no other named captures. The captured episode value must be numeric. If a new Mark matches exactly one Series and advances that Series' current episode, Bucmarc points the Series at the new Mark and hard-deletes the older current Mark. If matching is ambiguous, invalid, stale, equal, lower, or otherwise fails, Bucmarc logs where useful and leaves data unchanged.

Categories display a combined list of saved items: standalone Marks and Series. Uncategorized views follow the same rule. A Series with no current Mark remains visible as a non-link item with editing controls.

## Final Flow

1. The App Owner creates a Series with a required title, required Series Pattern, and optional category.
2. Bucmarc validates the Series Pattern as a regex with exactly one named capture, `episode`; the capture must produce a numeric episode identity for matching URLs.
3. The Series appears as a saved item in category and uncategorized views. If it has no current Mark, it is visible but does not link to a URL.
4. The App Owner saves a URL through `/api/mark/save/:url`.
5. Bucmarc saves a normal Mark and immediately redirects to the saved URL.
6. Bucmarc runs Series Matching in the background for the newly saved Mark.
7. If the Mark matches zero Series, the Mark remains standalone.
8. If the Mark matches multiple Series, Bucmarc leaves data unchanged and logs the ambiguous match where useful.
9. If the Mark matches one Series with no current Mark, Bucmarc links the Mark as the Series current Mark and clears the Mark title and category.
10. If the Mark matches one Series with a current Mark, Bucmarc compares the new Mark's numeric episode identity with the current Mark's numeric episode identity.
11. If the new episode is greater, Bucmarc points the Series at the new Mark, clears the new Mark title and category, and hard-deletes the older current Mark.
12. If the new episode is equal, lower, invalid, or stale, Bucmarc leaves data unchanged and logs the non-advancing match where useful.

## User Stories

1. As the App Owner, I want Series to be first-class saved items, so that serial works have stable titles and categories independent of changing episode URLs.
2. As the App Owner, I want a Series to have a required title, so that I can recognize it even when it has no current Mark.
3. As the App Owner, I want a Series to have a required regex matcher, so that Bucmarc can recognize newly saved episode URLs.
4. As the App Owner, I want a Series to have an optional category, so that serial works can be organized alongside ordinary Marks.
5. As the App Owner, I want a Series to optionally point at a current Mark, so that a Series can exist before or after it has a current episode URL.
6. As the App Owner, I want a standalone Mark to keep supporting titles, so that random saved URLs with opaque paths remain understandable.
7. As the App Owner, I want a standalone Mark to keep supporting categories, so that ordinary saved URLs remain organized.
8. As the App Owner, I want a Mark linked to a Series to clear its own title and category, so that the Series is the single source of display and organization.
9. As the App Owner, I want Series categories to take over display and sharing for linked Marks, so that the linked URL appears wherever the Series belongs.
10. As the App Owner, I want Series and standalone Marks to appear in one combined category list, so that categories represent saved items rather than storage tables.
11. As the App Owner, I want uncategorized Series and uncategorized standalone Marks to appear together, so that uncategorized saved items are managed in one place.
12. As the App Owner, I want a Series with no current Mark to remain visible, so that I can create and manage a Series before the first matching episode is saved.
13. As the App Owner, I want a Series with a current Mark to display as a link to that Mark URL, so that opening the Series opens the current episode.
14. As the App Owner, I want a Series with no current Mark to display without a link, so that Bucmarc does not invent a target URL.
15. As the App Owner, I want saving a new Mark through the Capture Flow to redirect immediately, so that capture remains lightweight.
16. As the App Owner, I want Series Matching to happen in the background, so that regex work and replacement cleanup do not slow down capture.
17. As the App Owner, I want Series Matching failure to leave data unchanged, so that a bad matcher cannot break a successful save.
18. As the App Owner, I want Series Matching to apply only to newly saved Marks, so that creating or editing a Series does not unexpectedly reorganize existing Marks.
19. As the App Owner, I want a Series Pattern to require exactly one named capture called `episode`, so that episode extraction is unambiguous.
20. As the App Owner, I want all other named captures to be rejected, so that a Series Pattern has one clear comparison value.
21. As the App Owner, I want episode identity to be numeric only, so that replacement comparison is simple and predictable.
22. As the App Owner, I want a newly saved Mark that advances a Series to become that Series' current Mark, so that the Series follows the latest episode.
23. As the App Owner, I want the older current Mark to be hard-deleted after Episode Replacement, so that stale episode URLs do not accumulate.
24. As the App Owner, I want a newly saved Mark that does not advance the Series to leave the Series unchanged, so that equal or lower episodes do not replace the current episode.
25. As the App Owner, I want ambiguous Series matches to leave data unchanged, so that Bucmarc does not choose between multiple possible Series silently.
26. As the App Owner, I want a Series category to be assigned intentionally, so that matching a categorized Mark into an uncategorized Series does not silently categorize the Series.
27. As the App Owner, I want a categorized Mark's category to be cleared when it becomes Series-owned, so that the URL does not appear as both a standalone Mark and a Series target.
28. As the App Owner, I want a titled Mark's title to be cleared when it becomes Series-owned, so that the Series title is the only user-facing title.
29. As the App Owner, I want editing a Series Pattern to require the current Mark to still match, so that a Series cannot point at a Mark outside its own definition.
30. As the App Owner, I want to unlink a current Mark from a Series, so that I can change a Series Pattern in ways that would no longer match the old current Mark.
31. As the App Owner, I want unlinking to keep both the Series and the Mark, so that correcting a Series definition does not destroy the saved URL.
32. As the App Owner, I want an unlinked Mark to copy the Series category, so that it remains filed where I had been seeing it.
33. As the App Owner, I want an unlinked Mark from an uncategorized Series to become uncategorized, so that Bucmarc does not invent a category.
34. As the App Owner, I do not want an unlinked Mark to copy the Series title, so that titles remain independently meaningful for standalone Marks and Series.
35. As a Viewer, I want shared categories to show the same combined saved items as the Private Management Area, so that a shared category does not expose implementation differences.
36. As a Viewer, I want a shared Series with a current Mark to open the current Mark URL, so that shared serial content remains usable.

## Implementation Decisions

- Add durable Series records separate from Marks.
- A Series has a required title, required Series Pattern, optional category, and optional current Mark.
- The Series-to-current-Mark relationship is optional on both sides and unique when present: one Series has zero or one current Mark, and one Mark belongs to zero or one Series.
- Marks continue to have titles and categories when standalone.
- When a Mark becomes the current Mark for a Series, clear the Mark title and category.
- When a Mark is linked to a Series, display and sharing use the Series title and category instead of Mark presentation fields.
- Category views should load a combined saved-item list containing standalone Marks and Series.
- Uncategorized views should load a combined saved-item list containing uncategorized standalone Marks and uncategorized Series.
- A Series with a current Mark renders as the Series title linked to the current Mark URL.
- A Series without a current Mark renders as a non-link saved item with management controls.
- Series Matching is enqueued after a new Mark is saved.
- The Capture Flow continues to immediately redirect to the saved URL after a successful save.
- Series Matching failure does not fail the capture save, change the redirect, or surface an error in the Capture Flow.
- Series Matching applies only to newly saved Marks.
- No retroactive matching is performed when creating or editing a Series.
- A Series Pattern is a regex matcher with exactly one named capture, `episode`.
- Series Pattern validation rejects zero named captures, more than one named capture, or any named capture that is not `episode`.
- Episode Identity is numeric only.
- Episode Identity is derived from the Series Pattern match, not from the visible title.
- Bucmarc does not generate titles from episode metadata.
- If a Series has a current Mark, editing the Series Pattern is valid only when the current Mark still matches and yields a numeric episode.
- Provide Series Unlinking so the App Owner can remove the current Mark before making incompatible Series Pattern changes.
- Series Unlinking keeps the Series and Mark.
- Series Unlinking copies the Series category to the Mark.
- If the Series has no category, Series Unlinking leaves the Mark uncategorized.
- Series Unlinking does not copy the Series title to the Mark.
- If one new Mark matches multiple Series, treat it as ambiguous, log where useful, and leave data unchanged.
- If a new Mark matches one Series with no current Mark, make it the current Mark and clear its Mark title and category.
- If a new Mark matches one Series with a current Mark, compare numeric episode identity.
- If the new episode is greater, point the Series at the new Mark, clear the new Mark title and category, and hard-delete the older current Mark.
- If the new episode is equal, lower, stale, invalid, or cannot be compared, leave data unchanged and log that the Mark matched the Series but did not advance it.
- Episode Replacement should not delete an older current Mark unless the new Mark has been safely saved and linked to the Series.
- Episode Replacement should update the Series link and hard-delete the older current Mark in one database transaction where practical.
- Series Matching and Episode Replacement processing should be idempotent enough that retries do not duplicate state changes or delete the wrong Mark.
- Existing duplicate URL handling remains unchanged.
- Existing Category, Shared Category, Share-Only Category, and Token-Manageable Category semantics remain unchanged except that shared views display Series as saved items.
- The glossary in `CONTEXT.md` is the canonical source for active domain terms.

## Testing Decisions

- Good tests should observe external behavior: persisted Series, persisted Marks, capture redirects, category lists, shared views, and replacement outcomes.
- Tests should avoid asserting private queue implementation details.
- The highest-value seam is the Capture Flow: saving a Mark still redirects to the saved URL while Series Matching is deferred.
- The Series persistence seam should verify Series can exist with title and pattern, with or without category, and with or without a current Mark.
- The Mark persistence seam should verify standalone Marks retain title/category and Series-owned Marks have title/category cleared.
- The matching processor seam should verify a newly saved matching Mark can become the current Mark for an empty Series.
- The matching processor seam should verify a newer episode replaces the old current Mark and hard-deletes the old Mark.
- The matching processor seam should verify equal, lower, stale, invalid, and ambiguous matches leave data unchanged.
- The matching processor seam should verify replacement is retryable/idempotent enough to avoid deleting the wrong Mark.
- The Series Pattern validation seam should verify exactly one named `episode` capture is required.
- The Series edit seam should verify a pattern change is rejected when the current Mark would no longer match.
- The Series Unlinking seam should verify unlinking preserves both records, copies category when present, leaves the Mark uncategorized when no Series category exists, and does not copy title.
- The Private Management Area seam should verify categories display combined saved items, not separate Mark and Series sections.
- The Shared View seam should verify shared categories display the same combined saved items.
- Manual testing should verify a Series with no current Mark is visible and non-linking.
- Manual testing should verify a Series with a current Mark links to the current Mark URL.
- Manual testing should verify standalone random URLs can still have Mark titles.
- Manual testing should verify a matched Mark's title/category are cleared.
- Manual testing should verify missing Mark titles still display with the existing URL fallback while standalone.
- Run the existing build or typecheck command after implementation.

## Out of Scope

- Bulk retroactive matching of existing Marks.
- Importing existing Marks into Series automatically.
- Non-numeric episode identity.
- Multiple episode capture fields.
- Named captures other than `episode`.
- Cross-site Series merging.
- Metadata scraping from remote pages.
- Capture Flow UI changes.
- Capture Flow error reporting for matching failures.
- A user-facing job status dashboard.
- Restoring a cleared Mark title after Series Unlinking.
- Auto-inheriting a Series category from a matched Mark.

## Archived Context

- The old mark-owned episodic model is archived at `.scratch/series/PRD.old-episodic-mark-model.md`.
- The old discovery handoff is archived at `.scratch/series/HANDOFF.old-episodic-mark-model.md`.
- Those archived documents are historical only. Implement the first-class Series model described in this PRD.
