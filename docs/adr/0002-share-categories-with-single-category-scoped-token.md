# Share Categories With a Single Category-Scoped Token

Bucmarc shares at the category boundary, not at the individual mark boundary. Each category may have one active share token, and anyone holding that token can access the matching shared category without gaining access to other categories.

Share tokens are bearer secrets. Ordinary shared categories remain read-only for token holders. A shared category may also be made token-manageable, which allows token holders to create marks in that category, edit or clear titles for marks in that category, and hard-delete marks from that category. Token-manageable access does not allow token holders to edit mark URLs, move marks to another category, create or manage categories, refresh share tokens, disable sharing, or change token-manageable settings.

A shared category may also be made share-only. Share-only categories and their assigned marks are hidden from the regular private management area but remain available through the shared view. Making a category share-only is controlled from the private management area. Anyone holding the share token can turn share-only off from the shared view so the category can reappear in the regular private management area.

**Considered Options**

- Generate share tokens for individual marks.
- Allow multiple active share tokens per category.
- Use one active read-only share token per category.
- Use one active category-scoped share token with optional token-manageable permissions and share-only recovery.

**Consequences**

Moving a mark into a shared category immediately makes it visible in that shared view, and moving it out removes it from that view. Revocation stays simple because disabling or refreshing the category token affects the whole shared category at once.

Token-manageable access is intentionally stronger than read-only sharing, so leaked share tokens may permit mark creation, title edits, and mark deletion inside the matching category. The permission remains category-scoped and opt-in per shared category.

Share-only access intentionally lets a share token holder reveal the category again. This keeps the shared view as the recovery path when the category no longer appears in the regular private management area, while preventing token holders from hiding categories by turning share-only on.
