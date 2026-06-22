# Bucmarc

Bucmarc is a personal mark manager for saving web URLs, organizing them into categories, and sharing selected categories through token-bearing links.

## Language

**Mark**:
A saved web URL in Bucmarc. A mark may have a title and belong to one category when it stands on its own outside a series. When a mark belongs to a series, its standalone title and category are cleared; the series category takes over for display and sharing.
_Avoid_: Bookmark, link, favorite

**Title**:
User-facing descriptive text for a standalone mark or series. A mark title applies only while the mark stands on its own outside a series.
_Avoid_: Name, label, caption

**Category**:
A uniquely named group that can contain standalone marks and series as a combined list of saved items.
_Avoid_: Folder, collection, tag

**Series**:
A user-facing sequence-like saved item with a required title, required series pattern, and optional category. A series may point at a current mark as its target URL while remaining separate from that mark. A series may exist without a current mark, and a mark may exist without belonging to a series. A series category is assigned intentionally and is not inferred from a matched mark. A series remains visible even when it has no current mark.
_Avoid_: Group, collection, pattern group

**Series Unlinking**:
The deliberate action of removing the current mark from a series while keeping both the series and mark. Series unlinking lets the App Owner change a series pattern when the current mark would no longer match it. When a mark is unlinked from a series, the mark becomes standalone and copies the series category, but not the series title.
_Avoid_: Detach, remove from series, reset series

**Series Matching**:
The process Bucmarc uses after a new mark is saved to decide whether that mark should belong to a series. Series matching does not retroactively change existing marks unless the App Owner explicitly asks for that. If series matching cannot assign a new mark to a series, the mark remains unchanged. When a matched series already has a current mark, series matching uses episode identity to decide whether the new mark should become the series current mark. A matched mark that does not advance the series leaves the series unchanged.
_Avoid_: Backfill, import matching, auto-categorization

**Series Pattern**:
The regex matching rule a series uses to recognize mark URLs and derive episode identity. A series pattern has exactly one named capture, `episode`, and no other named captures. The captured episode value must be numeric. When a series has a current mark, its series pattern must match that mark.
_Avoid_: Mark pattern, title pattern, URL rule

**Episode**:
A comparable part of a series represented by a mark, such as a chapter, issue, or video episode.
_Avoid_: Chapter, installment, part

**Episode Identity**:
The system-managed numeric episode value Bucmarc derives for a matched mark. Episode identity is independent of title and determines whether a matched mark becomes the current mark for a series.
_Avoid_: Title semantics, parsed title, visible metadata

**Episode Replacement**:
The eventually consistent process where Bucmarc points a series at a newer current mark and hard-deletes the older current mark it replaces. Episode replacement uses a fixed comparison: the new mark's numeric episode identity must be greater than the current mark's numeric episode identity.
_Avoid_: Archiving, hiding, deduplication

**Uncategorized Saved Item**:
A standalone mark or series that does not belong to any category.
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
