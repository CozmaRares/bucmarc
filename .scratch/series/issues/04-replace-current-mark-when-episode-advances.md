Status: done

# Replace Current Mark When Episode Advances

## Parent

.scratch/series/PRD.md

## What to build

Implement Episode Replacement for a newly saved Mark that matches exactly one Series with a current Mark. If the new Mark's numeric Episode Identity is greater than the current Mark's numeric Episode Identity, point the Series at the new Mark, clear the new Mark Title and Category, and hard-delete the older current Mark.

Episode Replacement should avoid deleting the older current Mark unless the new Mark has been saved and linked to the Series. The link update and hard delete should happen in one database transaction where practical.

## Acceptance criteria

- [x] A newly saved Mark that advances the Series becomes the Series current Mark.
- [x] The previous current Mark is hard-deleted after successful replacement.
- [x] The new current Mark has its Mark Title cleared.
- [x] The new current Mark has its Mark Category cleared.
- [x] The Series Title and Category remain unchanged during Episode Replacement.
- [x] Episode Identity is derived from the Series Pattern match, not from visible Title text.
- [x] Replacement does not delete the older current Mark if the new Mark cannot be linked.
- [x] Replacement is idempotent enough that a retry does not delete the wrong Mark or duplicate state changes.
- [x] Tests or manual verification cover replacing an older current Mark with a newer episode.

## Blocked by

- .scratch/series/issues/03-link-first-matching-captured-mark-to-empty-series.md
