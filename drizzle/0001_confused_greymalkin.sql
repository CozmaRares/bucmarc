PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_marks` (
	`url` text PRIMARY KEY NOT NULL,
	`title` text,
	`category_id` integer,
	`last_clicked_at` integer DEFAULT (unixepoch()) NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`category_id`) REFERENCES `categories`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
INSERT INTO `__new_marks` (`url`, `title`, `category_id`, `last_clicked_at`, `created_at`)
SELECT `url`, `title`, `category_id`, `updated_at`, `updated_at`
FROM `marks`;
--> statement-breakpoint
DROP TABLE `marks`;--> statement-breakpoint
ALTER TABLE `__new_marks` RENAME TO `marks`;--> statement-breakpoint
CREATE UNIQUE INDEX `mark_title_unique` ON `marks` (`title`);--> statement-breakpoint
PRAGMA foreign_keys=ON;
