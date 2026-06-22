Status: ready-for-agent

# Replace Current Mark When Episode Advances

## Parent

.scratch/series/PRD.md

## What to build

Implement Episode Replacement for a newly saved Mark that matches exactly one Series with a current Mark. If the new Mark's numeric Episode Identity is greater than the current Mark's numeric Episode Identity, point the Series at the new Mark, clear the new Mark Title and Category, and hard-delete the older current Mark.

Episode Replacement should avoid deleting the older current Mark unless the new Mark has been saved and linked to the Series. The link update and hard delete should happen in one database transaction where practical.

## Acceptance criteria

- [ ] A newly saved Mark that advances the Series becomes the Series current Mark.
- [ ] The previous current Mark is hard-deleted after successful replacement.
- [ ] The new current Mark has its Mark Title cleared.
- [ ] The new current Mark has its Mark Category cleared.
- [ ] The Series Title and Category remain unchanged during Episode Replacement.
- [ ] Episode Identity is derived from the Series Pattern match, not from visible Title text.
- [ ] Replacement does not delete the older current Mark if the new Mark cannot be linked.
- [ ] Replacement is idempotent enough that a retry does not delete the wrong Mark or duplicate state changes.
- [ ] Tests or manual verification cover replacing an older current Mark with a newer episode.

## Blocked by

- .scratch/series/issues/03-link-first-matching-captured-mark-to-empty-series.md
