Status: ready-for-agent

# Enforce Unique Category Names In Forms

## Parent

.scratch/private-management-area/PRD.md

## What to build

Add form-driven Category management to the Private Management Area. The App Owner should be able to create, rename, and delete Categories. Category names must be unique after trimming whitespace and comparing case-insensitively, while preserving the entered display casing for valid names.

Deleting a Category must preserve its Marks by returning them to Uncategorized Marks.

## Acceptance criteria

- [ ] The App Owner can create a Category through a form.
- [ ] The App Owner can rename a Category through a form.
- [ ] The App Owner can delete a Category through a form.
- [ ] Deleting a Category moves its Marks to Uncategorized Marks instead of deleting them.
- [ ] Category creation rejects names that duplicate an existing Category after trimming whitespace.
- [ ] Category creation rejects names that duplicate an existing Category case-insensitively.
- [ ] Category rename rejects names that duplicate another Category after trimming whitespace.
- [ ] Category rename rejects names that duplicate another Category case-insensitively.
- [ ] Valid Category names preserve the entered display casing.
- [ ] Validation failures redirect back to the Private Management Area with a clear status message.
- [ ] Category forms use Category identifiers internally rather than relying on names as identifiers.

## Blocked by

None - can start immediately
