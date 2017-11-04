INSERT INTO `MemberRoles` (`groupID`, `name`, `description`) VALUES (1, 'ge-owner', 'Group Editing Owner');
INSERT INTO `MemberRoles` (`groupID`, `name`, `description`) VALUES (1, 'ge-collaborator', 'Group Editing Collaborator');

ALTER TABLE Groups CHANGE groupType groupType ENUM('study', 'class', 'public-forum', 'editing') NOT NULL DEFAULT 'study';
