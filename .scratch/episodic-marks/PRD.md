Status: ready-for-agent

# PRD: Episodic Mark Replacement Foundation

## Problem Statement

Bucmarc is frequently used to manage serial media from multiple sites, such as web serials, comics, manga, anime, and similar episodic content. Today, saving each new episode creates another ordinary Mark. The App Owner must manually find and delete older episode Marks from the same Series, and must also manually preserve useful metadata such as Category and Title.

The Capture Flow should stay fast. Saving a Mark from outside Bucmarc should continue to redirect to the saved URL as quickly as possible. Episode matching and cleanup can happen behind the scenes after the save has completed.

## Solution

Add the foundation for Episodic Marks and eventually consistent Episode Replacement.

An Episodic Mark carries a Series Pattern and Episode Identity. When a newly saved Mark is later found to match an existing Episodic Mark in the same Series, Bucmarc can turn the new Mark into the current Episodic Mark, copy applicable predecessor metadata, and hard-delete the older Replaced Episode Mark.

For this PRD, the behavior is intentionally limited to the parts already settled:

- A Series is site-local.
- A Series is represented by its current Episodic Mark, not by a durable standalone series catalog.
- Episode Replacement hard-deletes the older Mark.
- Episode Replacement is eventually consistent and should not slow down successful Capture Flow redirects.
- Category is copied from the predecessor to the replacement Mark.
- Title may be copied where applicable, but Bucmarc should not generate a Title when one is missing.
- Missing Title display keeps the existing URL fallback.
- Episode semantics are stored as system-managed metadata and do not depend on reparsing the visible Title after save.

The detailed user-facing Pattern Template builder, param role classification, and Replacement Rule expression language remain open for later development.

## User Stories

1. As the App Owner, I want Bucmarc to understand Episodic Marks, so that serial media Marks can participate in Episode Replacement.
2. As the App Owner, I want a Series to be site-local, so that the same media work on different sites is not accidentally merged.
3. As the App Owner, I want a Series to be represented by the current Episodic Mark, so that I do not have to manage a separate durable Series catalog.
4. As the App Owner, I want an Episodic Mark to carry its Series Pattern, so that Bucmarc can recognize later Marks from the same Series.
5. As the App Owner, I want an Episodic Mark to carry its Episode Identity, so that Bucmarc can compare episode progression without relying on the visible Title.
6. As the App Owner, I want dynamic site-specific values to be encoded in the Series Pattern, so that the Episodic Mark has the information needed to recognize the Series later.
7. As the App Owner, I want a newly saved replacement Mark to inherit the predecessor's Series Pattern, so that future replacements can continue from the latest Mark.
8. As the App Owner, I want a newly saved replacement Mark to inherit the predecessor's Category, so that new episodes stay organized where the older episode was organized.
9. As the App Owner, I want a newly saved replacement Mark to keep its captured Title when it has one, so that useful captured page text is preserved.
10. As the App Owner, I want Title copying only where applicable, so that Bucmarc does not blindly apply misleading episode-specific Titles.
11. As the App Owner, I want Bucmarc not to generate Titles for missing Titles, so that the existing URL fallback remains the simple display behavior.
12. As the App Owner, I want a Mark with no Title to keep displaying its URL, so that every Mark remains identifiable.
13. As the App Owner, I want Episode Replacement to hard-delete the older episode Mark, so that only the latest episode remains in normal Bucmarc views after cleanup.
14. As the App Owner, I want Episode Replacement to remove the older Mark from any Shared Category view, so that shared views reflect the same hard-delete behavior as the Private Management Area.
15. As the App Owner, I want the Capture Flow to save and redirect before Episode Replacement work runs, so that saving an episode does not feel slower.
16. As the App Owner, I want Episode Replacement to be eventually consistent, so that brief temporary duplication is acceptable while background cleanup runs.
17. As the App Owner, I want both the old and new Marks to be allowed to appear briefly before cleanup, so that fast capture is prioritized over immediate visual consistency.
18. As the App Owner, I want replacement work to be retryable, so that a transient failure does not permanently lose the chance to clean up older episode Marks.
19. As the App Owner, I want replacement work to avoid deleting an older Mark unless the new Mark has been safely saved, so that a failed save cannot remove existing data.
20. As the App Owner, I want predecessor metadata copied before the predecessor is deleted, so that the replacement Mark does not lose Category, Series Pattern, or applicable Title.
21. As the App Owner, I want predecessor metadata transfer and old-Mark deletion to be atomic where practical, so that Bucmarc does not end with a half-replaced Series.
22. As the App Owner, I want manually deleted Episodic Marks to remove their Series tracking state with them, so that a Series lives only as long as its current Mark exists.
23. As the App Owner, I want ordinary Marks to remain supported, so that non-serial URLs are not forced into episodic behavior.
24. As the App Owner, I want an ordinary Mark to remain ordinary unless it is identified as an Episodic Mark by settled episodic behavior, so that unrelated Marks are not unexpectedly deleted.
25. As the App Owner, I want duplicate URL handling to keep working, so that existing Mark uniqueness remains intact.
26. As the App Owner, I want existing Category behavior to keep working, so that Episode Replacement does not change how Categories are created, renamed, deleted, shared, or made Share-Only.
27. As the App Owner, I want existing Shared Category behavior to keep working, so that Episode Replacement only changes which Marks exist after cleanup.
28. As the App Owner, I want existing Token-Manageable behavior to keep working, so that shared mark creation and title updates are not accidentally broadened by episodic metadata.
29. As the App Owner, I want the implementation to use Bucmarc's glossary terms, so that future code and issues distinguish Marks, Episodic Marks, Series, Series Patterns, Episode Identity, and Episode Replacement clearly.
30. As a future implementing agent, I want unresolved Pattern Template and Replacement Rule questions documented as out of scope, so that this foundation can be implemented without pretending those decisions are finished.

