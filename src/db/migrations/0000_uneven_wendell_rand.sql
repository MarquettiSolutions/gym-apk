CREATE TABLE `users` (
	`id` text PRIMARY KEY NOT NULL,
	`display_name` text DEFAULT 'Usuario local' NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `exercises` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`muscle_group` text,
	`equipment` text,
	`instructions` text,
	`thumbnail_remote_url` text,
	`thumbnail_local_path` text,
	`video_source` text,
	`video_remote_url` text,
	`video_local_path` text,
	`video_cached_at` text,
	`is_custom` integer DEFAULT false NOT NULL,
	`created_by_user_id` text,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	FOREIGN KEY (`created_by_user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `plans` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`name` text NOT NULL,
	`is_active` integer DEFAULT false NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `plan_days` (
	`id` text PRIMARY KEY NOT NULL,
	`plan_id` text NOT NULL,
	`weekday` integer NOT NULL,
	`label` text,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	FOREIGN KEY (`plan_id`) REFERENCES `plans`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `plan_day_exercises` (
	`id` text PRIMARY KEY NOT NULL,
	`plan_day_id` text NOT NULL,
	`exercise_id` text NOT NULL,
	`order_index` integer DEFAULT 0 NOT NULL,
	`target_sets` integer NOT NULL,
	`target_reps` integer NOT NULL,
	`target_weight` real,
	`rest_seconds` integer DEFAULT 30 NOT NULL,
	`notes` text,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	FOREIGN KEY (`plan_day_id`) REFERENCES `plan_days`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`exercise_id`) REFERENCES `exercises`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `workout_sessions` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`plan_day_id` text,
	`started_at` text NOT NULL,
	`finished_at` text,
	`status` text DEFAULT 'in_progress' NOT NULL,
	`created_at` text NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`plan_day_id`) REFERENCES `plan_days`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `workout_session_sets` (
	`id` text PRIMARY KEY NOT NULL,
	`session_id` text NOT NULL,
	`plan_day_exercise_id` text,
	`exercise_id` text NOT NULL,
	`set_number` integer NOT NULL,
	`reps_done` integer,
	`weight_done` real,
	`weight_unit` text DEFAULT 'kg' NOT NULL,
	`completed_at` text,
	`skipped` integer DEFAULT false NOT NULL,
	`created_at` text NOT NULL,
	FOREIGN KEY (`session_id`) REFERENCES `workout_sessions`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`plan_day_exercise_id`) REFERENCES `plan_day_exercises`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`exercise_id`) REFERENCES `exercises`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `workout_session_sets_exercise_completed_idx` ON `workout_session_sets` (`exercise_id`,`completed_at`);--> statement-breakpoint
CREATE TABLE `body_weight_logs` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`weight` real NOT NULL,
	`weight_unit` text DEFAULT 'kg' NOT NULL,
	`logged_at` text NOT NULL,
	`created_at` text NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `body_weight_logs_user_logged_idx` ON `body_weight_logs` (`user_id`,`logged_at`);--> statement-breakpoint
CREATE TABLE `settings` (
	`key` text PRIMARY KEY NOT NULL,
	`value` text NOT NULL
);
