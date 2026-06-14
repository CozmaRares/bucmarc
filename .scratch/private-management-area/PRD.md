Status: ready-for-agent

# PRD: Form-Driven Private Management Area

## Problem Statement

Bucmarc now has backend validation, Categories, and Share Tokens, but the App Owner does not yet have a practical Private Management Area for organizing saved Marks, editing Titles, managing Categories, or controlling Shared Categories.

The Capture Flow should stay lightweight: the App Owner saves a Mark from outside Bucmarc and, on success, continues to the saved URL. The Private Management Area should therefore optimize for periodic cleanup, curation, and sharing maintenance rather than becoming part of every save.

## Solution

Build a simple server-rendered, form-driven Private Management Area. It should work without client-side interactivity and should use plain form submissions that redirect back to the Private Management Area after each action.

The Private Management Area should organize work around Uncategorized Marks as the cleanup queue, while still showing regular Categorized Marks and category controls. Each Mark should have a form that lets the App Owner update its optional Title and Category in one submission. Category forms should support creating, renaming, and deleting Categories, with deletion preserving Marks by returning them to Uncategorized Marks. Sharing forms should support enabling or refreshing a Category Share Token, disabling sharing, making a Shared Category Token-Manageable, and making a Shared Category Share-Only.

Share-Only Categories and their assigned Marks should be hidden from the regular Private Management Area. They remain available through their Shared View. A Share-Only Category can be revealed again only from its Shared View by someone holding the Share Token. Token-Manageable Categories allow Share Token holders to modify Marks in that Category, while Category settings remain App Owner-controlled from the regular Private Management Area.

Add a clearer query-based Capture Flow route that accepts a URL and optional Title, while keeping the existing encoded-path save endpoint. Both capture endpoints should share the same save logic. Successful capture redirects to the saved URL. Duplicate or invalid capture redirects to the Private Management Area with an error state.

## User Stories

