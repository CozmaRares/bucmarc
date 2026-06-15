Status: needs-triage

# Shared Views Do Not Appear Protected Against Repeated Share Token Guessing

## What happened

The Share Token feature feels risky because Shared Views and token-scoped actions can be probed repeatedly by changing the token in the URL. If an attacker can make unlimited attempts, they may be able to brute-force or enumerate valid Share Tokens over time.

## What I expected

Bucmarc should make repeated Share Token guessing impractical and observable. Invalid Share Token attempts should be rate-limited, delayed, blocked, logged, or otherwise protected before Shared Categories or Token-Manageable Categories are exposed.

## Steps to reproduce

1. Enable sharing for a Category so Bucmarc creates a Shared Category.
2. Open a Shared View URL shaped like `/share/:token`.
3. Replace the Share Token with arbitrary values and repeat requests against the Shared View.
4. Repeat the same pattern against token-scoped Mark actions such as saving, editing, or deleting Marks in a Token-Manageable Category.
5. Observe that the product behavior does not communicate any protection against repeated invalid Share Token attempts.

## Additional context

Share Tokens are bearer secrets. Token-Manageable Categories make a valid Share Token stronger than read-only access because token holders can create Marks, edit or clear Titles, and hard-delete Marks in the matching Category. That makes brute-force resistance more important than it was for read-only sharing.

This report is about the product security boundary, not a specific mitigation. Possible mitigations may include high-entropy token guarantees, rate limiting by IP and token prefix, generic not-found responses, abuse logging, temporary lockouts, or a configuration that disables token-managed writes unless abuse protection is available.
