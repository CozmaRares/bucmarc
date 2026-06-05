Status: ready-for-agent

# Enable Read-Only Shared Categories

## Parent

.scratch/backend-validation-categories-share/PRD.md

## What to build

Enable shared categories by giving each category the option to have one active share token. A viewer with the share token should be able to open a shared view without Clerk authentication and see only the marks currently in that shared category. Shared access must be read-only.

Category sharing should be controlled from authenticated JSON APIs. Enabling sharing should produce a share URL, rotating sharing should invalidate the previous token, and disabling sharing should remove public access for that category.

## Acceptance criteria

- [ ] A category starts without public shared access.
- [ ] Authenticated API access can enable sharing for a category and receive a share URL.
- [ ] Authenticated API access can disable sharing for a category.
- [ ] Authenticated API access can rotate a category share token and receive a new share URL.
- [ ] Each category has at most one active share token.
- [ ] Rotating a share token invalidates the previous token.
- [ ] Disabling sharing invalidates the current token.
- [ ] The raw share token is not stored for later display.
- [ ] A viewer can open `/share/:token` without Clerk authentication.
- [ ] A valid share token shows only marks from that shared category.
- [ ] An invalid, disabled, or rotated-away share token does not expose marks.
- [ ] The shared view is read-only and does not allow creating, updating, moving, or deleting marks or categories.
- [ ] Other private management routes remain Clerk-protected while the shared view remains publicly accessible.
- [ ] Manual verification covers enabling, disabling, rotating, incognito access, invalid tokens, category filtering, and read-only behavior.

## Blocked by

- .scratch/backend-validation-categories-share/issues/02-add-category-records-and-mark-assignment.md
