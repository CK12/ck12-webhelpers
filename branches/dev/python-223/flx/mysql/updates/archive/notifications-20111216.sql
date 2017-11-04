--
-- Table structure for table `NotificationRules`
--

DROP TABLE IF EXISTS `NotificationRules`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `NotificationRules` (
    `id` smallint(6) AUTO_INCREMENT NOT NULL,
    `name` varchar(255) NOT NULL COMMENT 'The notification rule name',
    `description` varchar(2047) COMMENT 'The notification rule description',
    PRIMARY KEY(`id`),
    UNIQUE KEY(`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 ROW_FORMAT=COMPACT COMMENT='Notification Rules';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `NotificationRules`
--

LOCK TABLES `NotificationRules` WRITE;
/*!40000 ALTER TABLE `NotificationRules` DISABLE KEYS */;
INSERT INTO `NotificationRules` (`id`, `name`, `description`) VALUES
(1, 'EXISTS_IN_LIBRARY', 'An object exists in the users library');
/*!40000 ALTER TABLE `NotificationRules` ENABLE KEYS */;
UNLOCK TABLES;

ALTER TABLE `Notifications` add `ruleID` smallint(6) NULL;
ALTER TABLE `Notifications` ADD CONSTRAINT `Notifications_ibfk_3` FOREIGN KEY (`ruleID`) REFERENCES `NotificationRules`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

INSERT INTO `Notifications` (`eventTypeID`, `objectID`, `objectType`, `type`, `ruleID`, `address`, `subscriberID`, `frequency`, `lastSent`, `created`, `updated`) VALUES 
(4,NULL,NULL,'email',1,'nobody@ck12.org',3,'daily',NULL,now(), now());
