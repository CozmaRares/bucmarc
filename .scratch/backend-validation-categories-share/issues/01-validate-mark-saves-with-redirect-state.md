Status: ready-for-agent

# Validate Mark Saves With Redirect State

## Parent

.scratch/backend-validation-categories-share/PRD.md

## What to build

Validate mark saves end-to-end while preserving the current route-parameter save flow. A mark save should accept only HTTP and HTTPS URLs, should not create duplicate marks, and should always finish by redirecting to the homepage with query parameters that describe the save outcome.

This slice should keep the URL as the only required save input. It should make save results visible through redirect state so a later frontend pass can display feedback without changing the save contract again.

## Acceptance criteria

- [ ] Saving a valid HTTP or HTTPS URL creates a mark when it does not already exist.
- [ ] A successful new save redirects to `/?state=created&url=<encoded-url>`.
- [ ] Saving an existing mark does not create a duplicate row.
- [ ] A duplicate save redirects to `/?state=exists&url=<encoded-url>`.
- [ ] Saving an invalid URL does not create a mark.
- [ ] An invalid save redirects to `/?state=invalid&url=<encoded-original>`.
- [ ] An unexpected save failure redirects to `/?state=error&url=<encoded-original>` where practical.
- [ ] Only HTTP and HTTPS URLs are accepted.
- [ ] The save route remains browser-navigation oriented and does not become a JSON API.
- [ ] Manual verification covers created, duplicate, invalid, and error redirect states where practical.

## Blocked by

None - can start immediately
