# Bucmarc

Bucmarc is a personal mark manager for saving web URLs, organizing them into categories, and sharing selected categories through token-bearing links.

## Language

**Mark**:
A saved web URL in Bucmarc. A mark may have optional descriptive metadata and may belong to one category.
_Avoid_: Bookmark, link, favorite

**Episodic Mark**:
A mark that carries episode identity and a series pattern so Bucmarc can replace it when a newer episode mark in the same series is saved.
_Avoid_: Serialized mark, tracked mark, episode bookmark

**Title**:
Optional descriptive text for a mark.
_Avoid_: Name, label, caption

**Category**:
A uniquely named group that can contain marks. A mark can belong to at most one category.
_Avoid_: Folder, collection, tag

**Series**:
A site-local sequence-like work represented by its current tracked mark, where newer episode marks may replace older episode marks. The same work on different sites belongs to separate series.
_Avoid_: Group, collection, pattern group

**Pattern Template**:
A reusable user-defined site-level pattern that describes which values Bucmarc can extract for episodic marks on that site. Pattern templates map captured URL parts to named params such as title, hash, or episode.
_Avoid_: Site rule, parser, matcher

**Series Pattern**:
The matching rule Bucmarc carries on an episodic mark to derive episode identity for marks in the same series. A series pattern includes any site-specific values needed to recognize that series.
_Avoid_: Mark pattern, title pattern, URL rule

**Replacement Rule**:
The comparison Bucmarc uses to decide whether a matched mark should replace the current episodic mark in a series.
_Avoid_: Deduplication rule, cleanup rule, stale check

**Episode**:
A comparable part of a series represented by a mark, such as a chapter, issue, or video episode.
_Avoid_: Chapter, installment, part

**Episode Identity**:
The system-managed episode value Bucmarc derives for an episodic mark. Episode identity is independent of a mark's title and is carried forward by the series pattern when a newer episode mark replaces an older one.
_Avoid_: Title semantics, parsed title, visible metadata

**Replaced Episode Mark**:
An older episode mark that is hard-deleted after Bucmarc saves a newer episode mark in the same series.
_Avoid_: Archived mark, hidden mark, stale mark

**Episode Replacement**:
The eventually consistent process where Bucmarc turns a newly saved mark into an episodic mark and hard-deletes the older episodic mark it replaces.
_Avoid_: Archiving, hiding, deduplication

**Uncategorized Mark**:
A mark that does not belong to any category.
_Avoid_: Default category, orphan mark

**Shared Category**:
A category that can be viewed outside the private management area by using its share token.
_Avoid_: Protected category, public category

**Share-Only Category**:
A shared category that is hidden from the regular private management area together with its assigned marks. It remains available through its shared view.
_Avoid_: Token-gated category, hidden category

**Token-Manageable Category**:
A shared category whose share token allows viewers to modify marks in that category.
_Avoid_: Writable shared category, editable public category

**Share Token**:
A bearer secret that grants access to one shared category.
_Avoid_: Access token, password, invite

**Private Management Area**:
The authenticated part of Bucmarc where marks, categories, and sharing settings are managed.
_Avoid_: Admin panel, dashboard, backend

**Capture Flow**:
The lightweight path where the App Owner saves a mark from outside Bucmarc and, when successful, continues to the saved URL. This flow is defined only for the `/api/mark/save/:url` endpoint.
_Avoid_: Add flow, bookmarklet flow, import flow

**Shared View**:
The view of a shared category available to someone with its share token.
_Avoid_: Public page, guest view

**App Owner**:
The person who manages Bucmarc and controls marks, categories, and sharing settings.
_Avoid_: User, admin, account

**Viewer**:
Someone who can open a shared view with a share token but cannot change marks or categories.
_Avoid_: Guest, public user, recipient
