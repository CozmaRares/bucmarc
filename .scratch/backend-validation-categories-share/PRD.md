Status: ready-for-agent

# PRD: Backend Validation, Categories, and Token-Shared Categories

## Problem Statement

The app currently accepts anything through the mark save endpoint and persists it without meaningful validation or user-facing save state. The authenticated homepage is currently a direct list of saved marks from the database, and there is no backend support for organizing marks into categories.

The app also needs a way to expose one category of marks in read-only form without requiring Clerk authentication. This is intended for flows such as opening the shared category in an incognito browser session by pasting a URL that contains an access token.

## Solution

Add backend validation for the existing URL-based save endpoint, category support for marks, and token-based read-only public sharing at the category level.

The save endpoint will continue to accept the URL through the route parameter. It will validate the decoded URL with Zod URL validation, reject invalid input, avoid duplicate saved marks, and redirect back to the homepage with query parameters that describe the save state.

Categories will be separate records. Each mark may belong to one category or no category. All non-URL metadata is optional. Category management remains authenticated through Clerk. Each category may optionally have one active share token. A token-enabled category is readable through a public route without Clerk, and every mark assigned to that category is visible through that token URL.

## User Stories

1. As the app owner, I want the save endpoint to validate incoming URLs, so that malformed or unsafe input is not persisted.
2. As the app owner, I want the save endpoint to use Zod URL validation, so that validation is explicit and maintainable.
3. As the app owner, I want the URL to remain the only required save input, so that the current save flow stays lightweight.
4. As the app owner, I want all metadata beyond the URL to be optional, so that marks can be saved quickly and organized later.
5. As the app owner, I want the save endpoint to reject invalid URLs by redirecting home with state, so that the homepage can later display feedback.
6. As the app owner, I want successful saves to redirect to the homepage with state, so that I can confirm the save outcome without staying on the API route.
7. As the app owner, I want duplicate saves to avoid creating duplicate rows, so that the mark list remains clean.
8. As the app owner, I want duplicate saves to produce an "exists" state instead of failing unexpectedly, so that repeated save attempts are understandable.
9. As the app owner, I want unexpected save failures to redirect with an error state, so that the frontend can eventually show a useful message.
10. As the app owner, I want the redirected URL to include the attempted mark URL, so that the homepage can show or copy it later.
11. As the app owner, I want categories to be separate records, so that categories can be renamed, deleted, and shared independently of marks.
12. As the app owner, I want each mark to belong to at most one category, so that organization stays simple.
13. As the app owner, I want marks to be allowed to have no category, so that saving a URL does not require category selection.
14. As the app owner, I want deleting a category to set affected marks back to uncategorized, so that deleting a category does not delete saved marks.
15. As the app owner, I want category creation to require authentication, so that only the Clerk-protected app can manage categories.
16. As the app owner, I want category renaming to require authentication, so that public token holders cannot modify category metadata.
17. As the app owner, I want category deletion to require authentication, so that public token holders cannot remove categories.
18. As the app owner, I want assigning a mark to a category to require authentication, so that public token holders cannot change organization.
19. As the app owner, I want category token creation to require authentication, so that sharing is controlled from the private app.
20. As the app owner, I want each category to have at most one active share token, so that revocation and rotation are simple.
21. As the app owner, I want category share tokens to be optional, so that categories are private by default.
22. As the app owner, I want enabling sharing for a category to generate a token URL, so that I can paste it into an incognito browser session.
23. As the app owner, I want rotating a category token to invalidate the previous token, so that leaked or stale URLs can be revoked.
24. As the app owner, I want disabling a category token to remove public access, so that a category can become private again.
25. As an unauthenticated viewer, I want to open a shared category URL containing a token, so that I can view the category without Clerk.
26. As an unauthenticated viewer, I want the shared category page to be read-only, so that token access cannot mutate the app.
27. As an unauthenticated viewer, I want the shared category page to show only marks from the token's category, so that unrelated marks remain private.
28. As an unauthenticated viewer, I want an invalid token to be rejected, so that arbitrary public access is not possible.
29. As the app owner, I want public share access to bypass Clerk only for the share route, so that the rest of the app remains protected.
30. As the app owner, I want category APIs to return JSON, so that future frontend handlers can consume them with fetch.
31. As the app owner, I want the save endpoint to keep its redirect-oriented behavior, so that it remains suitable for direct browser navigation.
32. As the app owner, I want frontend category controls to stay out of the first implementation, so that backend capability can land first.

