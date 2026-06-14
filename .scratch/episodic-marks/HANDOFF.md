# Episodic Marks Handoff

## Purpose

Continue discovery and design for grouping serial media episode marks so Bucmarc keeps the latest episode mark and removes the older one.

The domain glossary has already been updated in `CONTEXT.md`. A foundation PRD exists at `.scratch/episodic-marks/PRD.md`. Do not duplicate or rename those terms without first checking the glossary and PRD.

## Suggested Skills

- `grill-with-docs`: continue the domain/design interview and update `CONTEXT.md` or ADRs as decisions settle.
- `to-prd`: use only for a follow-up PRD after the remaining Pattern Template and Replacement Rule questions are resolved.
- `to-issues`: after a PRD exists, break implementation into independently shippable issues.

## Settled Decisions

- Use **Episodic Mark** as the canonical term for a mark that participates in episode replacement.
- A **Series** is site-local. The same media work on different sites should be treated as separate series.
- A series is represented by its current episodic mark. There is no durable standalone series catalog after all marks for that series are gone.
- Episode replacement hard-deletes the older episode mark.
- Episode replacement is eventually consistent. The capture flow should save and redirect quickly, while matching/replacement happens in the background.
- During replacement, Bucmarc copies applicable predecessor metadata to the new mark before deleting the predecessor.
- Category is copied as-is during replacement.
- Title may be copied where applicable, but Bucmarc should not generate a title when missing. Existing display behavior should remain: show the URL when title is absent.
- Episode semantics should not depend on parsing the user-visible title after save.
- The episode value should be stored as system-managed metadata on the episodic mark.
- Dynamic site-specific values are encoded in the series pattern itself, not stored as separate free-floating metadata.

## Current Design Direction

The user wants user-defined regex-like site templates. Example shape:

```text
site.com/<title>/episode-(regex)-(regex)
regex 1 = hash
regex 2 = episode
```

The user wants to map regex captures to named params, such as `title`, `hash`, and `episode`.

The likely concept split is:

- **Pattern Template**: reusable user-defined site-level extraction template.
- **Series Pattern**: concrete pattern carried by an episodic mark, including series-specific values needed to recognize the same series later.
- **Replacement Rule**: comparison logic that determines whether a matched candidate replaces the current episodic mark.

Examples raised:

- `<episode> greater`
- `<hash> different AND <episode> greater`

## Open Questions

Resume here:

Should each mapped param be classified by role?

Candidate roles:

- `series identity`: values that identify the same series, such as `title` or slug.
- `episode value`: the comparable progression value, usually `episode`.
- `replacement condition value`: values used by the replacement rule, such as `hash`.

The key unresolved distinction: a template can extract many params, but not every extracted param identifies the series. `episode` should not identify the series. `hash` may or may not identify the series depending on the site.

Other unresolved questions:

- What minimal replacement-rule expression language is acceptable for v1?
- Should replacement rules be constrained structured comparisons, or should the user write free-form comparison expressions using mapped params?
- What param types are needed initially: text, integer, decimal, semantic version, season/episode composite?
- How should Bucmarc handle a candidate that matches a series pattern but has an equal or lower episode value?
- What should happen if the background replacement job fails after the new mark is saved?
- How should the management UI let the app owner create an episodic mark from an existing normal mark?
- Should shared/token-manageable mark creation also enqueue episode replacement, or only the private capture flow?

## Relevant Code Context

- Current mark schema is in `src/db/schema.ts`.
- Current mark save/update/delete data access is in `src/db/index.ts`.
- Private mark API routes are in `src/routers/api/mark.ts`.
- Shared category mark routes are in `src/routers/share.ts`.
- The capture flow is `/api/mark/save/:url`; it currently saves and redirects.
- `CONTEXT.md` contains the current glossary terms and should be read before continuing.

## ADR Guidance

Consider an ADR only after the background processing and pattern/template model are chosen. It may be justified because:

- putting replacement behind a background queue affects user-visible consistency,
- storing series state on the current episodic mark instead of a standalone series catalog is surprising,
- the regex-template model has meaningful alternatives.

Do not create an ADR yet unless those trade-offs are explicitly resolved.
