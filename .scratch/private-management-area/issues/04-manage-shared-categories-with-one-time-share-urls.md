Status: ready-for-agent

# Manage Shared Categories With One-Time Share URLs

## Parent

.scratch/private-management-area/PRD.md

## What to build

Add form-driven sharing controls for Categories in the Private Management Area. The App Owner should be able to enable, rotate, and disable sharing for a Category. Enabling or rotating sharing should show the resulting share URL immediately, but Bucmarc should not reconstruct old raw Share Tokens later.

Sharing remains at the Category boundary. Empty Categories may be Shared Categories, and Uncategorized Marks must not be directly shareable.

## Acceptance criteria

- [ ] The App Owner can enable sharing for a Category through a form.
- [ ] Enabling sharing shows a one-time share URL.
- [ ] The App Owner can rotate sharing for a Category through a form.
- [ ] Rotating sharing shows a new one-time share URL.
- [ ] The App Owner can disable sharing for a Category through a form.
- [ ] After the immediate enable or rotate response has passed, the UI shows only that sharing is enabled plus rotate and disable actions.
- [ ] Bucmarc does not reconstruct and display old raw Share Tokens.
- [ ] Empty Categories can be Shared Categories.
- [ ] Uncategorized Marks cannot be shared directly.
- [ ] Disabling sharing removes public access to the Shared View.
- [ ] The Shared View remains public while the Private Management Area remains protected.

## Blocked by

- .scratch/private-management-area/issues/03-enforce-unique-category-names-in-forms.md
