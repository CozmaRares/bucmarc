CREATE TABLE `provider_patterns` (
	`pattern` text PRIMARY KEY NOT NULL,
	`match_type` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `regex_snippets` (
	`pattern` text PRIMARY KEY NOT NULL
);
