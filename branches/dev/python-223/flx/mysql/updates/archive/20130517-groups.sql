BEGIN;
ALTER TABLE Groups ADD COLUMN resourceRevisionID int (11) COMMENT 'Group Image' AFTER `groupType`;
UPDATE Groups SET resourceRevisionID = (SELECT id FROM ResourceRevisions WHERE resourceID IN (SELECT id FROM Resources WHERE resourceTypeID = (SELECT id FROM ResourceTypes WHERE name = 'group system image')) LIMIT 1);
ALTER TABLE `Groups` ADD CONSTRAINT `FK_ResourceRevision` FOREIGN KEY (`resourceRevisionID`) REFERENCES `ResourceRevisions`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;
COMMIT;
