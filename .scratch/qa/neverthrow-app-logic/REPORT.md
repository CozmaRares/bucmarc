Status: needs-triage

# Update App Logic To Use neverthrow

## Context

Bucmarc already depends on `neverthrow`, but the app logic still relies on thrown errors, `null` sentinels, string-matched errors, and route-local catch blocks to model expected outcomes in the Capture Flow, Private Management Area, Categories, Shared Categories, and Shared View.

This makes expected product states harder to distinguish from unexpected failures. Examples include duplicate Marks, invalid Category input, missing Marks or Categories, duplicate Category names, already-enabled Shared Categories, Share Token rotation failures, and not-found Shared Views.

## What happened

Expected domain outcomes are represented inconsistently across the app:

- Some operations throw for expected validation or not-found states.
- Some operations return string statuses such as created or exists.
- Some operations return `null` for expected failure states.
- Some routes convert errors into generic failure states, while others let errors reach the global internal-error handler.
- Some JSON and form paths duplicate the same decision logic with different response shapes.

The result is that the app has several ways to say "this expected business outcome happened", and each route needs to remember how to translate each one into redirects, JSON responses, or not-found pages.

## What I expected

Expected Bucmarc outcomes should be represented explicitly with `neverthrow` `Result` or `ResultAsync` values, so route handlers can map domain outcomes to user-facing responses without exception matching or `null` checks.

Unexpected failures should still be logged and handled as true internal errors. Expected outcomes should stay typed and visible at the boundary where Bucmarc decides what the App Owner or Viewer sees.

## Steps to observe

1. Review the Capture Flow save behavior for created Marks, duplicate Marks, invalid URLs, and unexpected save failures.
2. Review Private Management Area Mark updates, Category assignment, Category creation, rename, delete, and sharing controls.
3. Review JSON API behavior for malformed input, missing Categories, duplicate Category names, already-enabled sharing, rotation, and disabling sharing.
4. Compare how each expected outcome is represented before it becomes a redirect state, JSON status, or not-found page.
5. Confirm that `neverthrow` is already available as a dependency but is not yet the common pattern for these outcomes.

## Suggested scope

Treat this as a refactor of application logic boundaries, not a UI redesign.

Start with a thin vertical slice, then expand:

1. Define domain result types for expected Mark, Category, and Shared Category outcomes.
2. Convert database-facing operations that currently throw, return `null`, or return loose strings for expected outcomes into `ResultAsync`.
3. Add small response-mapping helpers for redirects, JSON responses, and not-found pages.
4. Migrate route handlers one group at a time, keeping current user-facing behavior stable.
5. Leave truly unexpected failures as errors that reach the existing internal-error path.

## Acceptance criteria

- [ ] Capture Flow outcomes are represented as typed Results before being mapped to redirects.
- [ ] Mark update, delete, and Category assignment outcomes distinguish success, validation failure, missing Mark, and unexpected failure without string-matching thrown errors.
- [ ] Category create and rename outcomes distinguish success, duplicate name, invalid input, missing Category, and unexpected failure without `null` sentinels.
- [ ] Shared Category enable, rotate, and disable outcomes distinguish success, missing Category, already-enabled sharing, not-currently-shared rotation, and unexpected failure without `null` sentinels.
- [ ] Shared View lookup distinguishes invalid or unknown Share Tokens from unexpected failures without leaking private details.
- [ ] JSON and form routes use shared outcome mapping where practical, while preserving their existing response contracts.
- [ ] Unexpected failures remain logged and return internal-error behavior.
- [ ] No old raw Share Tokens are reconstructed or displayed as part of the refactor.
- [ ] Bucmarc language remains consistent: Mark, Title, Category, Shared Category, Share Token, Private Management Area, Capture Flow, Shared View, App Owner, and Viewer.

## Additional context

This report does not require adopting `neverthrow` everywhere at once. The main value is making expected domain outcomes explicit at the app boundary so future changes to Marks, Categories, Shared Categories, and Shared Views do not need more ad hoc exception handling.

The highest-risk areas are flows that already branch between several expected outcomes: Capture Flow saves, Category create or rename, and Shared Category enable or rotate.
