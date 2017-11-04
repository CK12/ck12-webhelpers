DROP TABLE IF EXISTS `GroupActivities`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `GroupActivities` (
    `id` int(11) AUTO_INCREMENT NOT NULL,
    `groupID` int(11) NOT NULL COMMENT 'The GroupID for the activity',
    `ownerID` int(11) NOT NULL COMMENT 'The memberID who created the activity',
    `activityType` enum('share') COMMENT 'The type of activity',
    `objectType` enum('artifact', 'artifactRevision', 'resource', 'resourceRevision', 'notification') COMMENT 'The reference object type (artifactRevision, resourceRevision, etc.)',
    `objectID` int(11) COMMENT 'The objectID for the event',
    `activityData` text,
    `creationTime` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'The time of creating the activity.',
    PRIMARY KEY(`id`),
    CONSTRAINT `GroupActivities_ibfk_1` FOREIGN KEY (`groupID`) REFERENCES `Groups`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
    CONSTRAINT `GroupActivities_ibfk_2` FOREIGN KEY (`ownerID`) REFERENCES `Members`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
    INDEX `GroupActivities_idx_1` (`objectID`, `objectType`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COMMENT='GroupActivities';
/*!40101 SET character_set_client = @saved_cs_client */;