1. As the App Owner, I want a Private Management Area, so that I can manage Bucmarc without directly editing the database.
2. As the App Owner, I want the Private Management Area to use Bucmarc language, so that I work with Marks, Titles, Categories, Shared Categories, and Share Tokens rather than raw tables.
3. As the App Owner, I want the Private Management Area to be authenticated, so that only I can manage Marks, Categories, and sharing settings.
4. As the App Owner, I want the Capture Flow to stay lightweight, so that saving a Mark does not interrupt browsing when the save succeeds.
5. As the App Owner, I want successful capture to redirect to the saved URL, so that I continue to the page I was saving.
6. As the App Owner, I want duplicate capture to redirect to the Private Management Area with an error, so that I can resolve the existing Mark intentionally.
7. As the App Owner, I want invalid capture to redirect to the Private Management Area with an error, so that bad input is visible and no Mark is saved.
8. As the App Owner, I want a query-based Capture Flow route that accepts a URL, so that bookmarklets and browser search integrations can use it easily.
9. As the App Owner, I want the query-based Capture Flow route to accept an optional Title, so that captured page text can be saved when available.
10. As the App Owner, I want the existing encoded-path save endpoint to keep working, so that existing integrations do not break.
11. As the App Owner, I want both capture endpoints to share save behavior, so that URL validation, duplicate handling, and Title handling stay consistent.
12. As the App Owner, I want an optional Title to be stored with a captured Mark, so that useful page context can be retained.
13. As the App Owner, I want a blank Title to be stored as no Title, so that empty text is not treated as meaningful metadata.
14. As the App Owner, I want to see Uncategorized Marks as a cleanup queue, so that I know which Marks still need curation.
15. As the App Owner, I want to see Categorized Marks, so that I can review what is already organized.
16. As the App Owner, I want each Mark form to edit Title and Category together, so that cleanup can happen in one submission.
17. As the App Owner, I want a Mark with no Title to display its URL, so that every Mark remains identifiable.
18. As the App Owner, I want to assign a Mark to a Category from a form, so that organization works without client-side JavaScript.
19. As the App Owner, I want to clear a Mark's Category from a form, so that I can return it to Uncategorized Marks.
20. As the App Owner, I want to delete a Mark from the Private Management Area, so that I can remove URLs I no longer want to keep.
21. As the App Owner, I want Mark deletion to be a separate action from saving Title and Category, so that ordinary edits do not accidentally remove Marks.
22. As the App Owner, I want to create a Category, so that I can organize Marks into a new named group.
23. As the App Owner, I want to rename a Category, so that I can fix or refine its name.
24. As the App Owner, I want to delete a Category, so that obsolete groups can be removed.
25. As the App Owner, I want deleting a Category to keep its Marks, so that deleting a group does not delete saved URLs.
26. As the App Owner, I want Marks from a deleted Category to become Uncategorized Marks, so that they remain available for cleanup.
27. As the App Owner, I want Category names to be unique, so that Category selection is not ambiguous.
28. As the App Owner, I want Category name uniqueness to ignore surrounding whitespace, so that accidental spaces do not create duplicate Categories.
29. As the App Owner, I want Category name uniqueness to be case-insensitive, so that "Reading" and "reading" are not separate Categories.
30. As the App Owner, I want Category display casing to preserve my entered name, so that names look the way I intend.
31. As the App Owner, I want duplicate Category names to show a clear error, so that I know why the form did not apply.
32. As the App Owner, I want validation failures to redirect back with a short status message, so that form-driven actions remain simple.
33. As the App Owner, I want the Private Management Area to show top-level status messages, so that I can understand the result of the previous action.
34. As the App Owner, I want duplicate capture to make the existing Mark easy to find, so that the error is actionable.
35. As the App Owner, I want to enable sharing for a Category, so that Viewers can open its Shared View.
36. As the App Owner, I want to refresh a Category's Share Token, so that old Share Tokens stop working.
37. As the App Owner, I want to disable sharing for a Category, so that the Category is no longer shared.
38. As the App Owner, I want a share URL to be shown immediately after enabling sharing, so that I can copy it before the raw Share Token is lost.
39. As the App Owner, I want a new share URL to be shown immediately after refreshing sharing, so that I can replace the previous URL.
40. As the App Owner, I want a previously enabled Shared Category to show that sharing is enabled, so that I know its current sharing state.
41. As the App Owner, I do not need Bucmarc to reconstruct a previous share URL, so that raw Share Tokens can remain unrecoverable.
42. As the App Owner, I want empty Categories to be shareable, so that I can prepare a Shared Category before adding Marks.
43. As the App Owner, I do not want Uncategorized Marks to be shareable, so that sharing always happens through an explicit Category.
44. As a Viewer, I want a Shared View for an empty Shared Category to render successfully, so that a valid Share Token does not look broken.
45. As the App Owner, I want to make a Shared Category Share-Only, so that the Category and its Marks are available only through the Shared View.
46. As the App Owner, I want Share-Only Categories and their Marks hidden from the regular Private Management Area, so that they do not appear in normal curation or Category selection.
47. As someone holding a Share Token for a Share-Only Category, I want to reveal that Category from the Shared View, so that it can appear in the regular Private Management Area again.
48. As the App Owner, I want only the regular Private Management Area to make a Category Share-Only, so that token holders cannot hide Categories from my regular management surface.
49. As the App Owner, I want to make a Shared Category Token-Manageable, so that I can modify its Marks from an incognito session or another browser by using the Share Token.
50. As a Viewer of a Token-Manageable Category, I want to add Marks to that Category, so that the Shared View can be used as a narrow category-specific management surface.
51. As a Viewer of a Token-Manageable Category, I want to edit and clear Mark Titles in that Category, so that Mark metadata can be corrected from the Shared View.
52. As a Viewer of a Token-Manageable Category, I want to delete Marks in that Category, so that unwanted Marks can be removed from Bucmarc.
53. As the App Owner, I want Token-Manageable permissions to stay scoped to Marks in one Category, so that Share Tokens do not grant broader Category administration.
54. As the App Owner, I want ordinary Shared Categories to remain read-only unless I make them Token-Manageable, so that token-based mutation is opt-in.
55. As the App Owner, I want the Private Management Area to work without JavaScript, so that the first version is simple and reliable.
56. As the App Owner, I want form submissions to redirect back to the Private Management Area, so that refreshes do not resubmit actions.
57. As the App Owner, I want the UI to avoid raw implementation details, so that token hashes and table fields are not exposed as product concepts.
58. As the App Owner, I want Category form controls to use Category identifiers internally, so that uniqueness and display casing do not affect updates.
59. As the App Owner, I want this release to stay focused on management basics, so that richer interaction can be added later.

## Implementation Decisions

