CREATE TABLE `Chat` (
	`id` text PRIMARY KEY NOT NULL,
	`createdAt` integer DEFAULT (unixepoch()) NOT NULL,
	`title` text NOT NULL,
	`userId` text NOT NULL,
	`visibility` text DEFAULT 'private' NOT NULL,
	FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `Document` (
	`id` text NOT NULL,
	`createdAt` integer DEFAULT (unixepoch()) NOT NULL,
	`title` text NOT NULL,
	`content` text,
	`text` text DEFAULT 'text' NOT NULL,
	`userId` text NOT NULL,
	PRIMARY KEY(`id`, `createdAt`),
	FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `FileUpload` (
	`id` text PRIMARY KEY NOT NULL,
	`userId` text NOT NULL,
	`filename` text NOT NULL,
	`pathname` text NOT NULL,
	`url` text NOT NULL,
	`contentType` text,
	`size` integer,
	`data` blob,
	`createdAt` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `MasterPrompt` (
	`userId` text PRIMARY KEY NOT NULL,
	`masterPrompt` text,
	FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `Message_v2` (
	`id` text PRIMARY KEY NOT NULL,
	`chatId` text NOT NULL,
	`role` text NOT NULL,
	`parts` text NOT NULL,
	`attachments` text NOT NULL,
	`createdAt` integer DEFAULT (unixepoch()) NOT NULL
);
--> statement-breakpoint
CREATE TABLE `Stream` (
	`id` text PRIMARY KEY NOT NULL,
	`chatId` text NOT NULL,
	`createdAt` integer DEFAULT (unixepoch()) NOT NULL
);
--> statement-breakpoint
CREATE TABLE `Suggestion` (
	`id` text PRIMARY KEY NOT NULL,
	`documentId` text NOT NULL,
	`documentCreatedAt` integer NOT NULL,
	`originalText` text NOT NULL,
	`suggestedText` text NOT NULL,
	`description` text,
	`isResolved` integer DEFAULT false NOT NULL,
	`userId` text NOT NULL,
	`createdAt` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `User` (
	`id` text PRIMARY KEY NOT NULL,
	`email` text,
	`name` text,
	`password` text
);
--> statement-breakpoint
CREATE TABLE `Vote_v2` (
	`chatId` text NOT NULL,
	`messageId` text NOT NULL,
	`isUpvoted` integer NOT NULL,
	PRIMARY KEY(`chatId`, `messageId`)
);
