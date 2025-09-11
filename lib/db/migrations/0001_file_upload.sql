CREATE TABLE `FileUpload` (
  `id` text PRIMARY KEY NOT NULL,
  `userId` text NOT NULL,
  `filename` text NOT NULL,
  `pathname` text NOT NULL,
  `url` text NOT NULL,
  `contentType` text,
  `size` integer,
  `createdAt` integer DEFAULT (unixepoch()) NOT NULL
);