- Build a server-rendered, form-driven Private Management Area.
- Do not require client-side JavaScript for basic management actions.
- Keep the Private Management Area authenticated.
- Organize the management page around cleanup and curation, with Uncategorized Marks treated as the main queue.
- Show regular Categories and their assigned Marks in the Private Management Area.
- Hide Share-Only Categories and their assigned Marks from the regular Private Management Area.
- Exclude Share-Only Categories from regular Mark Category selectors.
- Add a backend operation that updates a Mark's Title and Category together.
- Store a missing or blank Title as null, not as an empty string.
- Display the URL when a Mark has no Title.
- Keep Mark deletion as a separate form action from Mark save.
- Keep existing Category deletion behavior: deleting a Category sets affected Marks back to Uncategorized Marks.
- Make Category names unique.
- Enforce Category name uniqueness case-insensitively after trimming whitespace.
- Preserve the entered display casing for Category names.
- Add validation for duplicate Category names on create and rename.
- Return form validation failures to the Private Management Area with short status messages.
- Use top-level status messaging for form outcomes rather than complex per-field state preservation.
- Add a clearer query-based Capture Flow route that accepts URL and optional Title query parameters.
- Keep the existing encoded-path save endpoint for compatibility.
- Share capture save logic between the new query-based route and the existing encoded-path endpoint.
- On successful capture, redirect to the saved URL.
- On duplicate capture, redirect to the Private Management Area with an error state and enough information to identify the existing Mark.
- On invalid capture, redirect to the Private Management Area with an error state.
- Do not overwrite an existing Mark's Title or Category during duplicate capture.
- Keep sharing at the Category boundary.
- Continue storing only a Share Token verifier, not a recoverable raw Share Token.
- Show a share URL immediately after enabling sharing.
- Enabling sharing for an already Shared Category refreshes its Share Token and invalidates the previous Share Token.
- Do not add a separate rotate endpoint or separate rotate product action; reuse the enable-sharing action to refresh an already Shared Category.
- Show a new share URL immediately after refreshing sharing.
- After the immediate enable or refresh response has passed, show only that sharing is enabled plus refresh, disable, Token-Manageable, and Share-Only controls.
- Allow empty Categories to be Shared Categories.
- Do not allow Uncategorized Marks to be shared directly.
- Make Token-Manageable opt-in per Shared Category.
- Keep ordinary Shared Categories read-only unless Token-Manageable is enabled.
- Let Token-Manageable Share Token holders create Marks directly in the matching Category.
- Reject token-created Marks when the URL already exists anywhere in Bucmarc.
- Let Token-Manageable Share Token holders edit or clear Mark Titles for Marks in the matching Category.
- Keep Mark URLs immutable; changing a URL requires deleting the old Mark and creating a new Mark.
- Let Token-Manageable Share Token holders hard-delete Marks from the matching Category.
- Do not let Share Token holders move Marks to another Category or to Uncategorized Marks.
- Do not let Share Token holders create, rename, or delete Categories.
- Do not let Share Token holders change sharing, refresh Share Tokens, or change Token-Manageable settings.
- Let the App Owner make a Shared Category Share-Only from the regular Private Management Area.
- Do not allow non-shared Categories to become Share-Only.
- Let anyone holding the Share Token turn Share-Only off from the Shared View.
- Do not let Share Token holders turn Share-Only on.
- Do not duplicate regular Category settings in the Shared View; revealing a Share-Only Category is the only Category setting action available there.
- Disabling sharing clears dependent Share-Only and Token-Manageable state for that Category.
- Do not expose raw database editing, arbitrary SQL, Share Token hashes, or implementation field names in the UI.
- No ADR is required for the server-rendered form approach because it is easy to reverse and does not represent a hard architectural commitment.

## Testing Decisions

