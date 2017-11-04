INSERT IGNORE INTO `Branches` (`id`,  `name`, `shortname`, `bisac`, `subjectID`, `created`) SELECT 21, 'Software Testing', 'TST', NULL, id, NOW() FROM `Subjects` WHERE `shortname` = 'ENG';

