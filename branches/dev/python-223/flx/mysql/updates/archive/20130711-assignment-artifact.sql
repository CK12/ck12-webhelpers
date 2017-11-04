ALTER TABLE `Assignments`
    DROP FOREIGN KEY `artifact_ibfk_4`,
    CHANGE `artifactID` `objectID` int(11) DEFAULT NULL COMMENT 'The object ID of the assignment.',
    ADD COLUMN `objectType` ENUM('artifact', 'concept-node') DEFAULT NULL COMMENT 'The object type.' AFTER `objectID`;
