ALTER TABLE `ConceptNodes` ADD `handle` varchar(255) NULL COMMENT 'The url safe handle of the node';
UPDATE `ConceptNodes` SET `handle` = REPLACE(REPLACE(REPLACE(REPLACE(`name`, '/', ''), ',', ''), '\'', ''), ' ', '-') WHERE `handle` IS NULL;
ALTER TABLE `ConceptNodes` CHANGE `handle` `handle` varchar(255) NOT NULL COMMENT 'The url safe handle of the node';
ALTER TABLE `ConceptNodes` ADD UNIQUE KEY `handle` (`handle`);
