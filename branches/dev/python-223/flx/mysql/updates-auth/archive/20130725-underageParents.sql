--
-- Table structure for table `UnderageMemberParents`
--

DROP TABLE IF EXISTS `UnderageMemberParents`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `UnderageMemberParents` (
    `id` int(11) NOT NULL AUTO_INCREMENT COMMENT 'The auto generated member id.',
    `memberID` int(11) NOT NULL COMMENT 'The id of the member.',
    `parentEmail` varchar(255) NOT NULL COMMENT 'The email address of parent for underage member.',
    `token` varchar(1024) DEFAULT NULL COMMENT 'The varification token.',
    `approvalRequestCount` int(11) NOT NULL DEFAULT 0 COMMENT 'Number of times approval request sent to parent.',
    `approvedTime` timestamp NULL DEFAULT NULL COMMENT 'The time when parent approved the request for underage account activation.',
    `creationTime` timestamp NOT NULL DEFAULT '0000-00-00 00:00:00' COMMENT 'The creation time of the entry.',
    `updateTime` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'The last modified time.',
    PRIMARY KEY (`id`),
    CONSTRAINT `UnderageMemberParents_ibfk_1` FOREIGN KEY (`memberID`) REFERENCES `Members` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COMMENT='Information about underage varification.';
/*!40101 SET character_set_client = @saved_cs_client */;
