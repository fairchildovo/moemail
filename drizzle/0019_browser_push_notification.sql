CREATE TABLE IF NOT EXISTS `push_subscription` (
  `id` text PRIMARY KEY NOT NULL,
  `user_id` text NOT NULL,
  `endpoint` text NOT NULL,
  `subscription` text NOT NULL,
  `enabled` integer DEFAULT true NOT NULL,
  `created_at` integer NOT NULL,
  `updated_at` integer NOT NULL,
  `last_success_at` integer,
  `last_failure_at` integer,
  `last_error` text,
  FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `push_subscription_user_id_idx` ON `push_subscription` (`user_id`);
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS `push_subscription_endpoint_unique` ON `push_subscription` (`endpoint`);
