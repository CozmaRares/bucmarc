Status: done

# Manage Mark Title And Category With Forms

## Parent

.scratch/private-management-area/PRD.md

## What to build

Build the first form-driven Private Management Area for Marks. The page should render Uncategorized Marks as the cleanup queue and also show Categorized Marks. Each Mark should have a form that updates its optional Title and Category together, with Category clearing supported. Mark deletion should remain a separate action from saving Title and Category.

The management experience should work without client-side JavaScript and should redirect back to the Private Management Area after form submissions.

## Acceptance criteria

- [x] The Private Management Area is authenticated.
- [x] The Private Management Area renders Uncategorized Marks.
- [x] The Private Management Area renders Categorized Marks under or alongside their Categories.
- [x] Each Mark can have its Title added, changed, and cleared through a form.
- [x] Clearing a Title stores and displays the Mark as having no Title.
- [x] A Mark with no Title displays its URL as fallback.
- [x] Each Mark can be assigned to a Category through a form.
- [x] Each Mark can be returned to Uncategorized Marks through a form.
- [x] Mark Title and Category are saved together in one submission.
- [x] Mark deletion is available as a separate form action.
- [x] Form submissions redirect back to the Private Management Area.
- [x] The UI avoids raw implementation details such as table fields and token hashes.

## Blocked by

None - can start immediately
