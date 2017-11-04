DROP TABLE IF EXISTS `ArtifactRevisionFeedbacks`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `ArtifactFeedbacks` (
`artifactID` int(11) NOT NULL COMMENT 'The artifact ID.',
`memberID` int(11) NOT NULL COMMENT 'The cK-12 member id.',
`score` smallint(6) DEFAULT NULL comment 'Feedback from the member.',
`type` ENUM('rating', 'vote') NULL ,
`comments` varchar(16383) DEFAULT NULL COMMENT 'Comments from the member.',
`creationTime` timestamp NOT NULL DEFAULT '0000-00-00 00:00:00' COMMENT 'The creation time of this feedback.',
PRIMARY KEY (`artifactID`,`memberID`),
INDEX `ArtifactFeedbacks_idx_artifactID` (`artifactID`),
INDEX `ArtifactFeedbacks_idx_memberID` (`memberID`),
INDEX `ArtifactFeedbacks_idx_artifactID_memberID` (`artifactID`, `memberID`),
CONSTRAINT `ArtifactFeedbacks_ibfk_1` FOREIGN KEY (`memberID`) REFERENCES `Members` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
CONSTRAINT `ArtifactFeedbacks_ibfk_2` FOREIGN KEY (`artifactID`) REFERENCES `Artifacts` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

