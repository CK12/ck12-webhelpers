BEGIN;
ALTER TABLE `BlockedMembers` CHANGE `objectType` `objectType` ENUM('group','artifact','notifications') NOT NULL DEFAULT 'group';
ALTER TABLE `BlockedMembers` CHANGE `subObjectType` `subObjectType` ENUM('public-forum','study','class','book','concept','email','web') DEFAULT NULL;

COMMIT;
