--
-- Table structure for table `PublishRequests`
--

DROP TABLE IF EXISTS `PublishRequests`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `PublishRequests` (
    `artifactRevisionID` int(11) NOT NULL DEFAULT '0' COMMENT 'The artifact revision to be published.',
    `memberID` int(11) NOT NULL COMMENT 'The id of the requestor.',
    `comments` varchar(511) DEFAULT NULL COMMENT 'The comments of this request.',
    `requestTime` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'The request time.',
    PRIMARY KEY (`artifactRevisionID`, `memberID`),
    CONSTRAINT `PublishRequests_ibfk_1` FOREIGN KEY (`artifactRevisionID`) REFERENCES `ArtifactRevisions` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
    CONSTRAINT `PublishRequests_ibfk_2` FOREIGN KEY (`memberID`) REFERENCES `Members` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COMMENT='The PublishRequests.';
/*!40101 SET character_set_client = @saved_cs_client */;
