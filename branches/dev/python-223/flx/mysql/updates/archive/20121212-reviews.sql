--
-- Table structure for table `ArtifactFeedbackReviews`
--

DROP TABLE IF EXISTS `ArtifactFeedbackReviews`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `ArtifactFeedbackReviews` (
`id` int(11) NOT NULL AUTO_INCREMENT,
`artifactID` int(11) NOT NULL COMMENT 'The artifact ID.',
`memberID` int(11) NOT NULL COMMENT 'The cK-12 member id.',
`type` ENUM('rating', 'vote') NULL ,
`reviewersMemberID` int(11) NOT NULL COMMENT 'The cK-12 member id.',
`reviewComment` varchar(16383) DEFAULT NULL COMMENT 'Review comments from the member.',
`creationTime` timestamp NOT NULL DEFAULT '0000-00-00 00:00:00' COMMENT 'The creation time of this feedback review.',
`updationTime` timestamp NOT NULL DEFAULT '0000-00-00 00:00:00' COMMENT 'The updation time of this feedback review.',
CONSTRAINT `ArtifactFeedbackReviews_ibpk_1` PRIMARY KEY (`id`),
CONSTRAINT `ArtifactFeedbackReviews_ibfk_1` FOREIGN KEY (`artifactID`,`memberID`, `type`) REFERENCES `ArtifactFeedbacks` (`artifactID`,`memberID`, `type`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `ArtifactFeedbackHelpful`
--
DROP TABLE IF EXISTS `ArtifactFeedbackHelpful`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `ArtifactFeedbackHelpful` (
`artifactID` int(11) NOT NULL COMMENT 'The artifact ID.',
`memberID` int(11) NOT NULL COMMENT 'The cK-12 member id.',
`type` ENUM('rating', 'vote') NULL ,
`reviewersMemberID` int(11) NOT NULL COMMENT 'The cK-12 member id.',
`isHelpful` tinyint(1) NOT NULL COMMENT 'Indicates if the artifact feedback is helpful',
CONSTRAINT `ArtifactFeedbackHelpful_ibpk_1` PRIMARY KEY (`artifactID`, `memberID`, `type`, `reviewersMemberID`),
CONSTRAINT `ArtifactFeedbackHelpful_ibfk_1` FOREIGN KEY (`artifactID`,`memberID`, `type`) REFERENCES `ArtifactFeedbacks` (`artifactID`,`memberID`, `type`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;


