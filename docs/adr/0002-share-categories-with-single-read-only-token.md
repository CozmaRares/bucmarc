# Share Categories With a Single Read-Only Token

Bucmarc shares at the category boundary, not at the individual mark boundary. Each category may have one active share token, and anyone holding that token can view every mark currently in that category without gaining write access.

**Considered Options**

- Generate share tokens for individual marks.
- Allow multiple active share tokens per category.
- Use one active read-only share token per category.

**Consequences**

Moving a mark into a shared category immediately makes it visible in that shared view, and moving it out removes it from that view. Revocation stays simple because disabling or rotating the category token affects the whole shared category at once.