- Manual testing with agent revalidation is the expected validation approach for this PRD.
- Automated tests are not required for this PRD unless the implementing agent chooses to add them for local confidence.
- Manual testing should validate external behavior through browser-visible pages, form submissions, redirects, and shared URLs.
- Manual testing should avoid asserting implementation details such as internal helper names, table field names, or token hash values.
- Agent revalidation should include running the app locally where practical and exercising the management flows from the browser or HTTP client.
- Manually verify that the Private Management Area is authenticated.
- Manually verify that the Private Management Area renders Uncategorized Marks.
- Manually verify that the Private Management Area renders Categorized Marks under their Categories.
- Manually verify that a Mark Title can be added, changed, and cleared.
- Manually verify that clearing a Mark Title stores and displays it as no Title, with URL fallback.
- Manually verify that a Mark can be assigned to a Category.
- Manually verify that a Mark can be returned to Uncategorized Marks.
- Manually verify that a Mark can be deleted.
- Manually verify that a Category can be created.
- Manually verify that a Category can be renamed.
- Manually verify that a Category can be deleted.
- Manually verify that deleting a Category moves its Marks to Uncategorized Marks instead of deleting them.
- Manually verify that duplicate Category creation is rejected after trimming whitespace.
- Manually verify that duplicate Category creation is rejected case-insensitively.
- Manually verify that duplicate Category rename is rejected after trimming whitespace.
- Manually verify that duplicate Category rename is rejected case-insensitively.
- Manually verify that valid Category names preserve entered display casing.
- Manually verify that validation errors redirect back to the Private Management Area with a clear status message.
- Manually verify that the new query-based Capture Flow route saves a URL-only Mark and redirects to the saved URL.
- Manually verify that the new query-based Capture Flow route saves a Mark with a Title and redirects to the saved URL.
- Manually verify that the existing encoded-path save endpoint still works.
- Manually verify that both capture endpoints reject invalid URLs.
- Manually verify that duplicate capture redirects to the Private Management Area with an error.
- Manually verify that duplicate capture does not overwrite the existing Mark's Title or Category.
- Manually verify that duplicate capture makes the existing Mark easy to find or identify.
- Manually verify that enabling sharing shows a one-time share URL.
- Manually verify that refreshing sharing shows a new one-time share URL and invalidates the previous Share Token.
- Manually verify that refreshing or revisiting later does not reconstruct and display an old raw Share Token.
- Manually verify that disabling sharing removes public access.
- Manually verify that an empty Shared Category renders a valid empty Shared View.
- Manually verify that Uncategorized Marks cannot be shared directly.
- Manually verify that the Shared View remains public while the Private Management Area remains protected.
- Manually verify that an ordinary Shared Category remains read-only for a Share Token holder.
- Manually verify that a Token-Manageable Category allows a Share Token holder to create a Mark in that Category.
- Manually verify that token-created duplicate Mark URLs are rejected globally.
- Manually verify that a Token-Manageable Category allows a Share Token holder to edit and clear Mark Titles.
- Manually verify that a Token-Manageable Category allows a Share Token holder to hard-delete Marks in that Category.
- Manually verify that a Share Token holder cannot edit Mark URLs.
- Manually verify that a Share Token holder cannot move Marks to another Category or to Uncategorized Marks.
- Manually verify that a Share Token holder cannot create, rename, or delete Categories.
- Manually verify that a Share Token holder cannot refresh sharing, disable sharing, enable Token-Manageable, or disable Token-Manageable.
- Manually verify that making a Category Share-Only hides the Category and its Marks from the regular Private Management Area.
- Manually verify that a Share-Only Category is absent from regular Mark Category selectors.
- Manually verify that a Share-Only Category remains accessible through its Shared View.
- Manually verify that a Share Token holder can turn Share-Only off from the Shared View.
- Manually verify that a Share Token holder cannot turn Share-Only on from the Shared View.
- Manually verify that disabling sharing clears Share-Only and Token-Manageable state.

## Out of Scope

- A generic database editor.
- Arbitrary SQL execution.
- Raw table browsing.
- Displaying Share Token hashes.
- Reconstructing old share URLs after the raw Share Token has been discarded.
- Client-side interactive controls.
- Drag-and-drop category assignment.
- Bulk Mark editing.
- Multiple Categories per Mark.
- Sharing Uncategorized Marks directly.
- Multiple active Share Tokens per Category.
- Per-Viewer or per-recipient Share Tokens.
- Share Token permissions outside the matching Category.
- Share Token control over Category creation, renaming, deletion, sharing, Share Token refresh, or Token-Manageable settings.
- Moving Marks between Categories from the Shared View.
- Editing Mark URLs.
- Multi-user ownership or account-scoped data.
- Rich Title extraction or metadata scraping beyond accepting an optional Title.
- Automated test implementation as a required deliverable.

## Further Notes

- The domain glossary was updated during planning: Capture Flow is the save-from-outside-Bucmarc path that continues to the saved URL on success, and Category names are unique.
- The previous backend PRD intentionally left frontend category controls out of scope. This PRD is the follow-on UI and form-action layer for that backend capability.
- The existing implementation currently redirects the encoded-path save endpoint back to the Private Management Area. This PRD changes successful capture behavior to redirect to the saved URL.
- The existing implementation currently allows duplicate Category names. This PRD requires a schema and/or validation change so Category names are unique after case-insensitive trimmed comparison.
