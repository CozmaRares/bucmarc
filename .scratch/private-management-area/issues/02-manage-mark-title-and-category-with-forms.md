Status: ready-for-agent

# Manage Mark Title And Category With Forms

## Parent

.scratch/private-management-area/PRD.md

## What to build

Build the first form-driven Private Management Area for Marks. The page should render Uncategorized Marks as the cleanup queue and also show Categorized Marks. Each Mark should have a form that updates its optional Title and Category together, with Category clearing supported. Mark deletion should remain a separate action from saving Title and Category.

The management experience should work without client-side JavaScript and should redirect back to the Private Management Area after form submissions.

## Acceptance criteria

- [ ] The Private Management Area is authenticated.
- [ ] The Private Management Area renders Uncategorized Marks.
- [ ] The Private Management Area renders Categorized Marks under or alongside their Categories.
- [ ] Each Mark can have its Title added, changed, and cleared through a form.
- [ ] Clearing a Title stores and displays the Mark as having no Title.
- [ ] A Mark with no Title displays its URL as fallback.
- [ ] Each Mark can be assigned to a Category through a form.
- [ ] Each Mark can be returned to Uncategorized Marks through a form.
- [ ] Mark Title and Category are saved together in one submission.
- [ ] Mark deletion is available as a separate form action.
- [ ] Form submissions redirect back to the Private Management Area.
- [ ] The UI avoids raw implementation details such as table fields and token hashes.

## Blocked by

None - can start immediately
