CREATE TABLE `SuggestedPrompts` (
	`id` integer PRIMARY KEY NOT NULL,
	`text` text NOT NULL,
	`userId` text NOT NULL,
	FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON UPDATE no action ON DELETE cascade
);
