Status: ready-for-agent

# Leave Failed, Ambiguous, and Non-Advancing Matches Unchanged

## Parent

.scratch/series/PRD.md

## What to build

Make Series Matching failure safe by leaving data unchanged when a newly saved Mark cannot be assigned to one advancing Series. This includes zero matches, multiple matching Series, invalid Episode Identity, equal episodes, lower episodes, stale matches, and other non-advancing outcomes.

Where useful, log ambiguous and non-advancing matches, but do not surface Series Matching failures in the Capture Flow.

## Acceptance criteria

- [ ] A newly saved Mark that matches zero Series remains standalone.
- [ ] A newly saved Mark that matches multiple Series remains standalone.
- [ ] A newly saved Mark with invalid or non-numeric Episode Identity remains standalone.
- [ ] A newly saved Mark with an equal Episode Identity does not replace the current Mark.
- [ ] A newly saved Mark with a lower Episode Identity does not replace the current Mark.
- [ ] Stale or otherwise non-advancing matches leave the Series and existing current Mark unchanged.
- [ ] Failed Series Matching does not fail the Mark save.
- [ ] Failed Series Matching does not change the Capture Flow redirect.
- [ ] Ambiguous and non-advancing outcomes are logged where useful.
- [ ] Tests or manual verification cover zero-match, ambiguous, invalid, equal, and lower-episode outcomes.

## Blocked by

- .scratch/series/issues/03-link-first-matching-captured-mark-to-empty-series.md
- .scratch/series/issues/04-replace-current-mark-when-episode-advances.md
