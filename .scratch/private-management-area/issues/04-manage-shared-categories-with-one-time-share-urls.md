Status: done

# Manage Shared Categories With One-Time Share URLs

## Parent

.scratch/private-management-area/PRD.md

## What to build

Add form-driven sharing controls for Categories in the Private Management Area. The App Owner should be able to enable or refresh sharing for a Category, disable sharing, make a Shared Category Token-Manageable, and make a Shared Category Share-Only. Enabling or refreshing sharing should show the resulting share URL immediately, but Bucmarc should not reconstruct old raw Share Tokens later.

Sharing remains at the Category boundary. Empty Categories may be Shared Categories, and Uncategorized Marks must not be directly shareable.

Share-Only Categories and their assigned Marks should be hidden from the regular Private Management Area and from regular Mark Category selectors, while remaining available through the Shared View. Anyone holding the Share Token can turn Share-Only off from the Shared View.

Token-Manageable Categories let Share Token holders create Marks in that Category, edit or clear Mark Titles in that Category, and hard-delete Marks in that Category. Share Token holders cannot edit Mark URLs, move Marks between Categories, change Category settings, refresh or disable sharing, or change Token-Manageable settings.

If there already are endpoints for json validation, but the flow is form-driven, change that endpoint instead of creating a new one.

## Acceptance criteria

- [x] The App Owner can enable sharing for a Category through a form.
- [x] Enabling sharing shows a one-time share URL.
- [x] Enabling sharing for an already Shared Category refreshes the Share Token and invalidates the previous Share Token.
- [x] Refreshing sharing reuses the enable-sharing endpoint and product action rather than adding a separate rotate endpoint.
- [x] The enable sharing button displays "Rotate Token" when sharing is already enabled.
- [x] Refreshing sharing shows a new one-time share URL.
- [x] The App Owner can disable sharing for a Category through a form.
- [x] After the immediate enable or refresh response has passed, the UI shows only that sharing is enabled plus refresh, disable, Token-Manageable, and Share-Only controls.
- [x] Bucmarc does not reconstruct and display old raw Share Tokens.
- [x] Empty Categories can be Shared Categories.
- [x] Uncategorized Marks cannot be shared directly.
- [x] Disabling sharing removes public access to the Shared View.
- [x] The Shared View remains public while the Private Management Area remains protected.
- [x] Ordinary Shared Categories remain read-only for Share Token holders.
- [x] The App Owner can enable and disable Token-Manageable for a Shared Category from the Private Management Area.
- [x] Token-Manageable is opt-in and disabled by default.
- [x] A Share Token holder for a Token-Manageable Category can create a Mark directly in that Category through `/share/:token/mark/save`.
- [x] The Shared View does not show a top-of-page create Mark form.
- [x] Token-created Mark URLs are rejected when the URL already exists anywhere in Bucmarc.
- [x] A Share Token holder for a Token-Manageable Category can edit and clear Mark Titles in that Category.
- [x] A Share Token holder for a Token-Manageable Category can hard-delete Marks in that Category.
- [x] A Share Token holder cannot edit Mark URLs.
- [x] A Share Token holder cannot move Marks to another Category or to Uncategorized Marks.
- [x] A Share Token holder cannot create, rename, or delete Categories.
- [x] A Share Token holder cannot refresh sharing, disable sharing, enable Token-Manageable, or disable Token-Manageable.
- [x] The App Owner can make a Shared Category Share-Only from the regular Private Management Area.
- [x] Non-shared Categories cannot be made Share-Only.
- [x] Share-Only Categories and their Marks are hidden from the regular Private Management Area.
- [x] Share-Only Categories are absent from regular Mark Category selectors.
- [x] Share-Only Categories remain accessible through their Shared View.
- [x] A Share Token holder can turn Share-Only off from the Shared View.
- [x] A Share Token holder cannot turn Share-Only on from the Shared View.
- [x] Disabling sharing clears Share-Only and Token-Manageable state.

## Blocked by

None - can start immediately

## Comments

### Triage - 2026-06-12

This is not currently ready for an AFK agent.

It is mechanically blocked by Category form management in `.scratch/private-management-area/issues/03-enforce-unique-category-names-in-forms.md`.

### Maintainer Decision - 2026-06-15

The issue now follows the refreshed PRD language: enabling an already Shared Category refreshes the Share Token, Share-Only and Token-Manageable are separate concepts, and the old blocker has been completed.
