BEGIN;
ALTER TABLE `Groups` ADD `creatorID` INT NOT NULL AFTER `type`;
UPDATE Groups g, GroupHasMembers gm SET g.creatorID = gm.memberID WHERE g.id = gm.groupID;
ALTER TABLE `flx2`.`Groups` ADD INDEX `idx_creator` ( `creatorID` );
UPDATE Groups SET creatorID = 1 WHERE creatorID = 0;
ALTER TABLE `Groups` ADD CONSTRAINT `FK_creator` FOREIGN KEY ( `creatorID` ) REFERENCES `flx2`.`Members` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;
ALTER TABLE Groups DROP INDEX parentID, ADD UNIQUE `parentID` (`parentID`, `name`, `creatorID`);
ALTER TABLE Groups DROP INDEX name_UNIQUE, ADD UNIQUE `name_UNIQUE` (`name`, `creatorID`);
COMMIT;
