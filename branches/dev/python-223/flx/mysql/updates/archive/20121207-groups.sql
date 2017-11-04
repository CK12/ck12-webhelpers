ALTER TABLE `Groups` CHANGE `type` `type` enum('open','closed','protected') NOT NULL DEFAULT 'closed' COMMENT 'The type of Group';
