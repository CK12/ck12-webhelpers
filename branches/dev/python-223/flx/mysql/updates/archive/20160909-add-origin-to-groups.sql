ALTER TABLE `Groups` ADD COLUMN `origin` enum('ck-12', 'lms') NOT NULL DEFAULT 'ck-12' AFTER `groupScope`;
UPDATE `Groups` SET `origin` = 'lms' WHERE `id` in (SELECT distinct(`groupID`) FROM `LMSProviderGroups`);
ALTER TABLE `Groups` ADD INDEX `idx_groupType` (`groupType`);
ALTER TABLE `Groups` ADD INDEX  `idx_origin` (`origin`);