## Implementation Decisions

- Keep the existing URL route-parameter save flow as the only mark creation input path for now.
- Validate the decoded URL with Zod URL validation. The only accepted protocols are HTTP and HTTPS
- The save endpoint redirects to the homepage with query parameters instead of returning JSON.
- Use this redirect contract for save outcomes:
  - Created: `/?state=created&url=<encoded-url>`
  - Duplicate: `/?state=exists&url=<encoded-url>`
  - Invalid: `/?state=invalid&url=<encoded-original>`
  - Unexpected failure: `/?state=error&url=<encoded-original>`
- Duplicate marks must not create additional rows. This is already enforced at the database level. Treat duplicate saves as a distinct state, not as a new successful creation.
- Add a title field on the marks.
- Add a categories data model separate from marks.
- Add a nullable category reference on marks.
- Keep the app single-user. Do not introduce Clerk user ownership columns.
- Category management is authenticated through Clerk.
- Public category sharing is implemented at the category level, not the mark level.
- Every mark in a token-enabled category is visible through that category's public share URL.
- Public share access is read-only.
- Use a public share route shaped like `/share/:token`.
- The share token is included directly in the URL so it can be pasted into incognito sessions.
- Each category supports one active token at a time.
- Categories are private by default.
- Enabling token access generates a token and returns the share URL.
- Rotating token access invalidates the previous token and returns a new share URL.
- Disabling token access removes public access for that category.
- Store only a token verifier suitable for lookup or comparison, not a raw token intended for display later.
- Category APIs return JSON.
- The first category API surface should support listing, creating, updating, and deleting categories.
- The token API surface should support enabling, disabling, and rotating a category token.
- Mark category assignment should use a request body containing the mark URL and category ID or null, rather than putting the mark URL in the route path.
- Deleting a category sets the category reference to null for affected marks.
- Do not add a confirmation step when moving a mark into a token-accessible category.
- Do not build category frontend controls in the first implementation.
- The homepage may continue listing all marks as it does today until a later frontend pass consumes categories and save-state query parameters.

## Testing Decisions

- Manual testing is the expected validation approach for this PRD. Automated tests are not required.
- Manual testing should focus on external behavior through HTTP routes and browser-visible outcomes, not internal implementation details.
- Manually verify the save endpoint redirects to the homepage with `state=created`, `state=exists`, `state=invalid`, and `state=error` where practical.
- Manually verify the save endpoint preserves the attempted URL in the redirected query string for created, duplicate, invalid, and error outcomes.
- Manually verify invalid URLs do not create marks.
- Manually verify duplicate saves do not create duplicate rows.
- Manually verify authenticated category management can create, list, rename, and delete categories.
- Manually verify deleting a category leaves its marks in an uncategorized state.
- Manually verify authenticated mark category assignment can assign a mark to a category and clear it back to uncategorized.
- Manually verify authenticated token management can enable, disable, and rotate a category token.
- Manually verify a generated share URL works in an unauthenticated or incognito browser session.
- Manually verify the public share route returns only marks in the matching token category.
- Manually verify invalid or disabled share tokens do not expose marks.
- Manually verify public share access cannot create, update, move, or delete marks or categories.
- Manually verify Clerk protection still applies to management routes while the share route remains publicly accessible.

## Out of Scope

- Automated test implementation.
- Frontend category filters, grouped lists, selectors, or management controls.
- Frontend display of save-state query parameters.
- Automatically copying a saved URL to the clipboard after redirect.
- Multiple categories per mark.
- Multiple active share tokens per category.
- Per-recipient token management.
- Multi-user tenancy or Clerk user-scoped data.
- Public write access through share URLs.
- Confirmation prompts when moving marks into token-accessible categories.
- Renaming the user-facing "protected" concept.

## Further Notes

- The current app applies Clerk middleware globally, so the share route will need an explicit unauthenticated path through routing or middleware ordering.
- The repository currently does not have a root domain glossary or ADR files. This PRD uses the existing app terms visible in the codebase: marks, categories, Clerk authentication, and share tokens.
- The term "protected" is not finalized. The implementation should avoid over-committing to that name in public-facing copy until the product language is chosen.
