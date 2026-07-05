CREATE TABLE `categories` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`sort_order` integer DEFAULT 0 NOT NULL,
	`updated_at` integer DEFAULT (unixepoch()) NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `categories_normalized_name_unique` ON `categories` (lower(trim("name")));--> statement-breakpoint
CREATE TABLE `jobs` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`mark_url` text NOT NULL,
	`status` text NOT NULL,
	`updated_at` integer DEFAULT (unixepoch()) NOT NULL
);
--> statement-breakpoint
CREATE TABLE `marks` (
	`url` text PRIMARY KEY NOT NULL,
	`title` text,
	`category_id` integer,
	`updated_at` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`category_id`) REFERENCES `categories`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE UNIQUE INDEX `mark_title_unique` ON `marks` (`title`);--> statement-breakpoint
CREATE TABLE `series` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`title` text NOT NULL,
	`pattern` text NOT NULL,
	`mark_url` text,
	`updated_at` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`mark_url`) REFERENCES `marks`(`url`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE UNIQUE INDEX `series_pattern_unique` ON `series` (`pattern`);--> statement-breakpoint
CREATE UNIQUE INDEX `series_mark_url_unique` ON `series` (`mark_url`);--> statement-breakpoint
CREATE INDEX `series_mark_url_unique_id_index` ON `series` (`mark_url`);