# Bucmarc

Bucmarc is a personal mark manager for saving web URLs, organizing them into categories, and sharing selected categories through token-bearing links.

## Language

**Mark**:
A saved web URL in Bucmarc. A mark may have optional descriptive metadata and may belong to one category.
_Avoid_: Bookmark, link, favorite

**Title**:
Optional descriptive text for a mark.
_Avoid_: Name, label, caption

**Category**:
A named group that can contain marks. A mark can belong to at most one category.
_Avoid_: Folder, collection, tag

**Uncategorized Mark**:
A mark that does not belong to any category.
_Avoid_: Default category, orphan mark

**Shared Category**:
A category that can be viewed outside the private management area by using its share token.
_Avoid_: Protected category, public category

**Share Token**:
A bearer secret that grants read-only access to one shared category.
_Avoid_: Access token, password, invite

**Private Management Area**:
The authenticated part of Bucmarc where marks, categories, and sharing settings are managed.
_Avoid_: Admin panel, dashboard, backend

**Shared View**:
The read-only view of a shared category available to someone with its share token.
_Avoid_: Public page, guest view

**App Owner**:
The person who manages Bucmarc and controls marks, categories, and sharing settings.
_Avoid_: User, admin, account

**Viewer**:
Someone who can open a shared view with a share token but cannot change marks or categories.
_Avoid_: Guest, public user, recipient
