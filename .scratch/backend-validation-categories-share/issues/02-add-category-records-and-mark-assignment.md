Status: ready-for-agent

# Add Category Records and Mark Assignment

## Parent

.scratch/backend-validation-categories-share/PRD.md

## What to build

Add category support to Bucmarc so marks can be organized without making category selection required during save. Categories should be managed from the private management area through authenticated JSON APIs, and each mark should be assignable to one category or left uncategorized.

This slice should also add optional mark titles. Deleting a category should not delete marks; affected marks should become uncategorized.

## Acceptance criteria

- [ ] Categories can be created from an authenticated JSON API.
- [ ] Categories can be listed from an authenticated JSON API.
- [ ] Categories can be renamed from an authenticated JSON API.
- [ ] Categories can be deleted from an authenticated JSON API.
- [ ] Marks can have an optional title.
- [ ] Marks can belong to one category.
- [ ] Marks can be left uncategorized.
- [ ] Existing mark saves still work without providing a title or category.
- [ ] A mark can be assigned to a category through an authenticated JSON API using a request body that includes the mark URL and category ID.
- [ ] A mark can be moved back to uncategorized through the same authenticated assignment flow.
- [ ] Deleting a category sets affected marks back to uncategorized.
- [ ] Category management and mark assignment remain unavailable without Clerk authentication.
- [ ] The homepage may continue listing all marks without category controls.
- [ ] Manual verification covers category create, list, rename, delete, mark assignment, and uncategorized behavior.

## Blocked by

None - can start immediately