## Implementation Decisions

- Add persistent system-managed metadata that can distinguish ordinary Marks from Episodic Marks.
- Store the current Episodic Mark's Series Pattern with the Mark-level episodic metadata.
- Store the current Episodic Mark's Episode Identity with the Mark-level episodic metadata.
- Do not add a durable standalone Series catalog in this PRD.
- Treat a Series as gone when its current Episodic Mark is deleted and no replacement has taken over its episodic metadata.
- Keep Mark URL uniqueness unchanged.
- Keep Title as optional user-visible descriptive text.
- Do not make the visible Title the canonical source of Episode Identity.
- Keep existing URL fallback display for Marks without Titles.
- During Episode Replacement, copy Category from the predecessor to the replacement Mark.
- During Episode Replacement, carry forward the Series Pattern from the predecessor to the replacement Mark.
- During Episode Replacement, derive and store the replacement Mark's Episode Identity using the predecessor's Series Pattern and the later settled matching behavior.
- During Episode Replacement, copy Title only where applicable. The safe default is to preserve a captured Title on the replacement Mark and avoid generating a Title when none exists.
- Hard-delete the Replaced Episode Mark after the replacement Mark has the required episodic metadata.
- Perform metadata transfer and hard deletion in one database transaction where practical.
- Enqueue or otherwise defer Episode Replacement work from the Capture Flow so that successful capture can redirect quickly.
- Preserve the existing Capture Flow contract: successful capture saves the Mark and redirects to the saved URL.
- Accept eventual consistency: the older and newer episode Marks may both appear until replacement work completes.
- Make replacement processing idempotent enough that retries do not duplicate metadata transfer or delete the wrong Mark.
- Record enough replacement job state to retry or inspect failed replacement work, but do not expose that state as a user-facing domain concept.
- Do not add Pattern Template management UI in this PRD.
- Do not finalize the Replacement Rule expression language in this PRD.
- Do not implement cross-site Series merging in this PRD.
- Continue respecting the single-user architecture described by the existing ADR.
- Continue respecting Category-scoped sharing behavior described by the existing ADR.
- The likely future modules are mark persistence, episodic metadata persistence, capture save orchestration, background replacement processing, and private management display/editing for episodic state.

