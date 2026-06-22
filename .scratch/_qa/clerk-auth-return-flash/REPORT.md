Status: ready-for-human

# Clerk Return Can Flash Or Bounce At The Private Management Area

## Context

Bucmarc uses Clerk authentication to protect the Private Management Area for the App Owner. Shared Views remain outside that authenticated management boundary.

## What happened

Sometimes, after Clerk sends the App Owner back to Bucmarc, the Private Management Area briefly flashes or bounces through an unexpected redirect instead of settling cleanly on the page the App Owner was trying to use.

The suspected trigger is an expired or stale Clerk session. When Bucmarc redirects to Clerk, the return target may be the app origin instead of the exact Private Management Area path that required authentication.

## What I expected

When the App Owner is asked to authenticate or refresh their Clerk session, returning from Clerk should land them directly on the intended Bucmarc path without a visible flash, redirect loop, or unexpected fallback to the generic app URL.

## Steps to reproduce

1. Sign in as the App Owner and use the Private Management Area.
2. Let the Clerk session expire or otherwise become stale.
3. Open or refresh a protected Bucmarc path in the Private Management Area.
4. Complete the Clerk sign-in or session-refresh flow.
5. Observe whether Bucmarc returns cleanly to the original path or briefly flashes/bounces through the main page or app origin.

## Suggested scope

Treat this as authentication redirect reliability work.

1. Reproduce the stale-session return path against the deployed Clerk configuration.
2. Confirm whether Clerk should receive the originally requested Bucmarc path as the return target instead of only the app origin.
3. Ensure successful authentication or session refresh returns the App Owner to the intended Private Management Area path.
4. Verify the behavior for the root Private Management Area and at least one non-root protected path.

## Acceptance criteria

- [ ] Returning from Clerk after a stale or expired session lands on the originally requested protected path.
- [ ] The App Owner does not see a visible flash, bounce, or redirect loop when Clerk returns to Bucmarc.
- [ ] The generic app URL is still used only when there is no more specific protected path to return to.
- [ ] Shared Views remain accessible without being pulled into the Clerk sign-in flow.

## Additional context

The likely area to inspect is the unauthenticated redirect from the Private Management Area to Clerk and the return URL sent to Clerk. The fix may be as small as preserving the current Bucmarc path when building the Clerk return target, but the exact behavior should be verified against Clerk's deployed settings.

## Comments

### Triage - 2026-06-15

Marked ready for human because this needs hands-on verification with Clerk session expiry and the deployed Clerk redirect settings.
