CREATE TABLE `categories` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`created_at` integer
);
--> statement-breakpoint
ALTER TABLE `marks` ADD `title` text;--> statement-breakpoint
ALTER TABLE `marks` ADD `category_id` integer REFERENCES categories(id);