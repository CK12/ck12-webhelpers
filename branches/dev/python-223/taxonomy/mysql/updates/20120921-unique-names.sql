ALTER TABLE `ConceptNodes` DROP KEY `name`;
ALTER TABLE `ConceptNodes` ADD UNIQUE KEY `name` (`name`, `subjectID`, `branchID`);

