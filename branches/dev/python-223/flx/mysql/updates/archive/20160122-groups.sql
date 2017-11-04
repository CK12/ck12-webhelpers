ALTER TABLE `Groups` ADD COLUMN `isVisible` tinyint(1) NOT NULL DEFAULT 1 COMMENT 'flag to hide/show group' AFTER `resourceRevisionID`
