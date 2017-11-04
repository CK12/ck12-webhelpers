CREATE  TABLE IF NOT EXISTS `GroupMemberStates` (
`id` SMALLINT(6) NOT NULL AUTO_INCREMENT COMMENT 'The auto-generated Group ID' ,
`name` VARCHAR(63) NOT NULL COMMENT 'The Group Name' ,
`description` VARCHAR(511) NOT NULL COMMENT 'Description for the Group' ,
PRIMARY KEY (`id`) ,
UNIQUE INDEX `name` (`name` ASC) );

INSERT INTO GroupMemberStates VALUES(1, 'pending', 'The member has not joined the group yet');
INSERT INTO GroupMemberStates VALUES(2, 'active', 'The member has joined the group');
INSERT INTO GroupMemberStates VALUES(3, 'declined', 'The member has declined to join the group');
INSERT INTO GroupMemberStates VALUES(4, 'disabled', 'The member has been disabled in the group');

INSERT INTO MemberRoles VALUES(14, 1, 'groupmember', 'Member of a User Created Group');
INSERT INTO MemberRoles VALUES(15, 1, 'groupadmin', 'Admin of a User Created Group');


ALTER TABLE `GroupHasMembers` ADD COLUMN `statusID` SMALLINT(6) NOT NULL DEFAULT 2 AFTER `roleID`,
                                     ADD COLUMN `memberEmail` VARCHAR(255) AFTER `statusID`, 
				     ADD COLUMN `joinTime` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP AFTER `memberEmail`, 
				     ADD COLUMN `updateTime` TIMESTAMP NULL DEFAULT NULL AFTER `joinTime`, 
				     ADD COLUMN `disableNotification` TINYINT(1) NOT NULL DEFAULT 0 AFTER `updateTime` ;
UPDATE GroupHasMembers set statusID = 2;	
ALTER TABLE `GroupHasMembers` ADD CONSTRAINT `GroupHasMembers_ibfk_4` FOREIGN KEY (`statusID`) REFERENCES `GroupMemberStates` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION; 


ALTER TABLE `Groups` ADD COLUMN `handle` VARCHAR(255) NOT NULL AFTER `name`,
			    ADD COLUMN `accessCode` VARCHAR(45) NULL DEFAULT NULL AFTER `isActive`,
		            ADD COLUMN `type` ENUM('open', 'closed') NOT NULL  DEFAULT 'closed' AFTER `accessCode`,
			    ADD COLUMN `creationTime` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP, 
			    ADD COLUMN `updateTime` TIMESTAMP NULL; 
UPDATE Groups SET handle = 'CK-12-Foundation-Group' where id = 1;
UPDATE Groups SET handle = 'CK-12-Foundation-Teacher-Group' where id = 2;
ALTER TABLE `Groups` ADD UNIQUE INDEX `name_UNIQUE` (`name` ASC);
ALTER TABLE `Groups` ADD UNIQUE INDEX `handle_UNIQUE` (`handle` ASC); 
