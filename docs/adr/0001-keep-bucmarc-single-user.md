# Keep Bucmarc Single-User

Bucmarc is intentionally single-user: authentication protects the private management area, but marks and categories are not owned by separate accounts. This avoids introducing tenancy concepts before the app needs them, while preserving the option to add ownership later if Bucmarc grows beyond personal use.

**Considered Options**

- Scope marks and categories to authenticated accounts from the start.
- Keep one global personal dataset and use authentication only as the management gate.

**Consequences**

Public sharing can find a shared category without considering account ownership. A future multi-user version will need an explicit migration that assigns existing marks and categories to an owner.
