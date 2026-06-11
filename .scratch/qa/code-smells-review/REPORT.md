Status: needs-triage

# Code Smells Review

## Context

This QA report captures code smells found during a review of Bucmarc's current working tree. The focus is user-facing behavior and maintainability risk in the Private Management Area, Capture Flow, Categories, Shared Categories, and Shared View.

`bun run typecheck` passes. No repo test files or test script were found.

## High Priority

### Invalid JSON API input returns an internal error

Several JSON endpoints validate request bodies by throwing on invalid input. When malformed or semantically invalid input reaches those endpoints, Bucmarc returns a generic internal error instead of a client-facing validation response.

Expected behavior: invalid API input should return a clear `400` response without going through the global internal-error path.

Suggested pickup: add a shared request validation helper for JSON APIs and cover malformed bodies, wrong field types, missing IDs, and invalid URLs.

### Updates can report success when no mark was changed

The Private Management Area can report that a mark was saved or categorized even when the target mark does not exist. This makes stale forms, copied requests, or concurrent edits appear successful.

Expected behavior: updating a missing mark should return a clear failure state or `404`, and the App Owner should not see a success message.

Suggested pickup: make mark update/category assignment operations distinguish "changed one row" from "nothing matched".

### Mutating routes do not have CSRF protection

Authenticated form actions and JSON mutations rely on Clerk authentication but do not include an anti-CSRF boundary. Because the app uses browser-authenticated requests, another site could potentially trigger state-changing requests from the App Owner's browser.

Expected behavior: state-changing actions in the Private Management Area should require an intentional same-origin form/API submission.

Suggested pickup: add CSRF protection for form posts and authenticated JSON mutations, then verify mark/category/share actions reject cross-site submissions.

## Medium Priority

### Category names are not enforced as unique

The glossary defines a Category as a uniquely named group, and existing issue text calls for trimmed, case-insensitive uniqueness. Current behavior can allow duplicate or whitespace-only Category names, which makes headings and selectors ambiguous.

Expected behavior: Category creation and rename should reject blank-after-trim names and names that duplicate another Category after trimming and case folding, while preserving valid display casing.

Suggested pickup: enforce the rule at the validation layer and, if feasible for SQLite, add a durable persistence constraint or normalized-name column.

### Delete actions can report success for missing records

Deleting a missing mark or Category can still report success. This has the same stale-request problem as updates, but it affects destructive actions and can hide user mistakes.

Expected behavior: deleting a missing mark or Category should produce a clear no-op/not-found response instead of a success state.

Suggested pickup: make delete operations report whether a row matched, and decide whether the product should show "already gone" or an error.

### Rotating sharing can enable sharing

The rotate action can create a share token for a Category that was not already a Shared Category. That blurs the difference between "enable sharing" and "rotate the existing share token".

Expected behavior: rotate should only work for an already Shared Category. Enabling sharing should remain the action that creates the first share token.

Suggested pickup: require an existing share token before rotation and return a clear state when the Category is not currently shared.

### Capture Flow mutates state with GET

The Capture Flow saves a mark through a GET route. This is convenient for bookmark-style use, but GET is easy to trigger accidentally through previews, prefetching, copied links, or browser restore behavior.

Expected behavior: creating a mark should require an explicit action boundary. If GET is intentionally retained for bookmarklet ergonomics, document that tradeoff and add safeguards against accidental saves.

Suggested pickup: decide whether the Capture Flow should move to POST or keep GET as an ADR-backed exception.

### Saving an existing mark silently ignores a new title

When saving a URL that already exists, Bucmarc reports that the mark exists and does not apply a newly supplied title. The App Owner may reasonably expect the provided title to update the existing mark or to be told it was ignored.

Expected behavior: the Capture Flow should either update title metadata for an existing mark or clearly communicate that existing mark metadata was left unchanged.

Suggested pickup: define the intended idempotency behavior for saving an existing mark with new metadata.

### Shared View drops mark titles

The Private Management Area displays a mark title when available, with URL fallback. The Shared View shows only raw URLs, so Viewers lose useful saved metadata.

Expected behavior: Shared View should present saved titles consistently with the private mark list while still making the destination URL visible or accessible.

Suggested pickup: render title-with-URL fallback in Shared View and cover marks with and without titles.

### Production logging includes mark data

Database query logging is enabled at info level and includes query parameters. Saved URLs, titles, Category names, and share-token hashes can be written to production logs.

Expected behavior: production logs should avoid recording private mark and Category data unless explicitly enabled for debugging.

Suggested pickup: disable parameter logging in production or lower query logging behind a debug flag.

## Low Priority

### Shared View rendering does not use the same page data pattern

Most pages use a data loader boundary, but the Shared View fetches marks inside the component. This makes the page less consistent and harder to test in isolation.

Expected behavior: page components should receive already-loaded render data, especially for public Shared View behavior.

Suggested pickup: move Shared View mark loading into its data loader.

### Inline dialog script makes CSP harder

The edit dialog behavior is embedded as inline script. It is static today, but it makes future strict Content Security Policy adoption harder and keeps client behavior coupled to the server-rendered component.

Expected behavior: client behavior should live in a static asset or be unnecessary for the baseline form flow.

Suggested pickup: either accept the no-JavaScript dialog fallback or move the dialog enhancement to a served script with CSP-compatible loading.

### Production image has packaging debt note

The Dockerfile includes a `FIX` comment explaining that production needs copied `node_modules` for native libsql dependencies. The image now starts by copying dependencies from the builder, but the comment marks packaging debt and may hide whether the image is intentionally shipping all dependencies.

Expected behavior: production packaging should have a clear, documented dependency strategy without stale fix comments.

Suggested pickup: either replace the comment with a neutral explanation or investigate a smaller production dependency copy.

### No automated regression tests

There is no test script and no tests in the repo. That leaves route validation, missing-record behavior, sharing rotation, and Capture Flow idempotency to manual checks.

Expected behavior: high-risk route and database behaviors should have automated coverage.

Suggested pickup: add a small test harness around Hono routes and DB operations before changing the behaviors above.

## Explicit TODO/FIX Markers

- Dockerfile contains one `FIX` marker about production needing `node_modules` for `@libsql/linux-x64-gnu`. It appears to be handled by the current copy step, but should be cleaned up or converted into an intentional packaging note.

## Suggested Breakdown

1. Harden API/form validation and missing-record responses.
2. Decide and document Capture Flow mutation/idempotency semantics.
3. Enforce Category name uniqueness and blank-name rejection.
4. Tighten Shared Category enable/rotate/disable semantics.
5. Improve Shared View presentation and data loading.
6. Reduce production data leakage through logs.
7. Add regression tests for the above routes and DB behaviors.
