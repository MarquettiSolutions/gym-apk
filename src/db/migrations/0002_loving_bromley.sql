CREATE TABLE `exercise_name_overrides` (
	`exercise_id` text NOT NULL,
	`language` text NOT NULL,
	`name` text NOT NULL,
	`updated_at` text NOT NULL,
	PRIMARY KEY(`exercise_id`, `language`),
	FOREIGN KEY (`exercise_id`) REFERENCES `exercises`(`id`) ON UPDATE no action ON DELETE cascade
);
