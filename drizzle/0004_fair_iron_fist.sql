PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_marks` (
	`url` text PRIMARY KEY NOT NULL,
	`title` text,
	`category_id` integer,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`category_id`) REFERENCES `categories`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
INSERT INTO `__new_marks`("url", "title", "category_id", "updated_at") SELECT "url", "title", "category_id", "updated_at" FROM `marks`;--> statement-breakpoint
DROP TABLE `marks`;--> statement-breakpoint
ALTER TABLE `__new_marks` RENAME TO `marks`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE TABLE `__new_categories` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`share_token_hash` text,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
INSERT INTO `__new_categories`("id", "name", "share_token_hash", "updated_at") SELECT "id", "name", "share_token_hash", "updated_at" FROM `categories`;--> statement-breakpoint
DROP TABLE `categories`;--> statement-breakpoint
ALTER TABLE `__new_categories` RENAME TO `categories`;--> statement-breakpoint
CREATE UNIQUE INDEX `categories_shareTokenHash_unique` ON `categories` (`share_token_hash`);--> statement-breakpoint
CREATE UNIQUE INDEX `categories_normalized_name_unique` ON `categories` (`name`);