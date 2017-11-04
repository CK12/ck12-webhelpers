ALTER TABLE `LMSProviderAssignments` DROP FOREIGN KEY `LMSProviderAssignments_ibfk_2`;
ALTER TABLE `LMSProviderAssignments` ADD CONSTRAINT `LMSProviderAssignments_ibfk_2` FOREIGN KEY (`assignmentID`) REFERENCES `Assignments` (`assignmentID`) ON DELETE CASCADE ON UPDATE NO ACTION;
