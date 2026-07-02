DROP INDEX `categories_shareTokenHash_unique`;--> statement-breakpoint
DROP INDEX `categories_share_token_hash_index`;--> statement-breakpoint
ALTER TABLE `categories` DROP COLUMN `share_token_hash`;--> statement-breakpoint
ALTER TABLE `categories` DROP COLUMN `is_share_only`;--> statement-breakpoint
ALTER TABLE `categories` DROP COLUMN `is_token_manageable`;