ALTER TABLE `Assignments` ADD COLUMN `origin` ENUM('ck-12', 'lms') DEFAULT 'ck-12' COMMENT 'The assignment origin.' AFTER `assignmentType`;
ALTER TABLE `Assignments` ADD INDEX `Assignments_origin` (`origin`);

UPDATE `Assignments` SET `origin`='lms' WHERE `assignmentID` IN ( SELECT distinct `assignmentID` FROM `LMSProviderAssignments` );
