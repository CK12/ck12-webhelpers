--
-- Table structure for table `UnderageEmailTokens`
--

DROP TABLE IF EXISTS `UnderageEmailTokens`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `UnderageEmailTokens` (
    `parentEmail` varchar(255) NOT NULL COMMENT 'The email address of parent for underage student.',
    `token` varchar(255) NOT NULL COMMENT 'The varification token.',
    `studentID` int(11) DEFAULT NULL COMMENT 'The student ID, to be filled when created.',
    `creationTime` timestamp NOT NULL DEFAULT '0000-00-00 00:00:00' COMMENT 'The creation time of the entry.',
    PRIMARY KEY (`parentEmail`, `token`),
    CONSTRAINT `UnderageEmailTokens_ibfk_1` FOREIGN KEY (`studentID`) REFERENCES `Members` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COMMENT='Underage token.';
/*!40101 SET character_set_client = @saved_cs_client */;
