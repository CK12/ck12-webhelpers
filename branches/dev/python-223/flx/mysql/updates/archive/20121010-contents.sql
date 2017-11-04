ALTER TABLE `Contents` CHANGE `contents` `contents` BLOB NOT NULL COMMENT 'The contents.';
ALTER TABLE `Contents` ADD `compressed` BOOL DEFAULT 0 COMMENT '1 => contents compressed; 0 => not';
CREATE INDEX compress ON `Contents`(`compressed`);
