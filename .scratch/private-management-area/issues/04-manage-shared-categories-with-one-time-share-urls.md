Status: needs-info

# Manage Shared Categories With One-Time Share URLs

## Parent

.scratch/private-management-area/PRD.md

## What to build

Add form-driven sharing controls for Categories in the Private Management Area. The App Owner should be able to enable, rotate, and disable sharing for a Category. Enabling or rotating sharing should show the resulting share URL immediately, but Bucmarc should not reconstruct old raw Share Tokens later.

Sharing remains at the Category boundary. Empty Categories may be Shared Categories, and Uncategorized Marks must not be directly shareable.

If there already are endpoints for json validation, but the flow is form-driven, change that endpoint instead of creating a new one.

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

## Comments

### Triage - 2026-06-12

This is not currently ready for an AFK agent.

It is mechanically blocked by Category form management in `.scratch/private-management-area/issues/03-enforce-unique-category-names-in-forms.md`.

It also needs a maintainer decision before implementation because the acceptance criteria call for separate enable, rotate, and disable sharing controls, while `.scratch/qa/neverthrow-app-logic/REPORT.md` records the later resolved behavior that Bucmarc does not expose a separate rotate endpoint and that enabling a Shared Category also refreshes the Share Token. Pick one product contract, then update this issue's acceptance criteria before moving it back to `ready-for-agent`.
