--
-- Table structure for table `EventTypes`
--

DROP TABLE IF EXISTS `Events`;
DROP TABLE IF EXISTS `Notifications`;

DROP TABLE IF EXISTS `EventTypes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `EventTypes` (
    `id` smallint(6) AUTO_INCREMENT NOT NULL,
    `name` varchar(255) NOT NULL COMMENT 'The event type name',
    `description` varchar(2047) COMMENT 'The event type description',
    PRIMARY KEY(`id`),
    UNIQUE KEY(`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 ROW_FORMAT=COMPACT COMMENT='EventTypes';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `Events`
--

DROP TABLE IF EXISTS `Events`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `Events` (
    `id` int(11) AUTO_INCREMENT NOT NULL,
    `eventTypeID` smallint(6) NOT NULL COMMENT 'The event type',
    `objectID` int(11) COMMENT 'The reference object id',
    `objectType` enum('artifact', 'artifactRevision', 'resource', 'resourceRevision', 'notification') COMMENT 'The reference object type (artifactRevision, resourceRevision, etc.)',
    `eventData` text,
    `ownerID` int(11) COMMENT 'The owner for the event',
    `created` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'The time of creating the request.',
    PRIMARY KEY(`id`),
    CONSTRAINT `Events_ibfk_1` FOREIGN KEY (`ownerID`) REFERENCES `Members`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
    CONSTRAINT `Events_ibfk_2` FOREIGN KEY (`eventTypeID`) REFERENCES `EventTypes`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
    INDEX `Events_idx_1` (`objectID`, `objectType`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 ROW_FORMAT=COMPACT COMMENT='Events';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `Notifications`
--

DROP TABLE IF EXISTS `Notifications`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `Notifications` (
    `id` int(11) AUTO_INCREMENT NOT NULL,
    `eventTypeID` smallint(6) NOT NULL COMMENT 'The event type for this notification',
    `objectID` int(11) COMMENT 'The objectID for the event',
    `objectType` varchar(255) COMMENT 'The objectType for the event',
    `type` enum('email', 'text') NOT NULL DEFAULT 'email' COMMENT 'The type of notification',
    `address` varchar(512) COMMENT 'The address where the notification should be sent',
    `subscriberID` int(11) COMMENT 'The owner for the notification',
    `frequency` enum('instant', 'once', 'daily', 'weekly') NOT NULL DEFAULT 'once' COMMENT 'How often the notification should be send',
    `updated` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'The request update time.',
    `created` timestamp NOT NULL DEFAULT '0000-00-00 00:00:00' COMMENT 'The time of creating the row.',
    `lastSent` timestamp NULL DEFAULT NULL COMMENT 'The time when this notification was last sent',
    PRIMARY KEY(`id`),
    CONSTRAINT `Notifications_ibfk_1` FOREIGN KEY (`eventTypeID`) REFERENCES `EventTypes`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
    CONSTRAINT `Notifications_ibfk_2` FOREIGN KEY (`subscriberID`) REFERENCES `Members`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8 ROW_FORMAT=COMPACT COMMENT='Notifications';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `EventTypes`
--

LOCK TABLES `EventTypes` WRITE;
/*!40000 ALTER TABLE `EventTypes` DISABLE KEYS */;
INSERT INTO `EventTypes` (`id`, `name`, `description`) VALUES
(1, 'ARTIFACT_IMPORTED', 'An artifact was successfully imported into the FlexBook system'),
(2, 'ARTIFACT_IMPORT_FAILED', 'An artifact import task failed'),
(3, 'ARTIFACT_PUBLISHED', 'An artifact was published'),
(4, 'ARTIFACT_REVISION_CREATED', 'An artifact was created successfully'),
(5, 'ARTIFACT_UNPUBLISHED', 'An artifact was unpublished'),
(6, 'ARTIFACT_DELETED', 'An artifact was deleted'),
(7, 'ARTIFACT_RELATED_MATERIAL_ADDED', 'Some related material was added to an artifact'),
(8, 'SEARCH_INDEX_SYNCED', 'Search index sync task finished successfully'),
(9, 'SEARCH_INDEX_SYNC_FAILED', 'Search index sync task failed'),
(10, 'SEARCH_INDEX_CREATED', 'Search index was created successfully'),
(11, 'SEARCH_INDEX_CREATE_FAILED', 'Search index creation failed'),
(12, 'EMBEDDED_OBJECT_CREATE_FAILED', 'Embedded Object creation failed'),
(13, 'NOTIFICATION_SEND_FAILED', 'Sending notification failed'),
(14, 'PASSWORD_RESET_REQUESTED', 'An user requested to reset password'),
(15, 'ARTIFACT_CREATED', 'A new artifact created'),
(16, 'NEWSLETTER_PUBLISHED', 'New newsletter has been published');
/*!40000 ALTER TABLE `EventTypes` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping data for table `Notifications`
--

LOCK TABLES `Notifications` WRITE;
/*!40000 ALTER TABLE `Notifications` DISABLE KEYS */;
INSERT INTO `Notifications` (`id`, `eventTypeID`, `objectID`, `objectType`, `type`, `address`, `subscriberID`, `frequency`, `lastSent`, `created`, `updated`) VALUES 
(1,1,NULL,NULL,'email','nobody@ck12.org',1,'instant',NULL,now(), now()),
(2,2,NULL,NULL,'email','nobody@ck12.org',1,'instant',NULL,now(), now()),
(3,8,NULL,NULL,'email','nobody@ck12.org',1,'daily',NULL,now(), now()),
(4,9,NULL,NULL,'email','nobody@ck12.org',1,'instant',NULL,now(), now()),
(5,10,NULL,NULL,'email','nobody@ck12.org',1,'weekly',NULL,now(), now()),
(6,11,NULL,NULL,'email','nobody@ck12.org',1,'instant',NULL,now(), now()),
(7,12,NULL,NULL,'email','nobody@ck12.org',1,'instant',NULL,now(), now()),
(8,13,NULL,NULL,'email','nobody@ck12.org',1,'daily',NULL,now(), now());
/*!40000 ALTER TABLE `Notifications` ENABLE KEYS */;
UNLOCK TABLES;

