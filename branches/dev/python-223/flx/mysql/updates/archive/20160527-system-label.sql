ALTER TABLE `MemberLabels` ADD COLUMN `sticky` tinyint(1) NOT NULL DEFAULT '0' AFTER `systemLabel`;
INSERT INTO `MemberLabels` (`label`, `systemLabel`, `sticky`, `created`) VALUES ('Collaboration', 1, 1, NOW());