## Testing Decisions

- Manual testing with agent revalidation is acceptable for this repo unless the implementing agent adds automated tests for confidence.
- Good tests should observe external behavior: saved Marks, redirects, visible Mark lists, shared views, and persisted metadata outcomes.
- Tests should avoid asserting helper function names, private queue internals, or table field names.
- The highest-value seam is the Capture Flow: saving a Mark should still redirect quickly to the saved URL before replacement cleanup is externally required.
- The next seam is the replacement processor boundary: given an existing Episodic Mark and a newly saved matching Mark, replacement processing should copy metadata and hard-delete the predecessor.
- The persistence seam should verify ordinary Marks and Episodic Marks can coexist.
- The persistence seam should verify deleting the current Episodic Mark removes its episodic tracking state.
- The Private Management Area seam should verify replacement results are visible as ordinary Mark list changes: latest Mark remains, predecessor disappears.
- The Shared View seam should verify a Replaced Episode Mark disappears from a Shared Category after hard deletion.
- Manually verify that a successful Capture Flow save redirects to the saved URL without waiting for replacement cleanup.
- Manually verify that, before replacement processing completes, both predecessor and replacement Marks may be visible.
- Manually verify that, after replacement processing completes, only the replacement Mark remains.
- Manually verify that the replacement Mark inherits the predecessor Category.
- Manually verify that the replacement Mark carries forward the Series Pattern.
- Manually verify that the replacement Mark stores its own Episode Identity.
- Manually verify that missing replacement Title does not cause Bucmarc to generate a Title.
- Manually verify that a missing Title still displays as the URL.
- Manually verify that a captured replacement Title is preserved.
- Manually verify that an ordinary non-episodic Mark is not deleted by replacement processing.
- Manually verify that deleting an Episodic Mark removes the Series tracking state associated with it.
- Manually verify that duplicate URL save behavior remains unchanged.
- Manually verify that Category deletion behavior remains unchanged for Episodic Marks.
- Manually verify that Share-Only and Token-Manageable behavior remains unchanged except for the hard deletion of Replaced Episode Marks.
- Run the existing typecheck or build command after implementation.

## Out of Scope

- Final Pattern Template authoring UX.
- Final Pattern Template storage shape beyond what is needed to carry an existing Series Pattern on an Episodic Mark.
- Final regex template syntax.
- Final capture-to-param mapping rules.
- Param role classification, such as `series identity`, `episode value`, and `replacement condition value`.
- Final Replacement Rule expression language.
- User-provided comparison expressions.
- Rich param typing beyond the minimum needed by the foundation.
- Cross-site Series matching or merging.
- A durable standalone Series catalog.
- Title generation for Marks with missing Titles.
- Metadata scraping from remote pages.
- Bulk migration of existing Marks into Episodic Marks.
- Bulk cleanup of historical episode Marks.
- User-facing job status dashboards.
- Changing the existing Capture Flow redirect behavior.
- Changing existing Category, Shared Category, Share-Only Category, or Token-Manageable Category semantics.

## Further Notes

- The settled domain vocabulary is in `CONTEXT.md`.
- The discovery handoff is in `.scratch/episodic-marks/HANDOFF.md`.
- The most important unresolved design question is whether mapped Pattern Template params need explicit roles. Candidate roles are `series identity`, `episode value`, and `replacement condition value`.
- A future ADR may be warranted after the queue/background processing and pattern/template model are chosen. The ADR should wait until those trade-offs are fully resolved.
- The repository currently has no automated test suite configured. Current validation practice in existing PRDs is manual testing plus typecheck/build.
