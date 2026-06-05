ALTER TABLE `categories` ADD `share_token_hash` text;--> statement-breakpoint
CREATE UNIQUE INDEX `categories_shareTokenHash_unique` ON `categories` (`share_token_hash`);