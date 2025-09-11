-- Create MasterPrompt table to store per-user master prompt text
CREATE TABLE IF NOT EXISTS `MasterPrompt` (
  `userId` text PRIMARY KEY NOT NULL,
  `masterPrompt` text
);


