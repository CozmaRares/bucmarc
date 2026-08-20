CREATE TABLE `mark_series_candidates` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`mark_url` text NOT NULL,
	`series_id` integer NOT NULL,
	`episode` text,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`mark_url`) REFERENCES `marks`(`url`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`series_id`) REFERENCES `series`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `mark_series_candidates_mark_url_series_id_unique` ON `mark_series_candidates` (`mark_url`,`series_id`);--> statement-breakpoint
CREATE INDEX `mark_series_candidates_mark_url_index` ON `mark_series_candidates` (`mark_url`);--> statement-breakpoint
CREATE INDEX `mark_series_candidates_series_id_index` ON `mark_series_candidates` (`series_id`);--> statement-breakpoint
PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_series` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`title` text NOT NULL,
	`pattern` text NOT NULL,
	`match_type` text DEFAULT 'deterministic' NOT NULL,
	`manual_episode` text,
	`mark_url` text,
	`updated_at` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`mark_url`) REFERENCES `marks`(`url`) ON UPDATE no action ON DELETE set null,
	CONSTRAINT "series_deterministic_manual_episode_null" CHECK("match_type" <> 'deterministic' OR "manual_episode" IS NULL)
);
--> statement-breakpoint
INSERT INTO `__new_series`("id", "title", "pattern", "match_type", "manual_episode", "mark_url", "updated_at") SELECT "id", "title", "pattern", 'deterministic', NULL, "mark_url", "updated_at" FROM `series`;--> statement-breakpoint
DROP TABLE `series`;--> statement-breakpoint
ALTER TABLE `__new_series` RENAME TO `series`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE UNIQUE INDEX `series_mark_url_unique` ON `series` (`mark_url`);--> statement-breakpoint
CREATE INDEX `series_mark_url_unique_id_index` ON `series` (`mark_url`);
