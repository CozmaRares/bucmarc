# Use First-Class Series for Serial Content

Bucmarc needs to manage serial saved URLs, such as web serial episodes, comics, manga, anime, and similar content, without accumulating stale episode marks that the App Owner must clean up manually.

Serial works need stable identity, title, category, display, and sharing behavior even when the current episode URL changes. Bucmarc will represent that stable identity with durable Series records, not with metadata stored on the current Mark.

A Series is a saved item separate from Mark. It has a required title, required Series Pattern, optional category, and optional current Mark. A Mark may stand alone with its own title and category, or it may become the current Mark for one Series. When a Mark belongs to a Series, its Mark title and Mark category are cleared; display, organization, and sharing come from the Series.

Series Matching runs after a new Mark is saved. The Capture Flow still saves the Mark and redirects immediately to the saved URL. If the new Mark matches exactly one Series and has a greater numeric episode identity than the Series current Mark, Episode Replacement points the Series at the new Mark and hard-deletes the older current Mark. Matching failures, ambiguous matches, equal/lower episodes, invalid patterns, and stale comparisons leave data unchanged.

**Considered Options**

- Store series state on the current Mark and carry it forward during replacement.
- Add first-class durable Series records with optional current Marks.
- Hide or archive older episode Marks instead of hard-deleting them.
- Retroactively match existing Marks when a Series is created or edited.
- Support richer pattern templates and user-authored replacement rules in the first version.

**Consequences**

Series have stable identity even when they do not currently point at a URL. This lets the App Owner create, categorize, share, and edit serial works independently of any specific episode Mark.

Categories and shared views must treat standalone Marks and Series as a combined list of saved items. A Series category controls where its current Mark appears for display and sharing.

Series Matching and Episode Replacement are eventually consistent background work. The implementation must be retryable and idempotent enough that a failed or repeated match job does not delete the wrong Mark or leave half-applied replacement state.

Creating or editing a Series does not retroactively reorganize existing Marks. This avoids surprising bulk changes and keeps the first version focused on newly saved Marks.

The initial Series Pattern model is intentionally narrow: one regex named capture, `episode`, with a numeric value. Richer template systems, multiple captures, non-numeric episode identities, and user-authored replacement rules can be reconsidered later without changing the core decision that Series are first-class saved items.
