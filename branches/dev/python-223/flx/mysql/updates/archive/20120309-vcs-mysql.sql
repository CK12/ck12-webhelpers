DROP TABLE IF EXISTS `Contents`;
DROP TABLE IF EXISTS `ContentRevisions`;

--
-- Dumping data for table `ContentRevisions`
--
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `ContentRevisions` (
    `id` int(11) NOT NULL AUTO_INCREMENT COMMENT 'The revision id.',
    `creationTime` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'The creation time.',
    `log` varchar(4095) NOT NULL COMMENT 'The log message of this revision.',
    PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 ROW_FORMAT=COMPACT COMMENT='ContentRevisions';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Contents`
--
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `Contents` (
    `resourceURI` varchar(255) NOT NULL COMMENT 'The resource URI.',
    `ownerID` int(11) NOT NULL COMMENT 'The owner of this contents.',
    `contentRevisionID` int(11) NOT NULL COMMENT 'The revision.',
    `creationTime` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'The creation time.',
    `contents` longtext NOT NULL COMMENT 'The contents.',
    `checksum` varchar(256) NULL COMMENT 'The contents checksum.',
    PRIMARY KEY (`resourceURI`, `ownerID`, `contentRevisionID`),
    CONSTRAINT `Contents_ibfk_1` FOREIGN KEY (`resourceURI`, `ownerID`) REFERENCES `Resources`(`uri`, `ownerID`) ON DELETE NO ACTION ON UPDATE NO ACTION,
    CONSTRAINT `Contents_ibfk_2` FOREIGN KEY (`contentRevisionID`) REFERENCES `ContentRevisions`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8 ROW_FORMAT=COMPACT COMMENT='Contents';
/*!40101 SET character_set_client = @saved_cs_client */;
