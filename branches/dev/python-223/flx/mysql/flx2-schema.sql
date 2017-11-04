-- MySQL dump 10.13  Distrib 5.5.31, for debian-linux-gnu (x86_64)
--
-- Host: localhost    Database: flx2
-- ------------------------------------------------------
-- Server version	5.5.31-0ubuntu0.12.04.1

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `AbuseReasons`
--

DROP TABLE IF EXISTS `AbuseReasons`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `AbuseReasons` (
  `id` smallint(6) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL COMMENT 'The abuse reason type name',
  `description` varchar(2047) DEFAULT NULL COMMENT 'The abuse reason type description',
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8 ROW_FORMAT=COMPACT COMMENT='AbuseReasons';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `AbuseReports`
--

DROP TABLE IF EXISTS `AbuseReports`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `AbuseReports` (
  `id` int(11) NOT NULL AUTO_INCREMENT COMMENT 'The object id',
  `resourceRevisionID` int(11) DEFAULT NULL COMMENT 'The id of the resource for which the abuse is reported',
  `artifactID` int(11) DEFAULT NULL COMMENT 'The id of the artifact for which the abuse is reported',
  `reason` varchar(512) DEFAULT NULL COMMENT 'The reason for abuse report',
  `reporterID` int(11) DEFAULT NULL COMMENT 'The id of the member reporting abuse',
  `created` timestamp NOT NULL DEFAULT '0000-00-00 00:00:00' COMMENT 'The time of creating the request.',
  `updated` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'The request update time.',
  `status` varchar(20) NOT NULL DEFAULT 'reported' COMMENT 'The current status of this request',
  `remark` varchar(1023) DEFAULT NULL COMMENT 'The administrator remark',
  `reviewerID` int(11) DEFAULT NULL COMMENT 'The id of the reviewing administrator',
  `reasonID` smallint(6) DEFAULT NULL,
  `imageUrl` varchar(2047) DEFAULT NULL COMMENT 'The image url depicting the issue - a screenshot',
  `userAgent` varchar(511) DEFAULT NULL COMMENT 'The clients user-agent information.',
  PRIMARY KEY (`id`),
  KEY `AbuseReports_ibfk_1` (`resourceRevisionID`),
  KEY `AbuseReports_ibfk_2` (`reporterID`),
  KEY `AbuseReports_ibfk_3` (`reviewerID`),
  KEY `AbuseReports_ibfk_4` (`reasonID`),
  KEY `AbuseReports_ibfk_5` (`artifactID`),
  CONSTRAINT `AbuseReports_ibfk_1` FOREIGN KEY (`resourceRevisionID`) REFERENCES `ResourceRevisions` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `AbuseReports_ibfk_2` FOREIGN KEY (`reporterID`) REFERENCES `Members` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `AbuseReports_ibfk_3` FOREIGN KEY (`reviewerID`) REFERENCES `Members` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `AbuseReports_ibfk_4` FOREIGN KEY (`reasonID`) REFERENCES `AbuseReasons` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `AbuseReports_ibfk_5` FOREIGN KEY (`artifactID`) REFERENCES `Artifacts` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8 ROW_FORMAT=COMPACT COMMENT='Abuse Report';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `AccessControls`
--

DROP TABLE IF EXISTS `AccessControls`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `AccessControls` (
  `roleID` int(11) NOT NULL COMMENT 'The work group id.',
  `actionTypeID` smallint(6) NOT NULL COMMENT 'The cK-12 member id.',
  `isAllowed` tinyint(1) DEFAULT NULL COMMENT 'Is this action allowed by this role?',
  PRIMARY KEY (`roleID`,`actionTypeID`),
  KEY `AccessControls_ibfk_2` (`actionTypeID`),
  CONSTRAINT `AccessControls_ibfk_1` FOREIGN KEY (`roleID`) REFERENCES `MemberRoles` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `AccessControls_ibfk_2` FOREIGN KEY (`actionTypeID`) REFERENCES `ActionTypes` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `ActionTypes`
--

DROP TABLE IF EXISTS `ActionTypes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `ActionTypes` (
  `id` smallint(6) NOT NULL AUTO_INCREMENT COMMENT 'The auto generated action id.',
  `name` varchar(63) NOT NULL COMMENT 'The action type name.',
  `description` varchar(511) DEFAULT NULL COMMENT 'The description of this action.',
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Temporary table structure for view `ArtifactAndChildren`
--

DROP TABLE IF EXISTS `ArtifactAndChildren`;
/*!50000 DROP VIEW IF EXISTS `ArtifactAndChildren`*/;
SET @saved_cs_client     = @@character_set_client;
SET character_set_client = utf8;
/*!50001 CREATE TABLE `ArtifactAndChildren` (
  `id` tinyint NOT NULL,
  `artifactTypeID` tinyint NOT NULL,
  `childID` tinyint NOT NULL,
  `sequence` tinyint NOT NULL
) ENGINE=MyISAM */;
SET character_set_client = @saved_cs_client;

--
-- Temporary table structure for view `ArtifactAndResources`
--

DROP TABLE IF EXISTS `ArtifactAndResources`;
/*!50001 DROP VIEW IF EXISTS `ArtifactAndResources`*/;
SET @saved_cs_client     = @@character_set_client;
SET character_set_client = utf8;
/*!50001 CREATE TABLE `ArtifactAndResources` (
  `artifactID` tinyint NOT NULL,
  `artifactTypeID` tinyint NOT NULL,
  `id` tinyint NOT NULL,
  `resourceTypeID` tinyint NOT NULL,
  `name` tinyint NOT NULL,
  `handle` tinyint NOT NULL,
  `description` tinyint NOT NULL,
  `authors` tinyint NOT NULL,
  `license` tinyint NOT NULL,
  `uri` tinyint NOT NULL,
  `refHash` tinyint NOT NULL,
  `ownerID` tinyint NOT NULL,
  `languageID` tinyint NOT NULL,
  `isExternal` tinyint NOT NULL,
  `creationTime` tinyint NOT NULL,
  `isAttachment` tinyint NOT NULL,
  `checksum` tinyint NOT NULL,
  `satelliteUrl` tinyint NOT NULL
) ENGINE=MyISAM */;
SET character_set_client = @saved_cs_client;

--
-- Temporary table structure for view `ArtifactAndRevisions`
--

DROP TABLE IF EXISTS `ArtifactAndRevisions`;
/*!50001 DROP VIEW IF EXISTS `ArtifactAndRevisions`*/;
SET @saved_cs_client     = @@character_set_client;
SET character_set_client = utf8;
/*!50001 CREATE TABLE `ArtifactAndRevisions` (
  `id` tinyint NOT NULL,
  `artifactTypeID` tinyint NOT NULL,
  `encodedID` tinyint NOT NULL,
  `name` tinyint NOT NULL,
  `description` tinyint NOT NULL,
  `handle` tinyint NOT NULL,
  `creatorID` tinyint NOT NULL,
  `ancestorID` tinyint NOT NULL,
  `licenseID` tinyint NOT NULL,
  `creationTime` tinyint NOT NULL,
  `updateTime` tinyint NOT NULL,
  `typeName` tinyint NOT NULL,
  `artifactRevisionID` tinyint NOT NULL,
  `revision` tinyint NOT NULL,
  `messageToUsers` tinyint NOT NULL,
  `downloads` tinyint NOT NULL,
  `favorites` tinyint NOT NULL,
  `revCreationTime` tinyint NOT NULL,
  `publishTime` tinyint NOT NULL,
  `login` tinyint NOT NULL
) ENGINE=MyISAM */;
SET character_set_client = @saved_cs_client;

--
-- Table structure for table `ArtifactAttributers`
--

DROP TABLE IF EXISTS `ArtifactAttributers`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `ArtifactAttributers` (
  `artifactID` int(11) NOT NULL COMMENT 'The artifact id.',
  `roleID` int(11) NOT NULL DEFAULT '3' COMMENT 'The author/contributor role',
  `memberID` int(11) DEFAULT NULL COMMENT 'The optional member id.',
  `givenName` varchar(63) NOT NULL COMMENT 'The given (first) name of this attributer.',
  `middleName` varchar(10) NOT NULL DEFAULT '' COMMENT 'The middle name of this attributer.',
  `surname` varchar(63) NOT NULL DEFAULT '' COMMENT 'The surname (last name) of this attributer.',
  `prefix` varchar(10) DEFAULT NULL COMMENT 'The title of this attributer.',
  `suffix` varchar(10) DEFAULT NULL COMMENT 'The suffix of this attributer.',
  `email` varchar(255) DEFAULT NULL COMMENT 'The email address of this attributer.',
  `url` varchar(2047) DEFAULT NULL COMMENT 'The url of this attributer.',
  `institution` varchar(127) NOT NULL DEFAULT '' COMMENT 'The institution of this attributer.',
  PRIMARY KEY (`artifactID`,`roleID`,`givenName`,`middleName`,`surname`,`institution`),
  KEY `ArtifactAttributers_ibfk_2` (`roleID`),
  KEY `ArtifactAttributers_ibfk_3` (`memberID`),
  CONSTRAINT `ArtifactAttributers_ibfk_1` FOREIGN KEY (`artifactID`) REFERENCES `Artifacts` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `ArtifactAttributers_ibfk_2` FOREIGN KEY (`roleID`) REFERENCES `MemberRoles` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `ArtifactAttributers_ibfk_3` FOREIGN KEY (`memberID`) REFERENCES `Members` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COMMENT='The common metadata for attributers.';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `ArtifactAuthors`
--

DROP TABLE IF EXISTS `ArtifactAuthors`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `ArtifactAuthors` (
  `artifactID` int(11) NOT NULL COMMENT 'The artifact id.',
  `name` varchar(255) NOT NULL DEFAULT '',
  `roleID` int(11) NOT NULL DEFAULT '3' COMMENT 'The author/contributor role',
  `sequence` smallint(6) DEFAULT '1' COMMENT 'List order of the authors.',
  PRIMARY KEY (`artifactID`,`name`,`roleID`),
  KEY `ArtifactAuthors_ibfk_2` (`roleID`),
  CONSTRAINT `ArtifactAuthors_ibfk_1` FOREIGN KEY (`artifactID`) REFERENCES `Artifacts` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `ArtifactAuthors_ibfk_2` FOREIGN KEY (`roleID`) REFERENCES `MemberRoles` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COMMENT='The common metadata for authors.';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Temporary table structure for view `ArtifactDomainAndStandards`
--

DROP TABLE IF EXISTS `ArtifactDomainAndStandards`;
/*!50001 DROP VIEW IF EXISTS `ArtifactDomainAndStandards`*/;
SET @saved_cs_client     = @@character_set_client;
SET character_set_client = utf8;
/*!50001 CREATE TABLE `ArtifactDomainAndStandards` (
  `artifactID` tinyint NOT NULL,
  `browseTermID` tinyint NOT NULL,
  `encodedID` tinyint NOT NULL,
  `termName` tinyint NOT NULL,
  `standardID` tinyint NOT NULL,
  `section` tinyint NOT NULL,
  `title` tinyint NOT NULL,
  `description` tinyint NOT NULL,
  `boardID` tinyint NOT NULL,
  `boardName` tinyint NOT NULL,
  `countryID` tinyint NOT NULL,
  `subjectID` tinyint NOT NULL,
  `subjectName` tinyint NOT NULL
) ENGINE=MyISAM */;
SET character_set_client = @saved_cs_client;

--
-- Temporary table structure for view `ArtifactDomainsStandardsGradesAndBrowseTerms`
--

DROP TABLE IF EXISTS `ArtifactDomainsStandardsGradesAndBrowseTerms`;
/*!50001 DROP VIEW IF EXISTS `ArtifactDomainsStandardsGradesAndBrowseTerms`*/;
SET @saved_cs_client     = @@character_set_client;
SET character_set_client = utf8;
/*!50001 CREATE TABLE `ArtifactDomainsStandardsGradesAndBrowseTerms` (
  `artifactID` tinyint NOT NULL,
  `standardID` tinyint NOT NULL,
  `section` tinyint NOT NULL,
  `title` tinyint NOT NULL,
  `boardID` tinyint NOT NULL,
  `boardName` tinyint NOT NULL,
  `boardLongName` tinyint NOT NULL,
  `sequence` tinyint NOT NULL,
  `countryID` tinyint NOT NULL,
  `termID` tinyint NOT NULL,
  `termTypeID` tinyint NOT NULL,
  `termName` tinyint NOT NULL,
  `parentID` tinyint NOT NULL,
  `encodedID` tinyint NOT NULL,
  `gradeID` tinyint NOT NULL,
  `gradeName` tinyint NOT NULL
) ENGINE=MyISAM */;
SET character_set_client = @saved_cs_client;

--
-- Temporary table structure for view `ArtifactFeedbackAndCount`
--

DROP TABLE IF EXISTS `ArtifactFeedbackAndCount`;
/*!50001 DROP VIEW IF EXISTS `ArtifactFeedbackAndCount`*/;
SET @saved_cs_client     = @@character_set_client;
SET character_set_client = utf8;
/*!50001 CREATE TABLE `ArtifactFeedbackAndCount` (
  `artifactID` tinyint NOT NULL,
  `type` tinyint NOT NULL,
  `score` tinyint NOT NULL,
  `count` tinyint NOT NULL
) ENGINE=MyISAM */;
SET character_set_client = @saved_cs_client;

--
-- Table structure for table `ArtifactFeedbackHelpful`
--

DROP TABLE IF EXISTS `ArtifactFeedbackHelpful`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `ArtifactFeedbackHelpful` (
  `artifactID` int(11) NOT NULL COMMENT 'The artifact ID.',
  `memberID` int(11) NOT NULL COMMENT 'The cK-12 member id.',
  `type` enum('rating','vote') NOT NULL DEFAULT 'rating',
  `reviewersMemberID` int(11) NOT NULL COMMENT 'The cK-12 member id.',
  `isHelpful` tinyint(1) NOT NULL COMMENT 'Indicates if the artifact feedback is helpful',
  PRIMARY KEY (`artifactID`,`memberID`,`type`,`reviewersMemberID`),
  CONSTRAINT `ArtifactFeedbackHelpful_ibfk_1` FOREIGN KEY (`artifactID`, `memberID`, `type`) REFERENCES `ArtifactFeedbacks` (`artifactID`, `memberID`, `type`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

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
  `type` enum('rating','vote') DEFAULT NULL,
  `reviewersMemberID` int(11) NOT NULL COMMENT 'The cK-12 member id.',
  `reviewComment` varchar(16383) DEFAULT NULL COMMENT 'Review comments from the member.',
  `notAbuse` BOOL DEFAULT 0 COMMENT 'This field is set to TRUE when admin has checked and verified that this feedbackReview is not an Abuse, after some abuse reported',
  `creationTime` timestamp NOT NULL DEFAULT '0000-00-00 00:00:00' COMMENT 'The creation time of this feedback review.',
  `updationTime` timestamp NOT NULL DEFAULT '0000-00-00 00:00:00' COMMENT 'The updation time of this feedback review.',
  PRIMARY KEY (`id`),
  KEY `ArtifactFeedbackReviews_ibfk_1` (`artifactID`,`memberID`,`type`),
  CONSTRAINT `ArtifactFeedbackReviews_ibfk_1` FOREIGN KEY (`artifactID`, `memberID`, `type`) REFERENCES `ArtifactFeedbacks` (`artifactID`, `memberID`, `type`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB AUTO_INCREMENT=33 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `ArtifactFeedbacks`
--

DROP TABLE IF EXISTS `ArtifactFeedbacks`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `ArtifactFeedbacks` (
  `artifactID` int(11) NOT NULL COMMENT 'The artifact ID.',
  `memberID` int(11) NOT NULL COMMENT 'The cK-12 member id.',
  `score` smallint(6) DEFAULT NULL COMMENT 'Feedback from the member.',
  `type` enum('rating','vote','relevance','creativity','clarity','impactful') NOT NULL DEFAULT 'rating' COMMENT 'The type of the feedback',
  `comments` varchar(16383) DEFAULT NULL COMMENT 'Comments from the member.',
  `isApproved` tinyint(1) NOT NULL COMMENT 'Artifact feedback is approved or not',
  `notAbuse` BOOL DEFAULT 0 COMMENT 'This field is set to TRUE when admin has checked and verified that this feedback is not an Abuse, after some abuse reported',
  `creationTime` timestamp NOT NULL DEFAULT '0000-00-00 00:00:00' COMMENT 'The creation time of this feedback.',
  PRIMARY KEY (`artifactID`,`memberID`,`type`),
  KEY `ArtifactFeedbacks_idx_artifactID` (`artifactID`),
  KEY `ArtifactFeedbacks_idx_memberID` (`memberID`),
  KEY `ArtifactFeedbacks_idx_artifactID_memberID` (`artifactID`,`memberID`),
  KEY `ArtifactFeedbacks_idx_score` (`score`),
  CONSTRAINT `ArtifactFeedbacks_ibfk_1` FOREIGN KEY (`memberID`) REFERENCES `Members` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `ArtifactFeedbacks_ibfk_2` FOREIGN KEY (`artifactID`) REFERENCES `Artifacts` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

DROP TABLE IF EXISTS `ArtifactFeedbackAbuseReports`;

CREATE TABLE `ArtifactFeedbackAbuseReports` (
    `artifactID` int(11) NOT NULL,
    `memberID` int(11) NOT NULL,
    `reporterMemberID` int(11) NOT NULL,
    `comments` varchar(511) DEFAULT NULL,
    `creationTime` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY(`artifactID`, `memberID`, `reporterMemberID`), 
    CONSTRAINT `ArtifactFeedbackAbuseReports_ibfk_1` FOREIGN KEY (`artifactID`) REFERENCES `Artifacts` (`id`) ON DELETE CASCADE ON UPDATE NO ACTION,
    CONSTRAINT `ArtifactFeedbackAbuseReports_ibfk_2` FOREIGN KEY (`memberID`) REFERENCES `Members` (`id`) ON DELETE CASCADE ON UPDATE NO ACTION,
    CONSTRAINT `ArtifactFeedbackAbuseReports_ibfk_3` FOREIGN KEY (`reporterMemberID`) REFERENCES `Members` (`id`) ON DELETE CASCADE ON UPDATE NO ACTION
)ENGINE=InnoDB DEFAULT CHARSET=utf8 ;

DROP TABLE IF EXISTS `ArtifactFeedbackReviewAbuseReport`;

CREATE TABLE `ArtifactFeedbackReviewAbuseReports` (
    `artifactFeedbackReviewID` int(11) NOT NULL,
    `reporterMemberID` int(11) NOT NULL,
    `comments` varchar(511) DEFAULT NULL, 
    `creationTime` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY(`artifactFeedbackReviewID`, `reporterMemberID`),
    CONSTRAINT `ArtifactFeedbackReviewAbuseReports_ibfk_1` FOREIGN KEY (`artifactFeedbackReviewID`) REFERENCES `ArtifactFeedbackReviews` (`id`) ON DELETE CASCADE ON UPDATE NO ACTION,
    CONSTRAINT `ArtifactFeedbackReviewAbuseReports_ibfk_2` FOREIGN KEY (`reporterMemberID`) REFERENCES `Members` (`id`) ON DELETE CASCADE ON UPDATE NO ACTION
)ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Table structure for table `ArtifactHandles`
--

DROP TABLE IF EXISTS `ArtifactHandles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `ArtifactHandles` (
  `artifactID` int(11) NOT NULL COMMENT 'The artifact id.',
  `handle` varchar(255) NOT NULL COMMENT 'The old handle of the artifact.',
  `artifactTypeID` smallint(6) NOT NULL COMMENT 'The artifact type id.',
  `creatorID` int(11) NOT NULL COMMENT 'The creator member id.',
  PRIMARY KEY (`artifactID`,`handle`, `artifactTypeID`, `creatorID`),
  CONSTRAINT `ArtifactHandles_ibfk_1` FOREIGN KEY (`artifactID`) REFERENCES `Artifacts` (`id`) ON DELETE CASCADE ON UPDATE NO ACTION,
  CONSTRAINT `ArtifactHandles_ibfk_2` FOREIGN KEY (`creatorID`) REFERENCES `Members`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `ArtifactHandles_ibfk_3` FOREIGN KEY (`artifactTypeID`) REFERENCES `ArtifactTypes`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COMMENT='The previously used handles.';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `ArtifactHasBrowseTerms`
--

DROP TABLE IF EXISTS `ArtifactHasBrowseTerms`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `ArtifactHasBrowseTerms` (
  `artifactID` int(11) NOT NULL DEFAULT '0' COMMENT 'The artifact id.',
  `browseTermID` int(11) NOT NULL DEFAULT '0' COMMENT 'The browse term this artifact has.',
  PRIMARY KEY (`artifactID`,`browseTermID`),
  KEY `ArtifactHasBrowseTerms_ibfk_1` (`browseTermID`),
  CONSTRAINT `ArtifactHasBrowseTerms_ibfk_1` FOREIGN KEY (`browseTermID`) REFERENCES `BrowseTerms` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `ArtifactHasBrowseTerms_ibfk_2` FOREIGN KEY (`artifactID`) REFERENCES `Artifacts` (`id`) ON DELETE CASCADE ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COMMENT='The browse terms each artifact has.';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `ArtifactHasVocabularies`
--

DROP TABLE IF EXISTS `ArtifactHasVocabularies`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `ArtifactHasVocabularies` (
  `artifactID` int(11) NOT NULL DEFAULT '0' COMMENT 'The artifact id.',
  `vocabularyID` int(11) NOT NULL DEFAULT '0' COMMENT 'The vocabulary this artifact has.',
  `sequence` int(11) NOT NULL COMMENT 'The sequence number for this vocabulary',
  PRIMARY KEY (`artifactID`,`vocabularyID`),
  KEY `ArtifactHasVocabularies_ibfk_1` (`vocabularyID`),
  CONSTRAINT `ArtifactHasVocabularies_ibfk_1` FOREIGN KEY (`vocabularyID`) REFERENCES `Vocabularies` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `ArtifactHasVocabularies_ibfk_2` FOREIGN KEY (`artifactID`) REFERENCES `Artifacts` (`id`) ON DELETE CASCADE ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COMMENT='The vocabularies each artifact has.';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `ArtifactRevisionFavorites`
--

DROP TABLE IF EXISTS `ArtifactRevisionFavorites`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `ArtifactRevisionFavorites` (
  `artifactRevisionID` int(11) NOT NULL COMMENT 'The artifact revision id favorited by this member.',
  `memberID` int(11) NOT NULL COMMENT 'The CK-12 member id.',
  `creationTime` timestamp NOT NULL DEFAULT '0000-00-00 00:00:00' COMMENT 'The creation time of this favorite.',
  PRIMARY KEY (`artifactRevisionID`,`memberID`),
  KEY `ArtifactRevisionFavorites_ibfk_1` (`memberID`),
  CONSTRAINT `ArtifactRevisionFavorites_ibfk_1` FOREIGN KEY (`memberID`) REFERENCES `Members` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `ArtifactRevisionFavorites_ibfk_2` FOREIGN KEY (`artifactRevisionID`) REFERENCES `ArtifactRevisions` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COMMENT='The common metadata for favories.';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `ArtifactRevisionHasResources`
--

DROP TABLE IF EXISTS `ArtifactRevisionHasResources`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `ArtifactRevisionHasResources` (
  `artifactRevisionID` int(11) NOT NULL COMMENT 'The artifiact revision identifier.',
  `resourceRevisionID` int(11) NOT NULL COMMENT 'The resource revision owned by this artifact.',
  PRIMARY KEY (`artifactRevisionID`,`resourceRevisionID`),
  KEY `ArtifactRevisionHasResources_ibfk_2` (`resourceRevisionID`),
  CONSTRAINT `ArtifactRevisionHasResources_ibfk_1` FOREIGN KEY (`artifactRevisionID`) REFERENCES `ArtifactRevisions` (`id`) ON DELETE CASCADE ON UPDATE NO ACTION,
  CONSTRAINT `ArtifactRevisionHasResources_ibfk_2` FOREIGN KEY (`resourceRevisionID`) REFERENCES `ResourceRevisions` (`id`) ON DELETE CASCADE ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COMMENT='The resources owned by this artifact revision.';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `ArtifactRevisionHasStandards`
--

DROP TABLE IF EXISTS `ArtifactRevisionHasStandards`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `ArtifactRevisionHasStandards` (
  `artifactRevisionID` int(11) NOT NULL COMMENT 'The artifiact revision identifier.',
  `standardID` int(11) NOT NULL COMMENT 'The standard this artifact complies to.',
  PRIMARY KEY (`artifactRevisionID`,`standardID`),
  KEY `ArtifactRevisionHasStandards_ibfk_2` (`standardID`),
  CONSTRAINT `ArtifactRevisionHasStandards_ibfk_1` FOREIGN KEY (`artifactRevisionID`) REFERENCES `ArtifactRevisions` (`id`) ON DELETE CASCADE ON UPDATE NO ACTION,
  CONSTRAINT `ArtifactRevisionHasStandards_ibfk_2` FOREIGN KEY (`standardID`) REFERENCES `Standards` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COMMENT='The standards this artifact revision complies to.';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `ArtifactRevisionRelations`
--

DROP TABLE IF EXISTS `ArtifactRevisionRelations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `ArtifactRevisionRelations` (
  `artifactRevisionID` int(11) NOT NULL DEFAULT '0' COMMENT 'The parent artifact revision.',
  `hasArtifactRevisionID` int(11) NOT NULL DEFAULT '0' COMMENT 'The child artifact revision.',
  `sequence` int(11) DEFAULT NULL COMMENT 'The sequence of the child artifacts.',
  PRIMARY KEY (`artifactRevisionID`,`hasArtifactRevisionID`),
  KEY `ArtifactRevisionRelations_ibfk_1` (`hasArtifactRevisionID`),
  CONSTRAINT `ArtifactRevisionRelations_ibfk_1` FOREIGN KEY (`hasArtifactRevisionID`) REFERENCES `ArtifactRevisions` (`id`) ON DELETE CASCADE ON UPDATE NO ACTION,
  CONSTRAINT `ArtifactRevisionRelations_ibfk_2` FOREIGN KEY (`artifactRevisionID`) REFERENCES `ArtifactRevisions` (`id`) ON DELETE CASCADE ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COMMENT='The relationship between 2 artifacts.';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `ArtifactRevisions`
--

DROP TABLE IF EXISTS `ArtifactRevisions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `ArtifactRevisions` (
  `id` int(11) NOT NULL AUTO_INCREMENT COMMENT 'The auto generated id for this table.',
  `artifactID` int(11) NOT NULL COMMENT 'The artifact id.',
  `revision` varchar(255) DEFAULT NULL COMMENT 'The revision number.',
  `comment` varchar(1024) DEFAULT NULL COMMENT 'An optional log note about the revision.',
  `messageToUsers` varchar(1024) DEFAULT NULL COMMENT 'This brief message will appear on the first page or screen below the title, to explain important facts about the resource of this revision',
  `downloads` int(11) DEFAULT '0' COMMENT 'The number of downloads for this artifact revision.',
  `favorites` int(11) DEFAULT '0' COMMENT 'The number of favorites for this artifact revision.',
  `creationTime` timestamp NOT NULL DEFAULT '0000-00-00 00:00:00' COMMENT 'The creation time of the artifact revision.',
  `publishTime` timestamp NULL DEFAULT NULL COMMENT 'The publish time of this artifact revision.',
  PRIMARY KEY (`id`),
  UNIQUE KEY `artifactID` (`artifactID`,`revision`),
  KEY `ArtifactRevisions_publishTime` (`publishTime`),
  CONSTRAINT `ArtifactRevisions_ibfk_1` FOREIGN KEY (`artifactID`) REFERENCES `Artifacts` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB AUTO_INCREMENT=47794 DEFAULT CHARSET=utf8 COMMENT='The different revisions of a artifact.';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `ArtifactTypes`
--

DROP TABLE IF EXISTS `ArtifactTypes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `ArtifactTypes` (
  `id` smallint(6) NOT NULL AUTO_INCREMENT COMMENT 'The auto generated id.',
  `name` varchar(63) NOT NULL COMMENT 'The artifact type name.',
  `description` varchar(511) DEFAULT NULL COMMENT 'The description of this artifact.',
  `extensionType` varchar(31) NOT NULL COMMENT 'The artifact type extension type',
  `modality` tinyint(1) DEFAULT '0' COMMENT 'Is this artifact type a modality?',
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`),
  UNIQUE KEY `extensionType` (`extensionType`)
) ENGINE=InnoDB AUTO_INCREMENT=54 DEFAULT CHARSET=utf8 COMMENT='The artifact types.';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `Artifacts`
--

DROP TABLE IF EXISTS `Artifacts`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `Artifacts` (
  `id` int(11) NOT NULL AUTO_INCREMENT COMMENT 'The auto generated artifact id.',
  `artifactTypeID` smallint(6) NOT NULL COMMENT 'The artifact type id.',
  `encodedID` varchar(255) DEFAULT NULL COMMENT 'The concept id',
  `name` varchar(255) NOT NULL COMMENT 'The name or title of the artifact.',
  `description` varchar(4095) DEFAULT NULL COMMENT 'The description of this artifact.',
  `handle` varchar(255) NOT NULL COMMENT 'The handle of the artifact. Used for perma URL',
  `creatorID` int(11) NOT NULL COMMENT 'The creator of this artifact.',
  `ancestorID` int(11) DEFAULT NULL COMMENT 'The artifact revision this artifact derived from.',
  `licenseID` smallint(6) DEFAULT NULL COMMENT 'The license for this artifact',
  `languageID` smallint(6) NOT NULL DEFAULT 1 COMMENT 'The language for this artifact',
  `creationTime` timestamp NOT NULL DEFAULT '0000-00-00 00:00:00' COMMENT 'The creation time of the entry.',
  `updateTime` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'The last modified time.',
  PRIMARY KEY (`id`),
  UNIQUE KEY `handle` (`handle`,`creatorID`,`artifactTypeID`),
  UNIQUE KEY `encodedID` (`encodedID`),
  KEY `name` (`name`),
  KEY `Artifacts_creationTime` (`creationTime`),
  CONSTRAINT `Artifacts_ibfk_1` FOREIGN KEY (`artifactTypeID`) REFERENCES `ArtifactTypes` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `Artifacts_ibfk_2` FOREIGN KEY (`creatorID`) REFERENCES `Members` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `Artifacts_ibfk_3` FOREIGN KEY (`ancestorID`) REFERENCES `ArtifactRevisions` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `Artifacts_ibfk_4` FOREIGN KEY (`licenseID`) REFERENCES `Licenses` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `Artifacts_ibfk_5` FOREIGN KEY (`languageID`) REFERENCES `Languages` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB AUTO_INCREMENT=24407 DEFAULT CHARSET=utf8 COMMENT='The common metadata for artifacts.';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Temporary table structure for view `ArtifactsAndBrowseTerms`
--

DROP TABLE IF EXISTS `ArtifactsAndBrowseTerms`;
/*!50001 DROP VIEW IF EXISTS `ArtifactsAndBrowseTerms`*/;
SET @saved_cs_client     = @@character_set_client;
SET character_set_client = utf8;
/*!50001 CREATE TABLE `ArtifactsAndBrowseTerms` (
  `id` tinyint NOT NULL,
  `artifactTypeID` tinyint NOT NULL,
  `creatorID` tinyint NOT NULL,
  `browseTermID` tinyint NOT NULL,
  `name` tinyint NOT NULL,
  `handle` tinyint NOT NULL,
  `termTypeID` tinyint NOT NULL,
  `parentID` tinyint NOT NULL,
  `encodedID` tinyint NOT NULL
) ENGINE=MyISAM */;
SET character_set_client = @saved_cs_client;

--
-- Temporary table structure for view `ArtifactsAndVocabularies`
--

DROP TABLE IF EXISTS `ArtifactsAndVocabularies`;
/*!50001 DROP VIEW IF EXISTS `ArtifactsAndVocabularies`*/;
SET @saved_cs_client     = @@character_set_client;
SET character_set_client = utf8;
/*!50001 CREATE TABLE `ArtifactsAndVocabularies` (
  `id` tinyint NOT NULL,
  `artifactTypeID` tinyint NOT NULL,
  `encodedID` tinyint NOT NULL,
  `vocabularyID` tinyint NOT NULL,
  `term` tinyint NOT NULL,
  `definition` tinyint NOT NULL,
  `sequence` tinyint NOT NULL,
  `languageCode` tinyint NOT NULL,
  `languageName` tinyint NOT NULL
) ENGINE=MyISAM */;
SET character_set_client = @saved_cs_client;

--
-- Temporary table structure for view `ArtifactsStandardsGradesAndBrowseTerms`
--

DROP TABLE IF EXISTS `ArtifactsStandardsGradesAndBrowseTerms`;
/*!50001 DROP VIEW IF EXISTS `ArtifactsStandardsGradesAndBrowseTerms`*/;
SET @saved_cs_client     = @@character_set_client;
SET character_set_client = utf8;
/*!50001 CREATE TABLE `ArtifactsStandardsGradesAndBrowseTerms` (
  `artifactID` tinyint NOT NULL,
  `id` tinyint NOT NULL,
  `section` tinyint NOT NULL,
  `title` tinyint NOT NULL,
  `boardID` tinyint NOT NULL,
  `boardName` tinyint NOT NULL,
  `boardLongName` tinyint NOT NULL,
  `sequence` tinyint NOT NULL,
  `countryID` tinyint NOT NULL,
  `termID` tinyint NOT NULL,
  `termTypeID` tinyint NOT NULL,
  `termName` tinyint NOT NULL,
  `parentID` tinyint NOT NULL,
  `encodedID` tinyint NOT NULL,
  `gradeID` tinyint NOT NULL,
  `gradeName` tinyint NOT NULL
) ENGINE=MyISAM */;
SET character_set_client = @saved_cs_client;

--
-- Table structure for table `Assignments`
--

DROP TABLE IF EXISTS `Assignments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `Assignments` (
  `assignmentID` int(11) NOT NULL COMMENT 'The artifact id of this assignment.',
  `groupID` int(11) DEFAULT NULL COMMENT 'The id of the group getting this assignment.',
  `assignmentType` enum('assignment','self-assignment','self-study') NOT NULL DEFAULT 'assignment' COMMENT 'The type of this study track. The self-study type is created automatically when the student just randomly practicing without an assignment.',
  `origin` enum('ck-12','lms') NOT NULL DEFAULT 'ck-12' COMMENT 'The origin of this assignment.',
  `due` timestamp NULL DEFAULT NULL COMMENT 'The study track due time.',
  PRIMARY KEY (`assignmentID`),
  KEY `Assignments_type` (`assignmentType`),
  KEY `Assignments_due` (`due`),
  CONSTRAINT `Assignments_assignment_ibfk_1` FOREIGN KEY (`assignmentID`) REFERENCES `Artifacts` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `Assignments_group_ibfk_2` FOREIGN KEY (`groupID`) REFERENCES `Groups` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `MemberStudyTrackItemStatus`
--

DROP TABLE IF EXISTS `MemberStudyTrackItemStatus`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `MemberStudyTrackItemStatus` (
  `memberID` int(11) NOT NULL COMMENT 'The member id.',
  `assignmentID` int(11) NOT NULL COMMENT 'The artifact id of the assignment for member identified by memberID.',
  `studyTrackItemID` int(11) NOT NULL COMMENT 'The id of the study track item for member identified by memberID.',
  `status` enum('completed', 'skipped', 'incomplete') DEFAULT 'incomplete' COMMENT 'The status of this item.',
  `score` smallint(6) DEFAULT NULL COMMENT 'The score in the form of percentage x 100, e.g., 6180 is 61.8%. For items with no practice, this field will be NULL.',
  `lastAccess` timestamp NULL DEFAULT 0 COMMENT 'The most recent access time. The value NULL means not yet access.',
  PRIMARY KEY (`memberID`, `assignmentID`, `studyTrackItemID`),
  KEY `MemberStudyTrackItemStatus_status` (`status`),
  KEY `MemberStudyTrackItemStatus_score` (`score`),
  KEY `MemberStudyTrackItemStatus_lastAccess` (`lastAccess`),
  CONSTRAINT `MemberStudyTrackItemStatus_member_ibfk_1` FOREIGN KEY (`memberID`) REFERENCES `Members` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `MemberStudyTrackItemStatus_assignment_ibfk_2` FOREIGN KEY (`assignmentID`) REFERENCES `Assignments` (`assignmentID`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `MemberStudyTrackItemStatus_item_ibfk_3` FOREIGN KEY (`studyTrackItemID`) REFERENCES `Artifacts` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `StudyTrackItemContexts`
--

DROP TABLE IF EXISTS `StudyTrackItemContexts`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `StudyTrackItemContexts` (
  `studyTrackID` int(11) NOT NULL COMMENT 'The study track id.',
  `studyTrackItemID` int(11) NOT NULL COMMENT 'The id of the study track item.',
  `contextUrl` varchar(1024) NOT NULL DEFAULT '' COMMENT 'The context url for study track item.',
  `conceptCollectionHandle` VARCHAR(255) NOT NULL DEFAULT '' COMMENT 'The conceptCollectionHandle for the studyTrackID',
  `collectionCreatorID` int(11) NOT NULL DEFAULT 0 COMMENT 'The cK-12 member id.',
  PRIMARY KEY (`studyTrackID`, `studyTrackItemID`, `conceptCollectionHandle`, `collectionCreatorID`),
  CONSTRAINT `StudyTrackItemContexts_ibfk_1` FOREIGN KEY (`studyTrackID`) REFERENCES `Artifacts` (`id`) ON DELETE CASCADE ON UPDATE NO ACTION,
  CONSTRAINT `StudyTrackItemContexts_ibfk_2` FOREIGN KEY (`studyTrackItemID`) REFERENCES `Artifacts` (`id`) ON DELETE CASCADE ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `BrowseTermCandidates`
--

DROP TABLE IF EXISTS `BrowseTermCandidates`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `BrowseTermCandidates` (
  `categoryID` int(11) NOT NULL COMMENT 'The category id',
  `rangeStart` varchar(255) NOT NULL COMMENT 'The start of candidate range',
  `rangeEnd` varchar(255) NOT NULL COMMENT 'The end of candidate range',
  `sequence` int(11) NOT NULL DEFAULT '999' COMMENT 'The sequence number for this candidate - the order is preserved during browse',
  PRIMARY KEY (`categoryID`,`rangeStart`,`rangeEnd`),
  CONSTRAINT `BrowseTermCandidates_ibfk_1` FOREIGN KEY (`categoryID`) REFERENCES `BrowseTerms` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8 ROW_FORMAT=COMPACT COMMENT='Browse category candidates.';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `BrowseTermHasSynonyms`
--

DROP TABLE IF EXISTS `BrowseTermHasSynonyms`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `BrowseTermHasSynonyms` (
  `termID` int(11) NOT NULL COMMENT 'The term ID.',
  `synonymTermID` int(11) NOT NULL COMMENT 'The ID of synonymous term.',
  PRIMARY KEY (`termID`,`synonymTermID`),
  KEY `BrowseTermHasSynonyms_ibfk_1` (`synonymTermID`),
  CONSTRAINT `BrowseTermHasSynonyms_ibfk_1` FOREIGN KEY (`synonymTermID`) REFERENCES `BrowseTerms` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `BrowseTermHasSynonyms_ibfk_2` FOREIGN KEY (`termID`) REFERENCES `BrowseTerms` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COMMENT='The available browse term synonyms.';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `BrowseTermTypes`
--

DROP TABLE IF EXISTS `BrowseTermTypes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `BrowseTermTypes` (
  `id` smallint(6) NOT NULL AUTO_INCREMENT COMMENT 'The auto generated id.',
  `name` varchar(255) NOT NULL COMMENT 'The browse term type name.',
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8 COMMENT='The types of browse terms.';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `BrowseTerms`
--

DROP TABLE IF EXISTS `BrowseTerms`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `BrowseTerms` (
  `id` int(11) NOT NULL AUTO_INCREMENT COMMENT 'The auto generated id.',
  `name` varchar(255) NOT NULL COMMENT 'The term name.',
  `encodedID` varchar(255) DEFAULT NULL COMMENT 'The encoded id for the term.',
  `termTypeID` smallint(6) NOT NULL COMMENT 'The type of this term.',
  `parentID` int(11) DEFAULT NULL COMMENT 'The id of the parent term.',
  `handle` varchar(255) DEFAULT NULL COMMENT 'The term handle.',
  `description` varchar(1023) DEFAULT NULL COMMENT 'The description for the term',
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`,`parentID`,`termTypeID`),
  UNIQUE KEY `encodedID` (`encodedID`),
  UNIQUE KEY `handle` (`handle`,`termTypeID`),
  KEY `BrowseTerms_ibfk_2` (`parentID`),
  KEY `BrowseTerms_ibfk_1` (`termTypeID`),
  CONSTRAINT `BrowseTerms_ibfk_1` FOREIGN KEY (`termTypeID`) REFERENCES `BrowseTermTypes` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `BrowseTerms_ibfk_2` FOREIGN KEY (`parentID`) REFERENCES `BrowseTerms` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB AUTO_INCREMENT=19741 DEFAULT CHARSET=utf8 COMMENT='The available browse terms.';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `TagTerms`
--

DROP TABLE IF EXISTS `TagTerms`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE TagTerms (
    id int(11) NOT NULL auto_increment,
    name VARCHAR(255) NOT NULL,
    PRIMARY KEY (id),
    UNIQUE (name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `ArtifactHasTagTerms`
--

DROP TABLE IF EXISTS `ArtifactHasTagTerms`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `ArtifactHasTagTerms` (
    `artifactID` int(11) NOT NULL DEFAULT '0' COMMENT 'The artifact id.',
    `tagTermID` int(11) NOT NULL DEFAULT '0' COMMENT 'The tag term this artifact has.',
    PRIMARY KEY (`artifactID`,`tagTermID`),
    KEY `ArtifactHasTagTerms_ibfk_1` (`tagTermID`),
    CONSTRAINT `ArtifactHasTagTerms_ibfk_1` FOREIGN KEY (`tagTermID`) REFERENCES `TagTerms` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
    CONSTRAINT `ArtifactHasTagTerms_ibfk_2` FOREIGN KEY (`artifactID`) REFERENCES `Artifacts` (`id`) ON DELETE CASCADE ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COMMENT='The tag terms each artifact has.';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `SearchTerms`
--

DROP TABLE IF EXISTS `SearchTerms`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE SearchTerms (
    id int(11) NOT NULL auto_increment,
    name VARCHAR(255) NOT NULL,
    PRIMARY KEY (id),
    UNIQUE (name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `ArtifactHasSearchTerms`
--

DROP TABLE IF EXISTS `ArtifactHasSearchTerms`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `ArtifactHasSearchTerms` (
    `artifactID` int(11) NOT NULL DEFAULT '0' COMMENT 'The artifact id.',
    `searchTermID` int(11) NOT NULL DEFAULT '0' COMMENT 'The search term this artifact has.',
    PRIMARY KEY (`artifactID`,`searchTermID`),
    KEY `ArtifactHasSearchTerms_ibfk_1` (`searchTermID`),
    CONSTRAINT `ArtifactHasSearchTerms_ibfk_1` FOREIGN KEY (`searchTermID`) REFERENCES `SearchTerms` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
    CONSTRAINT `ArtifactHasSearchTerms_ibfk_2` FOREIGN KEY (`artifactID`) REFERENCES `Artifacts` (`id`) ON DELETE CASCADE ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COMMENT='The search terms each artifact has.';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `CampaignMembers`
--

DROP TABLE IF EXISTS `CampaignMembers`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `CampaignMembers` (
  `campaignID` varchar(255) NOT NULL COMMENT 'The campaign identifier.',
  `memberID` int(11) NOT NULL COMMENT 'The identifier of the member in this campaign.',
  PRIMARY KEY (`campaignID`,`memberID`),
  KEY `CampaignMembers_ibfk_1` (`memberID`),
  CONSTRAINT `CampaignMembers_ibfk_1` FOREIGN KEY (`memberID`) REFERENCES `Members` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COMMENT='Members in campaigns.';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `ContentRevisions`
--

DROP TABLE IF EXISTS `ContentRevisions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `ContentRevisions` (
  `id` int(11) NOT NULL AUTO_INCREMENT COMMENT 'The revision id.',
  `creationTime` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'The creation time.',
  `log` varchar(4095) NOT NULL COMMENT 'The log message of this revision.',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=45765 DEFAULT CHARSET=utf8 ROW_FORMAT=COMPACT COMMENT='ContentRevisions';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `Contents`
--

DROP TABLE IF EXISTS `Contents`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `Contents` (
  `resourceURI` varchar(255) NOT NULL COMMENT 'The resource URI.',
  `ownerID` int(11) NOT NULL COMMENT 'The owner of this contents.',
  `contentRevisionID` int(11) NOT NULL COMMENT 'The revision.',
  `creationTime` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'The creation time.',
  `contents` mediumblob NOT NULL COMMENT 'The contents.',
  `checksum` varchar(256) DEFAULT NULL COMMENT 'The contents checksum.',
  `compressed` tinyint(1) DEFAULT '0' COMMENT '1 => contents compressed; 0 => not',
  PRIMARY KEY (`resourceURI`,`ownerID`,`contentRevisionID`),
  KEY `Contents_ibfk_2` (`contentRevisionID`),
  KEY `compress` (`compressed`),
  CONSTRAINT `Contents_ibfk_1` FOREIGN KEY (`resourceURI`, `ownerID`) REFERENCES `Resources` (`uri`, `ownerID`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `Contents_ibfk_2` FOREIGN KEY (`contentRevisionID`) REFERENCES `ContentRevisions` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8 ROW_FORMAT=COMPACT COMMENT='Contents';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `Countries`
--

DROP TABLE IF EXISTS `Countries`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `Countries` (
  `id` int(11) NOT NULL AUTO_INCREMENT COMMENT 'The auto generated id.',
  `name` varchar(63) NOT NULL COMMENT 'The ISO country name.',
  `code2Letter` varchar(2) DEFAULT NULL COMMENT 'The 2-letter code.',
  `code3Letter` varchar(3) DEFAULT NULL COMMENT 'The 3-letter code.',
  `codeNumeric` smallint(6) DEFAULT NULL COMMENT 'The numeric code.',
  `image` varchar(255) DEFAULT NULL COMMENT 'The URL of the image that represents the country.',
  `creationTime` timestamp NOT NULL DEFAULT '0000-00-00 00:00:00' COMMENT 'The creation time of the entry.',
  `updateTime` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'The last modified time.',
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`),
  UNIQUE KEY `code2Letter` (`code2Letter`),
  UNIQUE KEY `code3Letter` (`code3Letter`),
  UNIQUE KEY `codeNumeric` (`codeNumeric`)
) ENGINE=InnoDB AUTO_INCREMENT=248 DEFAULT CHARSET=utf8 COMMENT='Country information.';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `Courses`
--
DROP TABLE IF EXISTS `Courses`;

CREATE TABLE `Courses` (
  `handle` varchar(50) NOT NULL COMMENT 'The course handle for url.',
  `shortName` varchar(10) NOT NULL COMMENT 'The unique short name for a course',  
  `title` varchar(50) NOT NULL COMMENT 'The course title',
  `description` varchar(1023) DEFAULT NULL COMMENT 'The description for the course' ,
  `creationTime` timestamp NOT NULL DEFAULT '0000-00-00 00:00:00' COMMENT 'The creation time of the entry.',
  `updateTime` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'The last modified time.',
  PRIMARY KEY (`handle`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COMMENT='Course Information'; 

--
-- Table structure for table `DomainHasStandards`
--

DROP TABLE IF EXISTS `DomainHasStandards`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `DomainHasStandards` (
  `domainID` int(11) NOT NULL COMMENT 'The domain term id.',
  `standardID` int(11) NOT NULL COMMENT 'The standard id.',
  PRIMARY KEY (`domainID`,`standardID`),
  KEY `DomainHasStandards_ibfk_2` (`standardID`),
  CONSTRAINT `DomainHasStandards_ibfk_1` FOREIGN KEY (`domainID`) REFERENCES `BrowseTerms` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `DomainHasStandards_ibfk_2` FOREIGN KEY (`standardID`) REFERENCES `Standards` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8 ROW_FORMAT=COMPACT COMMENT='DomainHasStandards';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `DomainNeighbors`
--

DROP TABLE IF EXISTS `DomainNeighbors`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `DomainNeighbors` (
  `domainID` int(11) NOT NULL COMMENT 'The browse term id.',
  `requiredDomainID` int(11) NOT NULL COMMENT 'The pre-requisite browse term id.',
  PRIMARY KEY (`domainID`,`requiredDomainID`),
  KEY `DomainNeighbors_ibfk_2` (`requiredDomainID`),
  CONSTRAINT `DomainNeighbors_ibfk_1` FOREIGN KEY (`domainID`) REFERENCES `BrowseTerms` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `DomainNeighbors_ibfk_2` FOREIGN KEY (`requiredDomainID`) REFERENCES `BrowseTerms` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COMMENT='The common metadata for authors.';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `DomainUrls`
--

DROP TABLE IF EXISTS `DomainUrls`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `DomainUrls` (
  `domainID` int(11) NOT NULL COMMENT 'The browse term id',
  `url` varchar(1023) NOT NULL COMMENT 'The remote url relevant to this domain',
  `iconUrl` varchar(1023) NULL COMMENT 'The remote URL for the icon relevant to this domain',
  PRIMARY KEY (`domainID`),
  CONSTRAINT `DomainUrls_ibfk_1` FOREIGN KEY (`domainID`) REFERENCES `BrowseTerms` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8 ROW_FORMAT=COMPACT COMMENT='Domain urls for terms that have no artifacts.';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `DownloadStats`
--

DROP TABLE IF EXISTS `DownloadStats`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `DownloadStats` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `downloadType` varchar(200) NOT NULL,
  `count` int(11) NOT NULL,
  `updateTime` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8 ROW_FORMAT=COMPACT COMMENT='Download stats obtained from Google Analytics, AppleStore, K';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `EflexUserDetails`
--

DROP TABLE IF EXISTS `EflexUserDetails`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `EflexUserDetails` (
  `id` int(11) NOT NULL AUTO_INCREMENT COMMENT 'The autogenerated id for this table',
  `memberID` int(11) NOT NULL COMMENT 'Member ID',
  `email` varchar(75) NOT NULL COMMENT 'Email ID of the requester',
  `isSuccessful` tinyint(1) DEFAULT '0',
  `errorCount` smallint(2) DEFAULT '0',
  `isRegistered` tinyint(1) DEFAULT '0',
  `isBlacklisted` tinyint(1) DEFAULT '0',
  PRIMARY KEY (`id`),
  KEY `EflexUserDetails_ibfk_1` (`memberID`),
  CONSTRAINT `EflexUserDetails_ibfk_1` FOREIGN KEY (`memberID`) REFERENCES `Members` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB AUTO_INCREMENT=23 DEFAULT CHARSET=utf8 COMMENT='Eflex User details';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `EflexUserRequests`
--

DROP TABLE IF EXISTS `EflexUserRequests`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `EflexUserRequests` (
  `id` int(11) NOT NULL AUTO_INCREMENT COMMENT 'The autogenerated id for this table',
  `EflexUserDetailID` int(11) NOT NULL COMMENT 'Eflex user detail ID',
  `requester` varchar(75) NOT NULL,
  `title` varchar(250) DEFAULT NULL,
  `emailBody` mediumtext,
  `status` smallint(1) DEFAULT NULL,
  `artifactID` int(11) NOT NULL DEFAULT '0' COMMENT 'The artifactID for unregistered request',
  PRIMARY KEY (`id`),
  KEY `EflexUserRequests_ibfk_1` (`EflexUserDetailID`),
  CONSTRAINT `EflexUserRequests_ibfk_1` FOREIGN KEY (`EflexUserDetailID`) REFERENCES `EflexUserDetails` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB AUTO_INCREMENT=85 DEFAULT CHARSET=utf8 COMMENT='Eflex User Requests';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `EmbeddedObjectCache`
--

DROP TABLE IF EXISTS `EmbeddedObjectCache`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `EmbeddedObjectCache` (
  `urlHash` varchar(128) NOT NULL COMMENT 'the url of object',
  `cache` varchar(4095) NOT NULL COMMENT 'The json cache retreived',
  PRIMARY KEY (`urlHash`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 ROW_FORMAT=COMPACT COMMENT='Cache for object info retrieve from embed.ly.';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `EmbeddedObjectProviders`
--

DROP TABLE IF EXISTS `EmbeddedObjectProviders`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `EmbeddedObjectProviders` (
  `id` int(11) NOT NULL AUTO_INCREMENT COMMENT 'The provider id',
  `name` varchar(255) NOT NULL COMMENT 'The name of the provider',
  `domain` varchar(255) NOT NULL COMMENT 'The url prefix for the provider',
  `blacklisted` int(1) NOT NULL DEFAULT '0' COMMENT 'Flag whether this provider is black listed.',
  `needsApi` int(1) NOT NULL DEFAULT '0' COMMENT 'Flag whether this provider needs to use the API to get info about the object',
  `created` timestamp NOT NULL DEFAULT '0000-00-00 00:00:00' COMMENT 'Creation time.',
  `updated` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Last modification time.',
  PRIMARY KEY (`id`),
  UNIQUE KEY `domain` (`domain`)
) ENGINE=InnoDB AUTO_INCREMENT=72 DEFAULT CHARSET=utf8 ROW_FORMAT=COMPACT COMMENT='Embedded Object Providers';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `EmbeddedObjects`
--

DROP TABLE IF EXISTS `EmbeddedObjects`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `EmbeddedObjects` (
  `id` int(11) NOT NULL AUTO_INCREMENT COMMENT 'The object id',
  `providerID` int(11) NOT NULL COMMENT 'The provider id from EmbeddedObjectProviders table.',
  `resourceID` int(11) DEFAULT NULL COMMENT 'The resource id from Resources table.',
  `type` varchar(100) NOT NULL COMMENT 'Type of the embedded object',
  `caption` varchar(511) DEFAULT NULL COMMENT 'Caption of object',
  `description` varchar(2047) DEFAULT NULL COMMENT 'Object description',
  `uri` varchar(1023) DEFAULT NULL COMMENT 'Object url',
  `code` varchar(4095) NOT NULL COMMENT 'Embed code to be used in HTML',
  `thumbnail` varchar(1023) DEFAULT NULL COMMENT 'Thumbnail url',
  `blacklisted` int(1) NOT NULL DEFAULT '0' COMMENT 'Is this object blacklisted',
  `hash` varchar(100) NOT NULL COMMENT 'hash of the embed code',
  `width` varchar(100) DEFAULT NULL,
  `height` varchar(100) DEFAULT NULL,
  `created` timestamp NOT NULL DEFAULT '0000-00-00 00:00:00' COMMENT 'Creation time.',
  `updated` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Last modification time.',
  PRIMARY KEY (`id`),
  KEY `EmbeddedObjects_idx_type` (`type`),
  KEY `EmbeddedObjects_idx_uri` (`uri`(255)),
  KEY `EmbeddedObjects_idx_hash` (`hash`),
  KEY `EmbeddedObjects_ibfk_1` (`providerID`),
  KEY `EmbeddedObjects_ibfk_2` (`resourceID`),
  CONSTRAINT `EmbeddedObjects_ibfk_1` FOREIGN KEY (`providerID`) REFERENCES `EmbeddedObjectProviders` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `EmbeddedObjects_ibfk_2` FOREIGN KEY (`resourceID`) REFERENCES `Resources` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB AUTO_INCREMENT=7476 DEFAULT CHARSET=utf8 ROW_FORMAT=COMPACT COMMENT='Embedded Objects';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Temporary table structure for view `EncodedIDNeighbors`
--

DROP TABLE IF EXISTS `EncodedIDNeighbors`;
/*!50001 DROP VIEW IF EXISTS `EncodedIDNeighbors`*/;
SET @saved_cs_client     = @@character_set_client;
SET character_set_client = utf8;
/*!50001 CREATE TABLE `EncodedIDNeighbors` (
  `domainID` tinyint NOT NULL,
  `encodedID` tinyint NOT NULL,
  `requiredDomainID` tinyint NOT NULL,
  `requiredEncodedID` tinyint NOT NULL
) ENGINE=MyISAM */;
SET character_set_client = @saved_cs_client;

--
-- Table structure for table `EventTypes`
--

DROP TABLE IF EXISTS `EventTypes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `EventTypes` (
  `id` smallint(6) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL COMMENT 'The event type name',
  `description` varchar(2047) DEFAULT NULL COMMENT 'The event type description',
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`)
) ENGINE=InnoDB AUTO_INCREMENT=35 DEFAULT CHARSET=utf8 ROW_FORMAT=COMPACT COMMENT='EventTypes';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `Events`
--

DROP TABLE IF EXISTS `Events`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `Events` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `eventTypeID` smallint(6) NOT NULL COMMENT 'The event type',
  `objectID` varchar(52) DEFAULT NULL COMMENT 'The reference object id',
  `objectType` varchar(255) DEFAULT NULL,
  `subObjectID` varchar(52) DEFAULT NULL COMMENT 'Some id',
  `eventData` text,
  `ownerID` int(11) DEFAULT NULL COMMENT 'The owner for the event',
  `subscriberID` int(11) DEFAULT NULL,
  `created` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'The time of creating the request.',
  PRIMARY KEY (`id`),
  KEY `Events_idx_1` (`objectID`,`objectType`),
  KEY `Idx_Events_1` (`eventTypeID`,`objectID`,`objectType`,`created`),
  KEY `Idx_Events_2` (`eventTypeID`,`created`),
  KEY `Idx_Events_create` (`created`),
  KEY `Idx_Events_subObjectID` (`subObjectID`),
  CONSTRAINT `Events_ibfk_1` FOREIGN KEY (`ownerID`) REFERENCES `Members` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `Events_ibfk_2` FOREIGN KEY (`eventTypeID`) REFERENCES `EventTypes` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `Events_ibfk_3` FOREIGN KEY (`subscriberID`) REFERENCES `Members` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB AUTO_INCREMENT=157065 DEFAULT CHARSET=utf8 ROW_FORMAT=COMPACT COMMENT='Events';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `FeaturedArtifacts`
--

DROP TABLE IF EXISTS `FeaturedArtifacts`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `FeaturedArtifacts` (
  `artifactID` int(11) NOT NULL COMMENT 'The id of the artifact to be featured.',
  `listOrder` smallint(6) NOT NULL COMMENT 'The order of the featured list, increasing in value.',
  `comments` varchar(4096) DEFAULT NULL COMMENT 'Comments about this feature',
  PRIMARY KEY (`artifactID`),
  UNIQUE KEY `listOrder` (`listOrder`),
  CONSTRAINT `FeaturedArtifacts_ibfk_1` FOREIGN KEY (`artifactID`) REFERENCES `Artifacts` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COMMENT='The common metadata for featured artifacts.';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Temporary table structure for view `From1xBookMemberInfo`
--

DROP TABLE IF EXISTS `From1xBookMemberInfo`;
/*!50001 DROP VIEW IF EXISTS `From1xBookMemberInfo`*/;
SET @saved_cs_client     = @@character_set_client;
SET character_set_client = utf8;
/*!50001 CREATE TABLE `From1xBookMemberInfo` (
  `memberID` tinyint NOT NULL,
  `memberID1x` tinyint NOT NULL,
  `taskID` tinyint NOT NULL,
  `started` tinyint NOT NULL,
  `migrated` tinyint NOT NULL,
  `status` tinyint NOT NULL,
  `email` tinyint NOT NULL
) ENGINE=MyISAM */;
SET character_set_client = @saved_cs_client;

--
-- Table structure for table `From1xBookMembers`
--

DROP TABLE IF EXISTS `From1xBookMembers`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `From1xBookMembers` (
  `memberID` int(11) NOT NULL COMMENT 'The id of the member who owns 1.x books.',
  `memberID1x` int(11) NOT NULL COMMENT 'The 1.x member id.',
  `taskID` varchar(255) DEFAULT NULL COMMENT 'The id of the async task.',
  `started` timestamp NULL DEFAULT NULL COMMENT 'The migration starting time.',
  `migrated` timestamp NULL DEFAULT NULL COMMENT 'The migration completion time.',
  `status` enum('Not Started','In Progress','Done','Acknowledged','Failed','Declined') DEFAULT 'Not Started',
  PRIMARY KEY (`memberID`),
  UNIQUE KEY `memberID1x` (`memberID1x`),
  KEY `From1xBookMembers_ibfk_2` (`taskID`),
  CONSTRAINT `From1xBookMembers_ibfk_1` FOREIGN KEY (`memberID`) REFERENCES `Members` (`id`) ON DELETE CASCADE ON UPDATE NO ACTION,
  CONSTRAINT `From1xBookMembers_ibfk_2` FOREIGN KEY (`taskID`) REFERENCES `Tasks` (`taskID`) ON DELETE CASCADE ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8 ROW_FORMAT=COMPACT COMMENT='From1xBookMembers';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `From1xBooks`
--

DROP TABLE IF EXISTS `From1xBooks`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `From1xBooks` (
  `fid` int(11) NOT NULL COMMENT 'The 1.x flexbook id.',
  `memberID` int(11) NOT NULL COMMENT 'The id of the member who owns this book.',
  `artifactID` int(11) DEFAULT NULL COMMENT 'The corresponding 2.0 artifact id.',
  PRIMARY KEY (`fid`),
  KEY `From1xBooks_ibfk_1` (`memberID`),
  KEY `From1xBooks_ibfk_2` (`artifactID`),
  CONSTRAINT `From1xBooks_ibfk_1` FOREIGN KEY (`memberID`) REFERENCES `From1xBookMembers` (`memberID`) ON DELETE CASCADE ON UPDATE NO ACTION,
  CONSTRAINT `From1xBooks_ibfk_2` FOREIGN KEY (`artifactID`) REFERENCES `Artifacts` (`id`) ON DELETE CASCADE ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8 ROW_FORMAT=COMPACT COMMENT='From1xBooks';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `From1xChapters`
--

DROP TABLE IF EXISTS `From1xChapters`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `From1xChapters` (
  `cid` int(11) NOT NULL COMMENT 'The 1.x flexbook chapter id.',
  `artifactID` int(11) DEFAULT NULL COMMENT 'The corresponding 2.0 artifact id.',
  `memberID` int(11) NOT NULL,
  PRIMARY KEY (`cid`,`memberID`),
  KEY `From1xChapters_ibfk_1` (`artifactID`),
  KEY `From1xChapters_ibfk_2` (`memberID`),
  CONSTRAINT `From1xChapters_ibfk_1` FOREIGN KEY (`artifactID`) REFERENCES `Artifacts` (`id`) ON DELETE CASCADE ON UPDATE NO ACTION,
  CONSTRAINT `From1xChapters_ibfk_2` FOREIGN KEY (`memberID`) REFERENCES `From1xBookMembers` (`memberID`) ON DELETE CASCADE ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8 ROW_FORMAT=COMPACT COMMENT='From1xChapters';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `Grades`
--

DROP TABLE IF EXISTS `Grades`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `Grades` (
  `id` smallint(6) NOT NULL AUTO_INCREMENT COMMENT 'The auto generated id.',
  `name` varchar(31) NOT NULL COMMENT 'The grade level.',
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`)
) ENGINE=InnoDB AUTO_INCREMENT=14 DEFAULT CHARSET=utf8 COMMENT='The grade levels.';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `GroupActivities`
--

DROP TABLE IF EXISTS `GroupActivities`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `GroupActivities` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `groupID` int(11) NOT NULL COMMENT 'The GroupID for the activity',
  `ownerID` int(11) NOT NULL COMMENT 'The memberID who created the activity',
  `activityType` enum('create','join','share','leave','assign','unassign','assignment-delete','change-due-date','assignment-edit','ph-question','ph-comment','ph-answer') DEFAULT NULL,
  `objectType` enum('artifact','artifactRevision','resource','resourceRevision','notification','member','group','peerhelp_post') DEFAULT NULL,
  `objectID` varchar(52) DEFAULT NULL COMMENT 'The objectID for the event',
  `activityData` text,
  `creationTime` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'The time of creating the activity.',
  PRIMARY KEY (`id`),
  KEY `GroupActivities_ibfk_1` (`groupID`),
  KEY `GroupActivities_ibfk_2` (`ownerID`),
  KEY `GroupActivities_idx_1` (`objectID`,`objectType`),
  KEY `GroupActivities_activityType` (`activityType`),
  KEY `GroupActivities_creationTime` (`creationTime`),
  CONSTRAINT `GroupActivities_ibfk_1` FOREIGN KEY (`groupID`) REFERENCES `Groups` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `GroupActivities_ibfk_2` FOREIGN KEY (`ownerID`) REFERENCES `Members` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8 COMMENT='GroupActivities';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `GroupHasArtifacts`
--

DROP TABLE IF EXISTS `GroupHasArtifacts`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `GroupHasArtifacts` (
  `groupID` int(11) NOT NULL COMMENT 'The group id.',
  `artifactID` int(11) NOT NULL COMMENT 'The artifact id.',
  PRIMARY KEY (`groupID`,`artifactID`),
  KEY `GroupHasArtifacts_ibfk_2` (`artifactID`),
  CONSTRAINT `GroupHasArtifacts_ibfk_1` FOREIGN KEY (`groupID`) REFERENCES `Groups` (`id`),
  CONSTRAINT `GroupHasArtifacts_ibfk_2` FOREIGN KEY (`artifactID`) REFERENCES `Artifacts` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `GroupHasMembers`
--

DROP TABLE IF EXISTS `GroupHasMembers`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `GroupHasMembers` (
  `groupID` int(11) NOT NULL DEFAULT '1' COMMENT 'The group id.',
  `memberID` int(11) NOT NULL COMMENT 'The member id.',
  `roleID` int(11) NOT NULL COMMENT 'The role id.',
  `statusID` smallint(6) NOT NULL,
  `memberEmail` varchar(255) DEFAULT NULL,
  `joinTime` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updateTime` timestamp NULL DEFAULT NULL,
  `disableNotification` tinyint(1) NOT NULL DEFAULT '0',
  PRIMARY KEY (`groupID`,`memberID`,`roleID`),
  KEY `GroupHasMembers_ibfk_2` (`memberID`),
  KEY `GroupHasMembers_ibfk_3` (`roleID`),
  KEY `GroupHasMembers_ibfk_4` (`statusID`),
  KEY `GroupHasMembers_updateTime` (`updateTime`),
  CONSTRAINT `GroupHasMembers_ibfk_1` FOREIGN KEY (`groupID`) REFERENCES `Groups` (`id`),
  CONSTRAINT `GroupHasMembers_ibfk_2` FOREIGN KEY (`memberID`) REFERENCES `Members` (`id`),
  CONSTRAINT `GroupHasMembers_ibfk_3` FOREIGN KEY (`roleID`) REFERENCES `MemberRoles` (`id`),
  CONSTRAINT `GroupHasMembers_ibfk_4` FOREIGN KEY (`statusID`) REFERENCES `GroupMemberStates` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `GroupMemberStates`
--

DROP TABLE IF EXISTS `GroupMemberStates`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `GroupMemberStates` (
  `id` smallint(6) NOT NULL AUTO_INCREMENT COMMENT 'The auto-generated Group ID',
  `name` varchar(63) NOT NULL COMMENT 'The Group Name',
  `description` varchar(511) NOT NULL COMMENT 'Description for the Group',
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `Groups`
--

DROP TABLE IF EXISTS `Groups`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `Groups` (
  `id` int(11) NOT NULL AUTO_INCREMENT COMMENT 'The auto generated group id.',
  `parentID` int(11) NOT NULL COMMENT 'The parent group id.',
  `name` varchar(255) NOT NULL COMMENT 'The group name.',
  `handle` varchar(255) NOT NULL,
  `description` varchar(8191) DEFAULT NULL COMMENT 'The description of this group.',
  `isActive` tinyint(1) DEFAULT '1' COMMENT '1 if it is an active group; 0 otherwise.',
  `accessCode` varchar(5) DEFAULT NULL COMMENT 'The access code to join the Group',
  `groupScope` enum('open','closed','protected') NOT NULL DEFAULT 'closed' COMMENT 'The access scope of Group',
  `groupType` enum('study','class', 'public-forum', 'editing') NOT NULL DEFAULT 'study',
  `origin` enum('ck-12', 'lms') NOT NULL DEFAULT 'ck-12',
  `resourceRevisionID` int(11) DEFAULT NULL COMMENT 'Group Image',
  `isVisible` tinyint(1) NOT NULL DEFAULT 1 COMMENT 'flag to hide/show group',
  `creatorID` int(11) NOT NULL,
  `creationTime` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updateTime` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `parentID` (`parentID`,`name`,`creatorID`),
  UNIQUE KEY `name_UNIQUE` (`name`,`creatorID`),
  UNIQUE KEY `handle_UNIQUE` (`handle`),
  UNIQUE KEY `accessCode` (`accessCode`),
  KEY `idx_creator` (`creatorID`),
  KEY `idx_groupType` (`groupType`),
  KEY `idx_origin` (`origin`),
  CONSTRAINT `FK_creator` FOREIGN KEY (`creatorID`) REFERENCES `Members` (`id`),
  CONSTRAINT `Groups_ibfk_1` FOREIGN KEY (`parentID`) REFERENCES `Groups` (`id`),
  CONSTRAINT `FK_ResourceRevision` FOREIGN KEY (`resourceRevisionID`) REFERENCES `ResourceRevisions` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB AUTO_INCREMENT=24 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `ForumMetadata`
--

DROP TABLE IF EXISTS `ForumMetadata`;
CREATE TABLE `ForumMetadata` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `groupID` int(11) NOT NULL COMMENT 'The group id.',
  `taggedWithRoleID` int(11) DEFAULT NULL COMMENT 'Member roles for which forum is tagged with',
  `tagLine` varchar(1024) DEFAULT NULL COMMENT 'Tagline for forum.',
  `creationTime` timestamp NOT NULL DEFAULT '0000-00-00 00:00:00' COMMENT 'The creation time.',
   CONSTRAINT `ForumMetadata_ibfk_1` FOREIGN KEY (`groupID`) REFERENCES `Groups` (`id`) ON DELETE CASCADE ON UPDATE NO ACTION,
   CONSTRAINT `ForumMetadata_ibfk_2` FOREIGN KEY (`taggedWithRoleID`) REFERENCES `MemberRoles` (`id`) ON DELETE CASCADE ON UPDATE NO ACTION,
   PRIMARY KEY (`id`),
   UNIQUE KEY `ForumMetadata_uk_groupID-roleID` (`groupID`,`taggedWithRoleID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COMMENT='Forum related additional meta.';

--
-- Table structure for table `MemberViewedGroupActivities`
--

DROP TABLE IF EXISTS `MemberViewedGroupActivities`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `MemberViewedGroupActivities` (
  `memberID` int(11) NOT NULL,
  `groupID` int(11) NOT NULL,
  `activityID` int(11) NOT NULL,
  `viewedTime` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY `IdxPerUsrPerActivity` (`memberID`,`activityID`),
  KEY `IdxPerUsrPerGroupActivity` (`memberID`, `groupID`, `activityID`),
  CONSTRAINT `MemberViewedGroupActivities_ibfk_1` FOREIGN KEY (`memberID`) REFERENCES `Members` (`id`) ON DELETE CASCADE ON UPDATE NO ACTION,
  CONSTRAINT `MemberViewedGroupActivities_ibfk_2` FOREIGN KEY (`groupID`) REFERENCES `Groups` (`id`) ON DELETE CASCADE ON UPDATE NO ACTION,
  CONSTRAINT `MemberViewedGroupActivities_ibfk_3` FOREIGN KEY (`activityID`) REFERENCES `GroupActivities` (`id`) ON DELETE CASCADE ON UPDATE NO ACTION 
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `InteractiveEntries`
--

DROP TABLE IF EXISTS `InteractiveEntries`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `InteractiveEntries` (
  `id` int(11) NOT NULL AUTO_INCREMENT COMMENT 'The auto generated id for this table.',
  `typeID` smallint(6) NOT NULL COMMENT 'The type of this interactive entry.',
  `creatorID` int(11) NOT NULL COMMENT 'The creator of this interactive entry.',
  `parentID` int(11) DEFAULT NULL COMMENT 'The parent entry of this interactive entry.',
  `artifactRevisionID` int(11) NOT NULL COMMENT 'The artifact revision id.',
  `handle` varchar(511) NOT NULL COMMENT 'The handle URL',
  `anchor` varchar(63) NOT NULL COMMENT 'The anchor for the offset',
  `contents` varchar(8191) NOT NULL COMMENT 'The contents of this interactive entry.',
  PRIMARY KEY (`id`),
  KEY `handle` (`handle`(255),`anchor`),
  KEY `InteractiveEntries_ibfk_1` (`parentID`),
  KEY `InteractiveEntries_ibfk_2` (`typeID`),
  KEY `InteractiveEntries_ibfk_3` (`creatorID`),
  KEY `InteractiveEntries_ibfk_4` (`artifactRevisionID`),
  CONSTRAINT `InteractiveEntries_ibfk_1` FOREIGN KEY (`parentID`) REFERENCES `InteractiveEntries` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `InteractiveEntries_ibfk_2` FOREIGN KEY (`typeID`) REFERENCES `InteractiveEntryTypes` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `InteractiveEntries_ibfk_3` FOREIGN KEY (`creatorID`) REFERENCES `Members` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `InteractiveEntries_ibfk_4` FOREIGN KEY (`artifactRevisionID`) REFERENCES `ArtifactRevisions` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COMMENT='The metadata for InteractiveEntries.';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `InteractiveEntryTypes`
--

DROP TABLE IF EXISTS `InteractiveEntryTypes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `InteractiveEntryTypes` (
  `id` smallint(6) NOT NULL AUTO_INCREMENT COMMENT 'The auto generated action id.',
  `name` varchar(63) NOT NULL COMMENT 'The action type name.',
  `description` varchar(511) DEFAULT NULL COMMENT 'The description of this action.',
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8 COMMENT='The types of InteractiveEntries';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `Languages`
--

DROP TABLE IF EXISTS `Languages`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `Languages` (
  `id` smallint(6) NOT NULL AUTO_INCREMENT COMMENT 'The auto generated identifier.',
  `code` char(2) NOT NULL COMMENT 'The ISO 639-1 language code.',
  `name` varchar(63) NOT NULL COMMENT 'The name of this resource type.',
  PRIMARY KEY (`id`),
  UNIQUE KEY `code` (`code`),
  UNIQUE KEY `name` (`name`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8 COMMENT='The types of resources.';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `Licenses`
--

DROP TABLE IF EXISTS `Licenses`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `Licenses` (
  `id` smallint(6) NOT NULL AUTO_INCREMENT COMMENT 'The auto generated id.',
  `name` varchar(63) NOT NULL COMMENT 'The license name.',
  `description` varchar(511) DEFAULT NULL COMMENT 'The description of this license.',
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8 COMMENT='The licenses.';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `MathImage`
--

DROP TABLE IF EXISTS `MathImage`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `MathImage` (
  `hash` char(40) NOT NULL COMMENT 'The sha hash of eqnType + target + expression.',
  `eqnType` enum('block','inline','alignat') NOT NULL DEFAULT 'block' COMMENT 'The type of equation, block or inline.',
  `target` varchar(25) NOT NULL DEFAULT 'web' COMMENT 'The optimized target for the image. The default is for web.',
  `expression` varchar(10000) NOT NULL COMMENT 'The latex expression to generate the equation.',
  `resourceUrl` varchar(255) NOT NULL COMMENT 'The actual url to the image in media server.',
  PRIMARY KEY (`hash`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 ROW_FORMAT=COMPACT COMMENT='Information of common working directories accross servers.';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `MemberAccessTimes`
--

DROP TABLE IF EXISTS `MemberAccessTimes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `MemberAccessTimes` (
  `memberID` int(11) NOT NULL,
  `objectType` enum('group','inapp_notifications') DEFAULT NULL,
  `objectID` int(11) NOT NULL,
  `accessTime` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY `IdxPerUsrPerObj` (`memberID`,`objectType`,`objectID`),
  KEY `IdxPerUsrObjTyp` (`memberID`,`objectType`),
  CONSTRAINT `MemberAccessTimes_ibfk_1` FOREIGN KEY (`memberID`) REFERENCES `Members` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `MemberAuthApprovals`
--

DROP TABLE IF EXISTS `MemberAuthApprovals`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `MemberAuthApprovals` (
  `memberID` int(11) NOT NULL COMMENT 'The id of the member.',
  `domain` varchar(63) NOT NULL COMMENT 'The domain where the request is from.',
  `approve` tinyint(1) NOT NULL COMMENT '1 => approved; 0 => not approved.',
  PRIMARY KEY (`memberID`,`domain`),
  CONSTRAINT `MemberAuthApprovals_ibfk_1` FOREIGN KEY (`memberID`) REFERENCES `Members` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COMMENT='Approve/Reject request by member from a domain.';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `MemberAuthTypes`
--

DROP TABLE IF EXISTS `MemberAuthTypes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `MemberAuthTypes` (
  `id` smallint(6) NOT NULL AUTO_INCREMENT COMMENT 'The auto generated member authentication type id.',
  `name` varchar(63) NOT NULL COMMENT 'The member authentication type name.',
  `description` varchar(511) DEFAULT NULL COMMENT 'The description of this member authentication type.',
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `MemberLabels`
--

DROP TABLE IF EXISTS `MemberLabels`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `MemberLabels` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `memberID` int(11) DEFAULT NULL COMMENT 'The id of the member who owns this label',
  `label` varchar(255) NOT NULL COMMENT 'The label',
  `systemLabel` tinyint(1) NOT NULL DEFAULT '0' COMMENT 'Is system generated',
  `sticky` tinyint(1) NOT NULL DEFAULT '0',
  `created` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'The time of label creation.',
  PRIMARY KEY (`id`),
  UNIQUE KEY `memberID` (`memberID`,`label`),
  CONSTRAINT `MemberLabels_ibfk_1` FOREIGN KEY (`memberID`) REFERENCES `Members` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB AUTO_INCREMENT=1783 DEFAULT CHARSET=utf8 ROW_FORMAT=COMPACT COMMENT='MemberLabels';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Temporary table structure for view `MemberLibraryArtifactRevisionHasLabels`
--

DROP TABLE IF EXISTS `MemberLibraryArtifactRevisionHasLabels`;
/*!50001 DROP VIEW IF EXISTS `MemberLibraryArtifactRevisionHasLabels`*/;
SET @saved_cs_client     = @@character_set_client;
SET character_set_client = utf8;
/*!50001 CREATE TABLE `MemberLibraryArtifactRevisionHasLabels` (
  `labelID` tinyint NOT NULL,
  `memberID` tinyint NOT NULL,
  `labelName` tinyint NOT NULL,
  `systemLabel` tinyint NOT NULL,
  `labelOwnerID` tinyint NOT NULL,
  `libraryObjectID` tinyint NOT NULL,
  `artifactRevisionID` tinyint NOT NULL,
  `objectType` tinyint NOT NULL,
  `domainID` tinyint NOT NULL,
  `added` tinyint NOT NULL,
  `artifactID` tinyint NOT NULL,
  `artifactTypeID` tinyint NOT NULL,
  `name` tinyint NOT NULL,
  `updateTime` tinyint NOT NULL,
  `creationTime` tinyint NOT NULL,
  `creatorID` tinyint NOT NULL
) ENGINE=MyISAM */;
SET character_set_client = @saved_cs_client;

--
-- Temporary table structure for view `MemberLibraryArtifactRevisionHasLabelsAndBrowseTerms`
--

DROP TABLE IF EXISTS `MemberLibraryArtifactRevisionHasLabelsAndBrowseTerms`;
/*!50001 DROP VIEW IF EXISTS `MemberLibraryArtifactRevisionHasLabelsAndBrowseTerms`*/;
SET @saved_cs_client     = @@character_set_client;
SET character_set_client = utf8;
/*!50001 CREATE TABLE `MemberLibraryArtifactRevisionHasLabelsAndBrowseTerms` (
  `labelID` tinyint NOT NULL,
  `memberID` tinyint NOT NULL,
  `labelName` tinyint NOT NULL,
  `systemLabel` tinyint NOT NULL,
  `labelOwnerID` tinyint NOT NULL,
  `libraryObjectID` tinyint NOT NULL,
  `artifactRevisionID` tinyint NOT NULL,
  `objectType` tinyint NOT NULL,
  `domainID` tinyint NOT NULL,
  `added` tinyint NOT NULL,
  `artifactID` tinyint NOT NULL,
  `artifactTypeID` tinyint NOT NULL,
  `name` tinyint NOT NULL,
  `updateTime` tinyint NOT NULL,
  `creationTime` tinyint NOT NULL,
  `creatorID` tinyint NOT NULL,
  `browseTermID` tinyint NOT NULL,
  `term` tinyint NOT NULL,
  `termTypeID` tinyint NOT NULL,
  `parentID` tinyint NOT NULL,
  `encodedID` tinyint NOT NULL
) ENGINE=MyISAM */;
SET character_set_client = @saved_cs_client;

--
-- Temporary table structure for view `MemberLibraryArtifactRevisions`
--

DROP TABLE IF EXISTS `MemberLibraryArtifactRevisions`;
/*!50001 DROP VIEW IF EXISTS `MemberLibraryArtifactRevisions`*/;
SET @saved_cs_client     = @@character_set_client;
SET character_set_client = utf8;
/*!50001 CREATE TABLE `MemberLibraryArtifactRevisions` (
  `id` tinyint NOT NULL,
  `memberID` tinyint NOT NULL,
  `artifactRevisionID` tinyint NOT NULL,
  `objectType` tinyint NOT NULL,
  `domainID` tinyint NOT NULL,
  `added` tinyint NOT NULL,
  `artifactID` tinyint NOT NULL,
  `artifactTypeID` tinyint NOT NULL,
  `name` tinyint NOT NULL,
  `updateTime` tinyint NOT NULL,
  `creationTime` tinyint NOT NULL,
  `creatorID` tinyint NOT NULL
) ENGINE=MyISAM */;
SET character_set_client = @saved_cs_client;

--
-- Temporary table structure for view `MemberLibraryArtifactRevisionsAndBrowseTerms`
--

DROP TABLE IF EXISTS `MemberLibraryArtifactRevisionsAndBrowseTerms`;
/*!50001 DROP VIEW IF EXISTS `MemberLibraryArtifactRevisionsAndBrowseTerms`*/;
SET @saved_cs_client     = @@character_set_client;
SET character_set_client = utf8;
/*!50001 CREATE TABLE `MemberLibraryArtifactRevisionsAndBrowseTerms` (
  `id` tinyint NOT NULL,
  `memberID` tinyint NOT NULL,
  `artifactRevisionID` tinyint NOT NULL,
  `objectType` tinyint NOT NULL,
  `domainID` tinyint NOT NULL,
  `added` tinyint NOT NULL,
  `artifactID` tinyint NOT NULL,
  `artifactTypeID` tinyint NOT NULL,
  `name` tinyint NOT NULL,
  `updateTime` tinyint NOT NULL,
  `creationTime` tinyint NOT NULL,
  `creatorID` tinyint NOT NULL,
  `browseTermID` tinyint NOT NULL,
  `term` tinyint NOT NULL,
  `termTypeID` tinyint NOT NULL,
  `encodedID` tinyint NOT NULL,
  `parentID` tinyint NOT NULL
) ENGINE=MyISAM */;
SET character_set_client = @saved_cs_client;

--
-- Table structure for table `MemberLibraryObjectHasLabels`
--

DROP TABLE IF EXISTS `MemberLibraryObjectHasLabels`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `MemberLibraryObjectHasLabels` (
  `libraryObjectID` int(11) NOT NULL COMMENT 'The id of the library object',
  `labelID` int(11) NOT NULL COMMENT 'The label ID',
  PRIMARY KEY (`libraryObjectID`,`labelID`),
  KEY `MemberLibraryObjectHasLabels_ibfk_2` (`labelID`),
  CONSTRAINT `MemberLibraryObjectHasLabels_ibfk_1` FOREIGN KEY (`libraryObjectID`) REFERENCES `MemberLibraryObjects` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `MemberLibraryObjectHasLabels_ibfk_2` FOREIGN KEY (`labelID`) REFERENCES `MemberLabels` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8 ROW_FORMAT=COMPACT COMMENT='MemberLibraryObjectHasLabels';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `MemberLibraryObjects`
--

DROP TABLE IF EXISTS `MemberLibraryObjects`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `MemberLibraryObjects` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `objectID` int(11) NOT NULL COMMENT 'The id of the object in Member Library',
  `objectType` enum('artifactRevision','resourceRevision','domain') NOT NULL COMMENT 'The type of the object',
  `parentID` int(11) NOT NULL COMMENT 'The parent id of the object',
  `memberID` int(11) NOT NULL COMMENT 'The member id who owns this library entry',
  `created` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'The time when object was added to the library',
  `domainID` int(11) NOT NULL COMMENT 'The domainID of the object in member library',
  PRIMARY KEY (`id`),
  UNIQUE KEY `objectID` (`objectID`,`objectType`,`memberID`,`domainID`),
  UNIQUE KEY `objectType` (`objectType`,`memberID`,`parentID`,`domainID`),
  KEY `MemberLibraryObjects_ibfk_1` (`memberID`),
  KEY `MemberLibraryObjects_ibfk_2` (`domainID`),
  CONSTRAINT `MemberLibraryObjects_ibfk_1` FOREIGN KEY (`memberID`) REFERENCES `Members` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `MemberLibraryObjects_ibfk_2` FOREIGN KEY (`domainID`) REFERENCES `BrowseTerms` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB AUTO_INCREMENT=51893 DEFAULT CHARSET=utf8 ROW_FORMAT=COMPACT COMMENT='MemberLibraryObjects';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Temporary table structure for view `MemberLibraryResourceRevisionHasLabels`
--

DROP TABLE IF EXISTS `MemberLibraryResourceRevisionHasLabels`;
/*!50001 DROP VIEW IF EXISTS `MemberLibraryResourceRevisionHasLabels`*/;
SET @saved_cs_client     = @@character_set_client;
SET character_set_client = utf8;
/*!50001 CREATE TABLE `MemberLibraryResourceRevisionHasLabels` (
  `labelID` tinyint NOT NULL,
  `memberID` tinyint NOT NULL,
  `labelName` tinyint NOT NULL,
  `systemLabel` tinyint NOT NULL,
  `labelOwnerID` tinyint NOT NULL,
  `libraryObjectID` tinyint NOT NULL,
  `resourceRevisionID` tinyint NOT NULL,
  `objectType` tinyint NOT NULL,
  `domainID` tinyint NOT NULL,
  `added` tinyint NOT NULL,
  `resourceID` tinyint NOT NULL,
  `resourceTypeID` tinyint NOT NULL,
  `name` tinyint NOT NULL,
  `uri` tinyint NOT NULL,
  `isAttachment` tinyint NOT NULL,
  `creationTime` tinyint NOT NULL,
  `ownerID` tinyint NOT NULL
) ENGINE=MyISAM */;
SET character_set_client = @saved_cs_client;

--
-- Temporary table structure for view `MemberLibraryResourceRevisions`
--

DROP TABLE IF EXISTS `MemberLibraryResourceRevisions`;
/*!50001 DROP VIEW IF EXISTS `MemberLibraryResourceRevisions`*/;
SET @saved_cs_client     = @@character_set_client;
SET character_set_client = utf8;
/*!50001 CREATE TABLE `MemberLibraryResourceRevisions` (
  `id` tinyint NOT NULL,
  `memberID` tinyint NOT NULL,
  `resourceRevisionID` tinyint NOT NULL,
  `objectType` tinyint NOT NULL,
  `domainID` tinyint NOT NULL,
  `added` tinyint NOT NULL,
  `resourceID` tinyint NOT NULL,
  `resourceTypeID` tinyint NOT NULL,
  `name` tinyint NOT NULL,
  `uri` tinyint NOT NULL,
  `creationTime` tinyint NOT NULL,
  `ownerID` tinyint NOT NULL
) ENGINE=MyISAM */;
SET character_set_client = @saved_cs_client;

--
-- Table structure for table `MemberRoles`
--

DROP TABLE IF EXISTS `MemberRoles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `MemberRoles` (
  `id` int(11) NOT NULL AUTO_INCREMENT COMMENT 'The auto generated member type id.',
  `groupID` int(11) NOT NULL DEFAULT '1' COMMENT 'The role for the given group and its subgroups',
  `name` varchar(63) NOT NULL COMMENT 'The member role name.',
  `description` varchar(511) DEFAULT NULL COMMENT 'The description of this member role.',
  `is_admin_role` tinyint(1) NOT NULL DEFAULT 0 COMMENT 'role has admin permissions or not',
  PRIMARY KEY (`id`,`groupID`),
  UNIQUE KEY `name` (`name`),
  KEY `MemberRoles_ibfk_1` (`groupID`),
  CONSTRAINT `MemberRoles_ibfk_1` FOREIGN KEY (`groupID`) REFERENCES `Groups` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=18 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `MemberViewedArtifacts`
--

DROP TABLE IF EXISTS `MemberViewedArtifacts`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `MemberViewedArtifacts` (
  `memberID` int(11) NOT NULL COMMENT 'The id of the member.',
  `artifactID` int(11) NOT NULL COMMENT 'The id of the artifact.',
  `lastViewTime` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'The last view time.',
  PRIMARY KEY (`memberID`,`artifactID`),
  KEY `MemberViewedArtifacts_ibfk_2` (`artifactID`),
  CONSTRAINT `MemberViewedArtifacts_ibfk_1` FOREIGN KEY (`memberID`) REFERENCES `Members` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `MemberViewedArtifacts_ibfk_2` FOREIGN KEY (`artifactID`) REFERENCES `Artifacts` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COMMENT='The common metadata for Member viewed artifacts.';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `Members`
--

DROP TABLE IF EXISTS `Members`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `Members` (
  `id` int(11) NOT NULL COMMENT 'The member id from auth.',
  `stateID` SMALLINT(6) NOT NULL COMMENT 'The state of this member.',
  `login` varchar(255) NOT NULL COMMENT 'The login name of this member.',
  `email` varchar(255) NOT NULL COMMENT 'The email address of this member.',
  `givenName` varchar(255) NOT NULL COMMENT 'The given (first) name of this member.',
  `surname` varchar(255) DEFAULT NULL COMMENT 'The surname (last name) of this member.',
  `defaultLogin` varchar(255) NOT NULL DEFAULT '' COMMENT 'The auto-generated login name.',
  `creationTime` timestamp NOT NULL DEFAULT '0000-00-00 00:00:00' COMMENT 'The creation time of this entry.',
  `updateTime` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'The last modified time.',
  `timezone` varchar(52) DEFAULT 'US/Pacific',
  `encrypted` smallint(1) DEFAULT 0,
  PRIMARY KEY (`id`),
  UNIQUE KEY `login` (`login`),
  UNIQUE KEY `defaultLogin` (`defaultLogin`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=1801 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `NotificationRules`
--

DROP TABLE IF EXISTS `NotificationRules`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `NotificationRules` (
  `id` smallint(6) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL COMMENT 'The notification rule name',
  `description` varchar(2047) DEFAULT NULL COMMENT 'The notification rule description',
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8 ROW_FORMAT=COMPACT COMMENT='Notification Rules';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `Notifications`
--

DROP TABLE IF EXISTS `Notifications`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `Notifications` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `eventTypeID` smallint(6) NOT NULL COMMENT 'The event type for this notification',
  `objectID` varchar(52) DEFAULT NULL COMMENT 'The objectID for the event',
  `objectType` varchar(255) DEFAULT NULL COMMENT 'The objectType for the event',
  `type` enum('email','text', 'web') NOT NULL DEFAULT 'email' COMMENT 'The type of notification',
  `ruleID` smallint(6) DEFAULT NULL COMMENT 'The Notification Rule',
  `address` varchar(255) DEFAULT NULL COMMENT 'The address where the notification should be sent',
  `subscriberID` int(11) DEFAULT NULL COMMENT 'The owner for the notification',
  `groupID` int(11) DEFAULT NULL COMMENT 'The GroupID for which the notification belongs to',
  `frequency` enum('instant','once','6hours','12hours','daily','weekly','ondemand','off') NOT NULL DEFAULT 'once' COMMENT 'How often the notification should be send',
  `copyTo` varchar(1024) DEFAULT NULL COMMENT 'Cc email addresses - comma-separated',
  `updated` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'The request update time.',
  `created` timestamp NOT NULL DEFAULT '0000-00-00 00:00:00' COMMENT 'The time of creating the row.',
  `lastSent` timestamp NULL DEFAULT NULL COMMENT 'The time when this notification was last sent',
  PRIMARY KEY (`id`),
  UNIQUE KEY `Idx_Notifications_1` (`eventTypeID`,`subscriberID`,`objectID`,`objectType`,`type`,`ruleID`,`groupID`,`frequency`,`address`),
  CONSTRAINT `Notifications_ibfk_1` FOREIGN KEY (`eventTypeID`) REFERENCES `EventTypes` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `Notifications_ibfk_2` FOREIGN KEY (`subscriberID`) REFERENCES `Members` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `Notifications_ibfk_3` FOREIGN KEY (`ruleID`) REFERENCES `NotificationRules` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `Notifications_ibfk_4` FOREIGN KEY (`groupID`) REFERENCES `Groups` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8 ROW_FORMAT=COMPACT COMMENT='Notifications';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `OAuthClients`
--

DROP TABLE IF EXISTS `OAuthClients`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `OAuthClients` (
  `id` varchar(63) NOT NULL COMMENT 'The client app id.',
  `memberID` int(11) NOT NULL COMMENT 'The member id who creates this client app.',
  `name` varchar(255) NOT NULL COMMENT 'The name of this client app.',
  `description` varchar(2047) DEFAULT NULL COMMENT 'Object description',
  `url` varchar(2084) DEFAULT NULL COMMENT 'The url of this client app.',
  `callback` varchar(2084) DEFAULT NULL COMMENT 'The redirect url of this app.',
  `secret` varchar(63) NOT NULL COMMENT 'The client secret code.',
  `trusted` tinyint(1) DEFAULT '0' COMMENT '1 => trusted; 0 => not yet.',
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`),
  UNIQUE KEY `secret` (`secret`),
  KEY `OAuthClients_ibfk_1` (`memberID`),
  CONSTRAINT `OAuthClients_ibfk_1` FOREIGN KEY (`memberID`) REFERENCES `Members` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `OAuthTokens`
--

DROP TABLE IF EXISTS `OAuthTokens`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `OAuthTokens` (
  `token` varchar(63) NOT NULL COMMENT 'The token.',
  `clientID` varchar(63) NOT NULL COMMENT 'The client id of the app.',
  `memberID` int(11) DEFAULT NULL COMMENT 'The member id whose resource the app wants.',
  `timestamp` int(11) NOT NULL COMMENT 'Number of seconds since 1970/01/01 00:00:00.',
  `nonce` varchar(63) NOT NULL COMMENT 'The nonce for uniquiness.',
  `callback` varchar(2084) DEFAULT NULL COMMENT 'The redirect url of this app.',
  `secret` varchar(63) DEFAULT NULL COMMENT 'The token secret code.',
  `type` enum('request','access') NOT NULL DEFAULT 'request',
  PRIMARY KEY (`token`),
  KEY `timestamp` (`timestamp`),
  KEY `nonce` (`nonce`),
  KEY `OAuthTokens_ibfk_1` (`clientID`),
  KEY `OAuthTokens_ibfk_2` (`memberID`),
  CONSTRAINT `OAuthTokens_ibfk_1` FOREIGN KEY (`clientID`) REFERENCES `OAuthClients` (`id`),
  CONSTRAINT `OAuthTokens_ibfk_2` FOREIGN KEY (`memberID`) REFERENCES `Members` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `PseudoDomainHandleSequencer`
--

DROP TABLE IF EXISTS `PseudoDomainHandleSequencer`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `PseudoDomainHandleSequencer` (
  `handle` varchar(255) NOT NULL DEFAULT '' COMMENT 'The term handle.',
  `sequence` int(11) DEFAULT NULL COMMENT 'Current sequence generator.',
  PRIMARY KEY (`handle`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COMMENT='Used to generate a unique handle for pesudo-domains.';
/*!40101 SET character_set_client = @saved_cs_client */;

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
  PRIMARY KEY (`artifactRevisionID`,`memberID`),
  KEY `PublishRequests_ibfk_2` (`memberID`),
  CONSTRAINT `PublishRequests_ibfk_1` FOREIGN KEY (`artifactRevisionID`) REFERENCES `ArtifactRevisions` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `PublishRequests_ibfk_2` FOREIGN KEY (`memberID`) REFERENCES `Members` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COMMENT='The PublishRequests.';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Temporary table structure for view `PublishedArtifacts`
--

DROP TABLE IF EXISTS `PublishedArtifacts`;
/*!50001 DROP VIEW IF EXISTS `PublishedArtifacts`*/;
SET @saved_cs_client     = @@character_set_client;
SET character_set_client = utf8;
/*!50001 CREATE TABLE `PublishedArtifacts` (
  `id` tinyint NOT NULL,
  `artifactTypeID` tinyint NOT NULL,
  `encodedID` tinyint NOT NULL,
  `name` tinyint NOT NULL,
  `description` tinyint NOT NULL,
  `handle` tinyint NOT NULL,
  `creatorID` tinyint NOT NULL,
  `ancestorID` tinyint NOT NULL,
  `licenseID` tinyint NOT NULL,
  `creationTime` tinyint NOT NULL,
  `updateTime` tinyint NOT NULL,
  `artifactRevisionID` tinyint NOT NULL,
  `revision` tinyint NOT NULL,
  `publishTime` tinyint NOT NULL
) ENGINE=MyISAM */;
SET character_set_client = @saved_cs_client;

--
-- Table structure for table `RelatedArtifacts`
--

DROP TABLE IF EXISTS `RelatedArtifacts`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `RelatedArtifacts` (
  `domainID` int(11) NOT NULL COMMENT 'The domain term EID',
  `sequence` int(11) NOT NULL COMMENT 'The sequence number for EID',
  `artifactID` int(11) NOT NULL COMMENT 'The artifactID',
  `conceptCollectionHandle` varchar(128) NOT NULL DEFAULT '' COMMENT 'The conceptCollectionHandle for the EID.',
  `collectionCreatorID` int(11) NOT NULL DEFAULT 0 COMMENT 'The cK-12 member id.',
  PRIMARY KEY (`domainID`,`artifactID`, `conceptCollectionHandle`, `collectionCreatorID`),
  KEY `RelatedArtifacts_collectionCreatorID` (`collectionCreatorID`),
  KEY `RelatedArtifacts_conceptCollectionHandle` (`conceptCollectionHandle`),
  KEY `RelatedArtifacts_ibfk_2` (`artifactID`),
  KEY `RelatedArtifacts_collectionCreatorID_conceptCollectionHandle` (`collectionCreatorID`, `conceptCollectionHandle`),
  KEY `RelatedArtifacts_conceptCollectionHandle_collectionCreatorID` (`conceptCollectionHandle`, `collectionCreatorID`),
  CONSTRAINT `RelatedArtifacts_ibfk_1` FOREIGN KEY (`domainID`) REFERENCES `BrowseTerms` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `RelatedArtifacts_ibfk_2` FOREIGN KEY (`artifactID`) REFERENCES `Artifacts` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8 ROW_FORMAT=COMPACT COMMENT='RelatedArtifacts';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Temporary table structure for view `RelatedArtifactsAndLevels`
--

DROP TABLE IF EXISTS `RelatedArtifactsAndLevels`;
/*!50001 DROP VIEW IF EXISTS `RelatedArtifactsAndLevels`*/;
SET @saved_cs_client     = @@character_set_client;
SET character_set_client = utf8;
/*!50001 CREATE TABLE `RelatedArtifactsAndLevels` (
  `id` tinyint NOT NULL,
  `artifactTypeID` tinyint NOT NULL,
  `encodedID` tinyint NOT NULL,
  `name` tinyint NOT NULL,
  `description` tinyint NOT NULL,
  `handle` tinyint NOT NULL,
  `creatorID` tinyint NOT NULL,
  `ancestorID` tinyint NOT NULL,
  `licenseID` tinyint NOT NULL,
  `creationTime` tinyint NOT NULL,
  `updateTime` tinyint NOT NULL,
  `artifactRevisionID` tinyint NOT NULL,
  `publishTime` tinyint NOT NULL,
  `levelID` tinyint NOT NULL,
  `level` tinyint NOT NULL,
  `domainID` tinyint NOT NULL,
  `sequence` tinyint NOT NULL,
  `domainTerm` tinyint NOT NULL,
  `domainHandle` tinyint NOT NULL,
  `domainEID` tinyint NOT NULL,
  `parentID` tinyint NOT NULL
) ENGINE=MyISAM */;
SET character_set_client = @saved_cs_client;

--
-- Table structure for table `ResourceRevisions`
--

DROP TABLE IF EXISTS `ResourceRevisions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `ResourceRevisions` (
  `id` int(11) NOT NULL AUTO_INCREMENT COMMENT 'The auto generated identifier.',
  `resourceID` int(11) NOT NULL COMMENT 'The resource identifier.',
  `revision` varchar(255) NOT NULL COMMENT 'The revision number.',
  `hash` varchar(256) DEFAULT NULL COMMENT 'The md5 hash.',
  `creationTime` timestamp NOT NULL DEFAULT '0000-00-00 00:00:00' COMMENT 'The creation time of the entry.',
  `filesize` int(11) DEFAULT '0' COMMENT 'The size of the resource file.',
  `publishTime` timestamp NULL DEFAULT NULL COMMENT 'The publish time of this resource revision.',
  PRIMARY KEY (`id`),
  UNIQUE KEY `resourceID` (`resourceID`,`revision`),
  KEY `ResourceRevisions_publishTime` (`publishTime`),
  CONSTRAINT `ResourceRevisions_ibfk_1` FOREIGN KEY (`resourceID`) REFERENCES `Resources` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB AUTO_INCREMENT=123362 DEFAULT CHARSET=utf8 COMMENT='The revisions of a resource.';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `ResourceTypes`
--

DROP TABLE IF EXISTS `ResourceTypes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `ResourceTypes` (
  `id` int(11) NOT NULL AUTO_INCREMENT COMMENT 'The auto generated identifier.',
  `name` varchar(63) NOT NULL COMMENT 'The name of this resource type.',
  `description` varchar(4095) DEFAULT NULL COMMENT 'The description of this resource type.',
  `versionable` tinyint(1) DEFAULT '0' COMMENT 'Is this resource type versionable?',
  `streamable` tinyint(1) DEFAULT '0' COMMENT 'Is this resource type streamable?',
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`)
) ENGINE=InnoDB AUTO_INCREMENT=36 DEFAULT CHARSET=utf8 COMMENT='The types of resources.';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `Resources`
--

DROP TABLE IF EXISTS `Resources`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `Resources` (
  `id` int(11) NOT NULL AUTO_INCREMENT COMMENT 'The auto generated identifier.',
  `resourceTypeID` int(11) NOT NULL COMMENT 'The type of this resource.',
  `name` varchar(255) NOT NULL COMMENT 'The name or title of this resource.',
  `handle` varchar(255) NOT NULL COMMENT 'The handle of the resource. Used for perma URL',
  `description` varchar(4095) DEFAULT NULL COMMENT 'The description of this resource.',
  `authors` varchar(1024) DEFAULT NULL COMMENT 'The original author for Image and Embedded Objects resource.',
  `license` varchar(1024) DEFAULT NULL COMMENT 'License for Image and Embedded Objects resource',
  `uri` varchar(255) NOT NULL COMMENT 'The location of this resource.',
  `refHash` varchar(64) NOT NULL COMMENT 'The unique reference hash for this resource. Referred in Image Repository ids.',
  `ownerID` int(11) NOT NULL COMMENT 'The owner of this revision.',
  `languageID` smallint(6) DEFAULT NULL COMMENT 'The language of this resource.',
  `isExternal` tinyint(1) DEFAULT '0' COMMENT '1 if it is external resource; 0 otherwise.',
  `creationTime` timestamp NOT NULL DEFAULT '0000-00-00 00:00:00' COMMENT 'The creation time of this resource.',
  `isAttachment` tinyint(1) DEFAULT '0' COMMENT '1 if it is attachment resource; 0 otherwise.',
  `checksum` varchar(255) DEFAULT NULL COMMENT 'The checksum for this resource.',
  `satelliteUrl` varchar(1024) DEFAULT NULL COMMENT 'The satellite location of this resource.',
  PRIMARY KEY (`id`),
  UNIQUE KEY `Idx_uri` (`uri`,`ownerID`),
  UNIQUE KEY `Idx_refHash` (`refHash`),
  UNIQUE KEY `handle` (`handle`,`ownerID`,`resourceTypeID`),
  KEY `Resources_ibfk_3` (`ownerID`),
  KEY `Resources_ibfk_2` (`languageID`),
  KEY `Resources_ibfk_1` (`resourceTypeID`),
  KEY `Resources_checksum` (`checksum`),
  KEY `Resources_checksum_ownerID` (`checksum`,`ownerID`),
  KEY `Idx_Resources_satelliteUrl` (`satelliteUrl`),
  CONSTRAINT `Resources_ibfk_1` FOREIGN KEY (`resourceTypeID`) REFERENCES `ResourceTypes` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `Resources_ibfk_2` FOREIGN KEY (`languageID`) REFERENCES `Languages` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `Resources_ibfk_3` FOREIGN KEY (`ownerID`) REFERENCES `Members` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB AUTO_INCREMENT=110225 DEFAULT CHARSET=utf8 COMMENT='The metadata of resources.';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Temporary table structure for view `RevisionAndResources`
--

DROP TABLE IF EXISTS `RevisionAndResources`;
/*!50001 DROP VIEW IF EXISTS `RevisionAndResources`*/;
SET @saved_cs_client     = @@character_set_client;
SET character_set_client = utf8;
/*!50001 CREATE TABLE `RevisionAndResources` (
  `revID` tinyint NOT NULL,
  `id` tinyint NOT NULL,
  `resourceID` tinyint NOT NULL,
  `revision` tinyint NOT NULL,
  `hash` tinyint NOT NULL,
  `creationTime` tinyint NOT NULL,
  `filesize` tinyint NOT NULL,
  `publishTime` tinyint NOT NULL
) ENGINE=MyISAM */;
SET character_set_client = @saved_cs_client;

--
-- Temporary table structure for view `RevisionAndStandards`
--

DROP TABLE IF EXISTS `RevisionAndStandards`;
/*!50001 DROP VIEW IF EXISTS `RevisionAndStandards`*/;
SET @saved_cs_client     = @@character_set_client;
SET character_set_client = utf8;
/*!50001 CREATE TABLE `RevisionAndStandards` (
  `rid` tinyint NOT NULL,
  `artifactID` tinyint NOT NULL,
  `standardID` tinyint NOT NULL,
  `section` tinyint NOT NULL,
  `title` tinyint NOT NULL,
  `description` tinyint NOT NULL,
  `boardID` tinyint NOT NULL,
  `boardName` tinyint NOT NULL,
  `countryID` tinyint NOT NULL,
  `subjectID` tinyint NOT NULL,
  `subjectName` tinyint NOT NULL
) ENGINE=MyISAM */;
SET character_set_client = @saved_cs_client;

--
-- Temporary table structure for view `RwaVotes`
--

DROP TABLE IF EXISTS `RwaVotes`;
/*!50001 DROP VIEW IF EXISTS `RwaVotes`*/;
SET @saved_cs_client     = @@character_set_client;
SET character_set_client = utf8;
/*!50001 CREATE TABLE `RwaVotes` (
  `id` tinyint NOT NULL,
  `updatetime` tinyint NOT NULL,
  `creatorID` tinyint NOT NULL,
  `votes` tinyint NOT NULL
) ENGINE=MyISAM */;
SET character_set_client = @saved_cs_client;

--
-- Table structure for table `SharedArtifacts`
--

DROP TABLE IF EXISTS `SharedArtifacts`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `SharedArtifacts` (
  `artifactID` int(11) NOT NULL COMMENT 'The artifact id.',
  `memberID` int(11) NOT NULL COMMENT 'The member id.',
  `roleID` int(11) NOT NULL COMMENT 'The member role id.',
  PRIMARY KEY (`artifactID`,`memberID`,`roleID`),
  KEY `SharedArtifacts_ibfk_2` (`memberID`),
  KEY `SharedArtifacts_ibfk_3` (`roleID`),
  CONSTRAINT `SharedArtifacts_ibfk_1` FOREIGN KEY (`artifactID`) REFERENCES `Artifacts` (`id`),
  CONSTRAINT `SharedArtifacts_ibfk_2` FOREIGN KEY (`memberID`) REFERENCES `Members` (`id`),
  CONSTRAINT `SharedArtifacts_ibfk_3` FOREIGN KEY (`roleID`) REFERENCES `MemberRoles` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Temporary table structure for view `StandardAndGrades`
--

DROP TABLE IF EXISTS `StandardAndGrades`;
/*!50001 DROP VIEW IF EXISTS `StandardAndGrades`*/;
SET @saved_cs_client     = @@character_set_client;
SET character_set_client = utf8;
/*!50001 CREATE TABLE `StandardAndGrades` (
  `sid` tinyint NOT NULL,
  `id` tinyint NOT NULL,
  `name` tinyint NOT NULL
) ENGINE=MyISAM */;
SET character_set_client = @saved_cs_client;

--
-- Table structure for table `StandardBoards`
--

DROP TABLE IF EXISTS `StandardBoards`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `StandardBoards` (
  `id` smallint(6) NOT NULL AUTO_INCREMENT COMMENT 'The auto generated id.',
  `name` varchar(63) NOT NULL COMMENT 'The name of the standard board.',
  `countryID` int(11) NOT NULL COMMENT 'The country this standard board belongs to.',
  `longname` varchar(511) DEFAULT NULL COMMENT 'The long name of the standard board.',
  `sequence` int(11) DEFAULT NULL COMMENT 'The ordering of standard boards',
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`,`countryID`),
  KEY `StandardBoards_ibfk_1` (`countryID`),
  CONSTRAINT `StandardBoards_ibfk_1` FOREIGN KEY (`countryID`) REFERENCES `Countries` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB AUTO_INCREMENT=64 DEFAULT CHARSET=utf8 COMMENT='The subjects.';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `StandardHasGrades`
--

DROP TABLE IF EXISTS `StandardHasGrades`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `StandardHasGrades` (
  `standardID` int(11) NOT NULL COMMENT 'The standard id.',
  `gradeID` smallint(6) NOT NULL COMMENT 'The grade id.',
  PRIMARY KEY (`standardID`,`gradeID`),
  KEY `StandardHasGrades_ibfk_2` (`gradeID`),
  CONSTRAINT `StandardHasGrades_ibfk_1` FOREIGN KEY (`standardID`) REFERENCES `Standards` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `StandardHasGrades_ibfk_2` FOREIGN KEY (`gradeID`) REFERENCES `Grades` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COMMENT='The grade level for this standards.';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `Standards`
--

DROP TABLE IF EXISTS `Standards`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `Standards` (
  `id` int(11) NOT NULL AUTO_INCREMENT COMMENT 'The auto generated identifier.',
  `standardBoardID` smallint(6) NOT NULL COMMENT 'The standard board of this standard.',
  `subjectID` smallint(6) NOT NULL COMMENT 'The subject of this standard.',
  `section` varchar(63) NOT NULL COMMENT 'The section id of this standard.',
  `title` varchar(255) DEFAULT NULL COMMENT 'The title of this standard.',
  `description` varchar(4095) DEFAULT NULL COMMENT 'The description of this standard.',
  PRIMARY KEY (`id`),
  UNIQUE KEY `standardBoardID` (`standardBoardID`,`subjectID`,`section`),
  KEY `Standards_ibfk_2` (`subjectID`),
  CONSTRAINT `Standards_ibfk_1` FOREIGN KEY (`standardBoardID`) REFERENCES `StandardBoards` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `Standards_ibfk_2` FOREIGN KEY (`subjectID`) REFERENCES `Subjects` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB AUTO_INCREMENT=10195 DEFAULT CHARSET=utf8 COMMENT='The standards.';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `Subjects`
--

DROP TABLE IF EXISTS `Subjects`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `Subjects` (
  `id` smallint(6) NOT NULL AUTO_INCREMENT COMMENT 'The auto generated id.',
  `name` varchar(63) NOT NULL COMMENT 'The subject name.',
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`)
) ENGINE=InnoDB AUTO_INCREMENT=18 DEFAULT CHARSET=utf8 COMMENT='The subjects.';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `Tasks`
--

DROP TABLE IF EXISTS `Tasks`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `Tasks` (
  `id` int(11) NOT NULL AUTO_INCREMENT COMMENT 'The category id',
  `name` varchar(255) NOT NULL COMMENT 'The name of the task',
  `taskID` varchar(255) NOT NULL COMMENT 'RabbitMQ task id',
  `status` varchar(255) NOT NULL COMMENT 'Task status',
  `ownerID` int(11) DEFAULT NULL COMMENT 'The owner of this task',
  `message` text,
  `userdata` mediumtext,
  `artifactKey` varchar(255) DEFAULT NULL COMMENT 'To add other artifact related data',
  `hostname` varchar(100) DEFAULT NULL COMMENT 'Host name where the task is running',
  `started` timestamp NOT NULL DEFAULT '0000-00-00 00:00:00' COMMENT 'The time of enqueuing the task.',
  `updated` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'The task end time.',
  PRIMARY KEY (`id`),
  UNIQUE KEY `taskID` (`taskID`),
  KEY `Tasks_idx_name_ownderID_artifactKey` (`name`,`ownerID`,`artifactKey`),
  KEY `Tasks_ibfk_1` (`ownerID`),
  KEY `Tasks_idx_name_status` (`name`, `status`),
  KEY `Tasks_idx_name` (`name`),
  KEY `Tasks_idx_updated` (`updated`),
  CONSTRAINT `Tasks_ibfk_1` FOREIGN KEY (`ownerID`) REFERENCES `Members` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB AUTO_INCREMENT=285112 DEFAULT CHARSET=utf8 ROW_FORMAT=COMPACT COMMENT='Tasks.';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Temporary table structure for view `TypedArtifactFavorites`
--

DROP TABLE IF EXISTS `TypedArtifactFavorites`;
/*!50001 DROP VIEW IF EXISTS `TypedArtifactFavorites`*/;
SET @saved_cs_client     = @@character_set_client;
SET character_set_client = utf8;
/*!50001 CREATE TABLE `TypedArtifactFavorites` (
  `memberID` tinyint NOT NULL,
  `artifactID` tinyint NOT NULL,
  `typeName` tinyint NOT NULL
) ENGINE=MyISAM */;
SET character_set_client = @saved_cs_client;

--
-- Temporary table structure for view `TypedFeaturedArtifacts`
--

DROP TABLE IF EXISTS `TypedFeaturedArtifacts`;
/*!50001 DROP VIEW IF EXISTS `TypedFeaturedArtifacts`*/;
SET @saved_cs_client     = @@character_set_client;
SET character_set_client = utf8;
/*!50001 CREATE TABLE `TypedFeaturedArtifacts` (
  `id` tinyint NOT NULL,
  `listOrder` tinyint NOT NULL,
  `comments` tinyint NOT NULL,
  `typeName` tinyint NOT NULL
) ENGINE=MyISAM */;
SET character_set_client = @saved_cs_client;

--
-- Temporary table structure for view `TypedMemberViewedArtifacts`
--

DROP TABLE IF EXISTS `TypedMemberViewedArtifacts`;
/*!50001 DROP VIEW IF EXISTS `TypedMemberViewedArtifacts`*/;
SET @saved_cs_client     = @@character_set_client;
SET character_set_client = utf8;
/*!50001 CREATE TABLE `TypedMemberViewedArtifacts` (
  `memberID` tinyint NOT NULL,
  `artifactID` tinyint NOT NULL,
  `typeName` tinyint NOT NULL,
  `lastViewTime` tinyint NOT NULL
) ENGINE=MyISAM */;
SET character_set_client = @saved_cs_client;

--
-- Table structure for table `USStates`
--

DROP TABLE IF EXISTS `USStates`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `USStates` (
  `abbreviation` varchar(2) NOT NULL DEFAULT '' COMMENT 'The US States abbreviation.',
  `name` varchar(63) DEFAULT NULL COMMENT 'The US States name.',
  PRIMARY KEY (`abbreviation`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `Vocabularies`
--

DROP TABLE IF EXISTS `Vocabularies`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `Vocabularies` (
  `id` int(11) NOT NULL AUTO_INCREMENT COMMENT 'The auto generated id.',
  `term` varchar(255) NOT NULL COMMENT 'The term name.',
  `definition` mediumtext NOT NULL COMMENT 'The definition for the term.',
  `languageID` smallint(6) DEFAULT NULL COMMENT 'The language of this vocabulary.',
  PRIMARY KEY (`id`),
  KEY `Vocabularies_ibfk_1` (`languageID`),
  CONSTRAINT `Vocabularies_ibfk_1` FOREIGN KEY (`languageID`) REFERENCES `Languages` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB AUTO_INCREMENT=9854 DEFAULT CHARSET=utf8 COMMENT='The available Vocabularies.';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `WorkDirectory`
--

DROP TABLE IF EXISTS `WorkDirectory`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `WorkDirectory` (
  `id` int(11) NOT NULL AUTO_INCREMENT COMMENT 'The directory id.',
  `relativePath` varchar(255) NOT NULL COMMENT 'Relative path from the local mount point. Should be the same on all servers',
  `toPurge` tinyint(1) NOT NULL DEFAULT '0' COMMENT 'Can this directory be purged?',
  `creationTime` timestamp NOT NULL DEFAULT '0000-00-00 00:00:00' COMMENT 'The creation time of work directory.',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=1406 DEFAULT CHARSET=utf8 ROW_FORMAT=COMPACT COMMENT='Information of common working directories accross servers.';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `MemberHadGrades`
--
DROP TABLE IF EXISTS `MemberHasGrades`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `MemberHasGrades` (
  `memberID` int(11) NOT NULL COMMENT 'Member id',
  `gradeID` smallint(11) NOT NULL COMMENT 'Grades id',
  UNIQUE KEY `memberID` (`memberID`,`gradeID`),
  UNIQUE KEY `unq_member_grade` (`memberID`,`gradeID`),
  KEY `MemberHasGrades_ibfk_1` (`memberID`),
  KEY `MemberHasGrades_ibfk_2` (`gradeID`),
  CONSTRAINT `MemberHasGrades_ibfk_1` FOREIGN KEY (`memberID`) REFERENCES `Members` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `MemberHasGrades_ibfk_2` FOREIGN KEY (`gradeID`) REFERENCES `Grades` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COMMENT='Members Grades';

--
-- Table structure for table `MemberHasSubjects`
--
DROP TABLE IF EXISTS `MemberHasSubjects`;

CREATE TABLE `MemberHasSubjects` (
  `memberID` int(11) NOT NULL COMMENT 'Member id',
  `subjectID` smallint(11) NOT NULL COMMENT 'Subjects id',
  KEY `MemberHasSubjects_ibfk_1` (`memberID`),
  KEY `MemberHasSubjects_ibfk_2` (`subjectID`),
  UNIQUE KEY `unq_member_subject` (`memberID`,`subjectID`),
  CONSTRAINT `MemberHasSubjects_ibfk_1` FOREIGN KEY (`memberID`) REFERENCES `Members` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `MemberHasSubjects_ibfk_2` FOREIGN KEY (`subjectID`) REFERENCES `Subjects` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COMMENT='Members Subjects';

--
-- Table structure for table `LMSProviders`
--
DROP TABLE IF EXISTS `LMSProviders`;

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `LMSProviders` (
  `id` int(11) NOT NULL AUTO_INCREMENT COMMENT 'The auto-generated provider ID.',
  `name` varchar(255) NOT NULL COMMENT 'The provider name.',
  `description` varchar(2047) DEFAULT NULL COMMENT 'The provider description.',
  PRIMARY KEY (`id`),
  UNIQUE KEY `LMSProviders_name` (`name`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8 ROW_FORMAT=COMPACT COMMENT='LMSProviders may or may not conform to LTI (Learning Tools Interoperability) Spec.';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `LMSProviderApps`
--
DROP TABLE IF EXISTS `LMSProviderApps`;

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `LMSProviderApps` (
  `providerID` int(11) NOT NULL COMMENT 'The provider ID.',
  `appID` varchar(255) DEFAULT NULL COMMENT 'The app ID.',
  `appName` varchar(255) DEFAULT NULL COMMENT 'The CK-12 defined unique app name.',
  `policy` varchar(65535) DEFAULT NULL COMMENT 'The json policy spec for this provider.',
  PRIMARY KEY (`providerID`, `appID`(255)),
  UNIQUE KEY `LMSProviderApps_appID` (`appID`),
  CONSTRAINT `LMSProviderApps_ibfk_1` FOREIGN KEY (`providerID`) REFERENCES `LMSProviders` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8 ROW_FORMAT=COMPACT COMMENT='LMSProviderApps.';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `LMSProviderGroups`
--
DROP TABLE IF EXISTS `LMSProviderGroups`;

CREATE TABLE `LMSProviderGroups` (
  `appID` varchar(255) DEFAULT NULL COMMENT 'The CK-12 defined unique app ID.',
  `providerGroupID` varchar(63) NOT NULL COMMENT 'The provider group ID.',
  `groupID` int(11) DEFAULT NULL COMMENT 'The CK-12 group ID.',
  `title` varchar(255) NOT NULL COMMENT 'The group title.',
  `creationTime` timestamp NOT NULL DEFAULT '0000-00-00 00:00:00' COMMENT 'The creation time of the entry.',
  `updateTime` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'The last modified time.',
  PRIMARY KEY (`appID`, `providerGroupID`),
  KEY `LMSProviderGroups_title` (`title`),
  CONSTRAINT `LMSProviderGroups_ibfk_1` FOREIGN KEY (`appID`) REFERENCES `LMSProviderApps` (`appID`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `LMSProviderGroups_ibfk_2` FOREIGN KEY (`groupID`) REFERENCES `Groups` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8 ROW_FORMAT=COMPACT COMMENT='LMSProviderGroups.';

--
-- Table structure for table `LMSProviderGroupMembers`
--
DROP TABLE IF EXISTS `LMSProviderGroupMembers`;

CREATE TABLE `LMSProviderGroupMembers` (
  `providerID` int(11) NOT NULL COMMENT 'The provider ID.',
  `providerGroupID` varchar(63) NOT NULL COMMENT 'The provider group ID.',
  `providerMemberID` varchar(63) NOT NULL COMMENT 'The provider member ID.',
  `providerMemberRole` varchar(31) NOT NULL COMMENT 'The provider member role.',
  `memberID` int(11) DEFAULT NULL COMMENT 'The CK-12 member ID.',
  PRIMARY KEY (`providerID`, `providerGroupID`, `providerMemberID`),
  CONSTRAINT `LMSProviderGroupMembers_ibfk_1` FOREIGN KEY (`providerID`) REFERENCES `LMSProviders` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `LMSProviderGroupMembers_ibfk_2` FOREIGN KEY (`memberID`) REFERENCES `Members` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8 ROW_FORMAT=COMPACT COMMENT='LMSProviderGroupMembers.';

--
-- Table structure for table `LMSProviderAssignments`
--
DROP TABLE IF EXISTS `LMSProviderAssignments`;

CREATE TABLE `LMSProviderAssignments` (
  `providerID` int(11) NOT NULL COMMENT 'The provider ID.',
  `providerAssignmentID` varchar(63) NOT NULL COMMENT 'The provider assignment ID.',
  `assignmentID` int(11) NOT NULL COMMENT 'The CK-12 assignment ID.',
  PRIMARY KEY (`providerID`, `providerAssignmentID`),
  CONSTRAINT `LMSProviderAssignments_ibfk_1` FOREIGN KEY (`providerID`) REFERENCES `LMSProviders` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `LMSProviderAssignments_ibfk_2` FOREIGN KEY (`assignmentID`) REFERENCES `Assignments` (`assignmentID`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8 ROW_FORMAT=COMPACT COMMENT='LMSProviderAssignments.';

--
-- Table structure for table `LMSProviderAssignmentScores`
--
DROP TABLE IF EXISTS `LMSProviderAssignmentScores`;

CREATE TABLE `LMSProviderAssignmentScores` (
  `providerID` int(11) NOT NULL COMMENT 'The provider ID.',
  `providerGroupID` varchar(63) NOT NULL COMMENT 'The provider group ID.',
  `providerMemberID` varchar(63) NOT NULL COMMENT 'The provider member ID.',
  `providerAssignmentID` varchar(63) NOT NULL COMMENT 'The provider assignment ID.',
  `testScoreID` varchar(255) NULL COMMENT 'The test score ID.',
  `score` smallint(6) DEFAULT NULL COMMENT 'The score in the form of percentage x 100, e.g., 6180 is 61.8%. For items with no practice, this field will be NULL.',
  `status` enum('private', 'reported') DEFAULT 'private' COMMENT 'Has the score been reported or not.',
  PRIMARY KEY (`providerID`, `providerGroupID`, `providerMemberID`, `providerAssignmentID`),
  KEY `LMDProfiderAssignmentScores_status`(`status`),
  CONSTRAINT `LMSProviderAssignmentScores_ibfk_1` FOREIGN KEY (`providerID`) REFERENCES `LMSProviders` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8 ROW_FORMAT=COMPACT COMMENT='LMSProviderAssignmentScores.';


--
-- Table structure for table `GetRealJudgesWeight`
--

DROP TABLE IF EXISTS `GetRealJudgesWeight`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `GetRealJudgesWeight` ( `weight` FLOAT NOT NULL COMMENT 'Weight for the scores from the official judges' ) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

DROP TABLE IF EXISTS `InlineResourceDocuments`;
CREATE TABLE `InlineResourceDocuments` (
    `id` int(11) NOT NULL AUTO_INCREMENT COMMENT 'The autogenerated id for this table', 
    `resourceID` int(11) NOT NULL COMMENT 'Resource ID', 
    `documentID` varchar(128) NOT NULL COMMENT 'Unique ID of box viewer document for the resource.',
    `creationTime` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'The creation time.',
    `updateTime` timestamp NULL DEFAULT NULL COMMENT 'The updated time.',
    PRIMARY KEY (`id`), 
    CONSTRAINT `InlineResourceDocuments_ibfk_1` FOREIGN KEY (`resourceID`) REFERENCES `Resources` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=innoDB DEFAULT CHARSET=utf8 COMMENT='Resource boxviewer document details';

--
-- Table structure for table `migrate_version`
--

DROP TABLE IF EXISTS `migrate_version`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `migrate_version` (
  `repository_id` varchar(255) NOT NULL,
  `repository_path` text,
  `version` int(11) DEFAULT NULL,
  PRIMARY KEY (`repository_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Final view structure for view `ArtifactAndChildren`
--

/*!50001 DROP TABLE IF EXISTS `ArtifactAndChildren`*/;
/*!50001 DROP VIEW IF EXISTS `ArtifactAndChildren`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = latin1 */;
/*!50001 SET character_set_results     = latin1 */;
/*!50001 SET collation_connection      = latin1_swedish_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`dbadmin`@`localhost` SQL SECURITY DEFINER */
/*!50001 VIEW `ArtifactAndChildren` AS select `a`.`id` AS `id`,`a`.`artifactTypeID` AS `artifactTypeID`,`c`.`artifactID` AS `childID`,`rr`.`sequence` AS `sequence` from (((`Artifacts` `a` join `ArtifactRevisions` `r`) join `ArtifactRevisionRelations` `rr`) join `ArtifactRevisions` `c`) where ((`a`.`id` = `r`.`artifactID`) and (`r`.`id` = `rr`.`artifactRevisionID`) and (`rr`.`hasArtifactRevisionID` = `c`.`id`)) */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;

--
-- Final view structure for view `ArtifactAndResources`
--

/*!50001 DROP TABLE IF EXISTS `ArtifactAndResources`*/;
/*!50001 DROP VIEW IF EXISTS `ArtifactAndResources`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = latin1 */;
/*!50001 SET character_set_results     = latin1 */;
/*!50001 SET collation_connection      = latin1_swedish_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`dbadmin`@`localhost` SQL SECURITY DEFINER */
/*!50001 VIEW `ArtifactAndResources` AS select `r`.`artifactID` AS `artifactID`,`a`.`artifactTypeID` AS `artifactTypeID`,`c`.`id` AS `id`,`c`.`resourceTypeID` AS `resourceTypeID`,`c`.`name` AS `name`,`c`.`handle` AS `handle`,`c`.`description` AS `description`,`c`.`authors` AS `authors`,`c`.`license` AS `license`,`c`.`uri` AS `uri`,`c`.`refHash` AS `refHash`,`c`.`ownerID` AS `ownerID`,`c`.`languageID` AS `languageID`,`c`.`isExternal` AS `isExternal`,`c`.`creationTime` AS `creationTime`,`c`.`isAttachment` AS `isAttachment`,`c`.`checksum` AS `checksum`,`c`.`satelliteUrl` AS `satelliteUrl` from ((((`Artifacts` `a` join `ArtifactRevisions` `r`) join `Resources` `c`) join `ResourceRevisions` `d`) join `ArtifactRevisionHasResources` `rr`) where ((`a`.`id` = `r`.`artifactID`) and (`r`.`id` = `rr`.`artifactRevisionID`) and (`rr`.`resourceRevisionID` = `d`.`id`) and (`d`.`resourceID` = `c`.`id`)) */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;

--
-- Final view structure for view `ArtifactAndRevisions`
--

/*!50001 DROP TABLE IF EXISTS `ArtifactAndRevisions`*/;
/*!50001 DROP VIEW IF EXISTS `ArtifactAndRevisions`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = latin1 */;
/*!50001 SET character_set_results     = latin1 */;
/*!50001 SET collation_connection      = latin1_swedish_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`dbadmin`@`localhost` SQL SECURITY DEFINER */
/*!50001 VIEW `ArtifactAndRevisions` AS select `a`.`id` AS `id`,`a`.`artifactTypeID` AS `artifactTypeID`,`a`.`encodedID` AS `encodedID`,`a`.`name` AS `name`,`a`.`description` AS `description`,`a`.`handle` AS `handle`,`a`.`creatorID` AS `creatorID`,`a`.`ancestorID` AS `ancestorID`,`a`.`licenseID` AS `licenseID`,`a`.`creationTime` AS `creationTime`,`a`.`updateTime` AS `updateTime`,`at`.`name` AS `typeName`,`ar`.`id` AS `artifactRevisionID`,`ar`.`revision` AS `revision`,`ar`.`downloads` AS `downloads`,`ar`.`favorites` AS `favorites`,`ar`.`creationTime` AS `revCreationTime`,`ar`.`publishTime` AS `publishTime`,`m`.`login` AS `login` from (((`Artifacts` `a` join `ArtifactRevisions` `ar`) join `ArtifactTypes` `at`) join `Members` `m`) where ((`a`.`id` = `ar`.`artifactID`) and (`a`.`artifactTypeID` = `at`.`id`) and (`a`.`creatorID` = `m`.`id`)) */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;

--
-- Final view structure for view `ArtifactDomainAndStandards`
--

/*!50001 DROP TABLE IF EXISTS `ArtifactDomainAndStandards`*/;
/*!50001 DROP VIEW IF EXISTS `ArtifactDomainAndStandards`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = latin1 */;
/*!50001 SET character_set_results     = latin1 */;
/*!50001 SET collation_connection      = latin1_swedish_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`dbadmin`@`localhost` SQL SECURITY DEFINER */
/*!50001 VIEW `ArtifactDomainAndStandards` AS select `a`.`artifactID` AS `artifactID`,`b`.`id` AS `browseTermID`,`b`.`encodedID` AS `encodedID`,`b`.`name` AS `termName`,`s`.`id` AS `standardID`,`s`.`section` AS `section`,`s`.`title` AS `title`,`s`.`description` AS `description`,`sb`.`id` AS `boardID`,`sb`.`name` AS `boardName`,`sb`.`countryID` AS `countryID`,`sub`.`id` AS `subjectID`,`sub`.`name` AS `subjectName` from (((((`ArtifactHasBrowseTerms` `a` join `BrowseTerms` `b`) join `DomainHasStandards` `d`) join `Standards` `s`) join `StandardBoards` `sb`) join `Subjects` `sub`) where ((`d`.`domainID` = `b`.`id`) and (`d`.`standardID` = `s`.`id`) and (`d`.`domainID` = `a`.`browseTermID`) and (`s`.`standardBoardID` = `sb`.`id`) and (`s`.`subjectID` = `sub`.`id`)) order by `a`.`artifactID`,`s`.`id` */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;

--
-- Final view structure for view `ArtifactDomainsStandardsGradesAndBrowseTerms`
--

/*!50001 DROP TABLE IF EXISTS `ArtifactDomainsStandardsGradesAndBrowseTerms`*/;
/*!50001 DROP VIEW IF EXISTS `ArtifactDomainsStandardsGradesAndBrowseTerms`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = latin1 */;
/*!50001 SET character_set_results     = latin1 */;
/*!50001 SET collation_connection      = latin1_swedish_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`dbadmin`@`localhost` SQL SECURITY DEFINER */
/*!50001 VIEW `ArtifactDomainsStandardsGradesAndBrowseTerms` AS select `ab`.`artifactID` AS `artifactID`,`s`.`id` AS `standardID`,`s`.`section` AS `section`,`s`.`title` AS `title`,`sb`.`id` AS `boardID`,`sb`.`name` AS `boardName`,`sb`.`longname` AS `boardLongName`,`sb`.`sequence` AS `sequence`,`sb`.`countryID` AS `countryID`,`b`.`id` AS `termID`,`b`.`termTypeID` AS `termTypeID`,`b`.`name` AS `termName`,`b`.`parentID` AS `parentID`,`b`.`encodedID` AS `encodedID`,`g`.`id` AS `gradeID`,`g`.`name` AS `gradeName` from ((((((`DomainHasStandards` `d` join `Standards` `s`) join `StandardBoards` `sb`) join `ArtifactHasBrowseTerms` `ab`) join `BrowseTerms` `b`) join `StandardHasGrades` `sg`) join `Grades` `g`) where ((`d`.`domainID` = `b`.`id`) and (`d`.`standardID` = `s`.`id`) and (`s`.`standardBoardID` = `sb`.`id`) and (`ab`.`browseTermID` = `b`.`id`) and (`s`.`id` = `sg`.`standardID`) and (`sg`.`gradeID` = `g`.`id`)) order by `ab`.`artifactID`,`s`.`id` */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;

--
-- Final view structure for view `ArtifactFeedbackAndCount`
--

/*!50001 DROP TABLE IF EXISTS `ArtifactFeedbackAndCount`*/;
/*!50001 DROP VIEW IF EXISTS `ArtifactFeedbackAndCount`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = latin1 */;
/*!50001 SET character_set_results     = latin1 */;
/*!50001 SET collation_connection      = latin1_swedish_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`dbadmin`@`localhost` SQL SECURITY DEFINER */
/*!50001 VIEW `ArtifactFeedbackAndCount` AS select `ArtifactFeedbacks`.`artifactID` AS `artifactID`,`ArtifactFeedbacks`.`type` AS `type`,`ArtifactFeedbacks`.`score` AS `score`,count(0) AS `count` from `ArtifactFeedbacks` group by `ArtifactFeedbacks`.`artifactID`,`ArtifactFeedbacks`.`score`,`ArtifactFeedbacks`.`type` */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;

--
-- Final view structure for view `ArtifactsAndBrowseTerms`
--

/*!50001 DROP TABLE IF EXISTS `ArtifactsAndBrowseTerms`*/;
/*!50001 DROP VIEW IF EXISTS `ArtifactsAndBrowseTerms`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = latin1 */;
/*!50001 SET character_set_results     = latin1 */;
/*!50001 SET collation_connection      = latin1_swedish_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`dbadmin`@`localhost` SQL SECURITY DEFINER */
/*!50001 VIEW `ArtifactsAndBrowseTerms` AS select `a`.`id` AS `id`,`a`.`artifactTypeID` AS `artifactTypeID`,`a`.`creatorID` AS `creatorID`,`b`.`id` AS `browseTermID`,`b`.`name` AS `name`,`b`.`handle` AS `handle`,`b`.`termTypeID` AS `termTypeID`,`b`.`parentID` AS `parentID`,`b`.`encodedID` AS `encodedID` from ((`Artifacts` `a` join `BrowseTerms` `b`) join `ArtifactHasBrowseTerms` `c`) where ((`a`.`id` = `c`.`artifactID`) and (`b`.`id` = `c`.`browseTermID`)) */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;

--
-- Final view structure for view `ArtifactsAndVocabularies`
--

/*!50001 DROP TABLE IF EXISTS `ArtifactsAndVocabularies`*/;
/*!50001 DROP VIEW IF EXISTS `ArtifactsAndVocabularies`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = latin1 */;
/*!50001 SET character_set_results     = latin1 */;
/*!50001 SET collation_connection      = latin1_swedish_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`dbadmin`@`localhost` SQL SECURITY DEFINER */
/*!50001 VIEW `ArtifactsAndVocabularies` AS select `a`.`id` AS `id`,`a`.`artifactTypeID` AS `artifactTypeID`,`a`.`encodedID` AS `encodedID`,`v`.`id` AS `vocabularyID`,`v`.`term` AS `term`,`v`.`definition` AS `definition`,`av`.`sequence` AS `sequence`,`l`.`code` AS `languageCode`,`l`.`name` AS `languageName` from (((`Artifacts` `a` join `Vocabularies` `v`) join `ArtifactHasVocabularies` `av`) join `Languages` `l`) where ((`a`.`id` = `av`.`artifactID`) and (`v`.`id` = `av`.`vocabularyID`) and (`l`.`id` = `v`.`languageID`)) */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;

--
-- Final view structure for view `ArtifactsStandardsGradesAndBrowseTerms`
--

/*!50001 DROP TABLE IF EXISTS `ArtifactsStandardsGradesAndBrowseTerms`*/;
/*!50001 DROP VIEW IF EXISTS `ArtifactsStandardsGradesAndBrowseTerms`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = latin1 */;
/*!50001 SET character_set_results     = latin1 */;
/*!50001 SET collation_connection      = latin1_swedish_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`dbadmin`@`localhost` SQL SECURITY DEFINER */
/*!50001 VIEW `ArtifactsStandardsGradesAndBrowseTerms` AS select `ar`.`artifactID` AS `artifactID`,`s`.`id` AS `id`,`s`.`section` AS `section`,`s`.`title` AS `title`,`sb`.`id` AS `boardID`,`sb`.`name` AS `boardName`,`sb`.`longname` AS `boardLongName`,`sb`.`sequence` AS `sequence`,`sb`.`countryID` AS `countryID`,`b`.`id` AS `termID`,`b`.`termTypeID` AS `termTypeID`,`b`.`name` AS `termName`,`b`.`parentID` AS `parentID`,`b`.`encodedID` AS `encodedID`,`g`.`id` AS `gradeID`,`g`.`name` AS `gradeName` from (((((((`ArtifactRevisionHasStandards` `r` join `Standards` `s`) join `StandardBoards` `sb`) join `ArtifactRevisions` `ar`) join `ArtifactHasBrowseTerms` `ab`) join `BrowseTerms` `b`) join `StandardHasGrades` `sg`) join `Grades` `g`) where ((`r`.`artifactRevisionID` = `ar`.`id`) and (`r`.`standardID` = `s`.`id`) and (`s`.`standardBoardID` = `sb`.`id`) and (`ar`.`artifactID` = `ab`.`artifactID`) and (`ab`.`browseTermID` = `b`.`id`) and (`s`.`id` = `sg`.`standardID`) and (`sg`.`gradeID` = `g`.`id`)) order by `ar`.`artifactID`,`s`.`id` */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;

--
-- Final view structure for view `EncodedIDNeighbors`
--

/*!50001 DROP TABLE IF EXISTS `EncodedIDNeighbors`*/;
/*!50001 DROP VIEW IF EXISTS `EncodedIDNeighbors`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = latin1 */;
/*!50001 SET character_set_results     = latin1 */;
/*!50001 SET collation_connection      = latin1_swedish_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`dbadmin`@`localhost` SQL SECURITY DEFINER */
/*!50001 VIEW `EncodedIDNeighbors` AS select `d`.`domainID` AS `domainID`,`b`.`encodedID` AS `encodedID`,`d`.`requiredDomainID` AS `requiredDomainID`,`c`.`encodedID` AS `requiredEncodedID` from ((`DomainNeighbors` `d` join `BrowseTerms` `b`) join `BrowseTerms` `c`) where ((`d`.`domainID` = `b`.`id`) and (`d`.`requiredDomainID` = `c`.`id`)) */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;

--
-- Final view structure for view `From1xBookMemberInfo`
--

/*!50001 DROP TABLE IF EXISTS `From1xBookMemberInfo`*/;
/*!50001 DROP VIEW IF EXISTS `From1xBookMemberInfo`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = latin1 */;
/*!50001 SET character_set_results     = latin1 */;
/*!50001 SET collation_connection      = latin1_swedish_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`dbadmin`@`localhost` SQL SECURITY DEFINER */
/*!50001 VIEW `From1xBookMemberInfo` AS select `f`.`memberID` AS `memberID`,`f`.`memberID1x` AS `memberID1x`,`f`.`taskID` AS `taskID`,`f`.`started` AS `started`,`f`.`migrated` AS `migrated`,`f`.`status` AS `status`,`m`.`email` AS `email` from (`From1xBookMembers` `f` join `Members` `m`) where (`f`.`memberID` = `m`.`id`) */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;

--
-- Final view structure for view `MemberLibraryArtifactRevisionHasLabels`
--

/*!50001 DROP TABLE IF EXISTS `MemberLibraryArtifactRevisionHasLabels`*/;
/*!50001 DROP VIEW IF EXISTS `MemberLibraryArtifactRevisionHasLabels`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = latin1 */;
/*!50001 SET character_set_results     = latin1 */;
/*!50001 SET collation_connection      = latin1_swedish_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`dbadmin`@`localhost` SQL SECURITY DEFINER */
/*!50001 VIEW `MemberLibraryArtifactRevisionHasLabels` AS select `m`.`labelID` AS `labelID`,`mar`.`memberID` AS `memberID`,`ml`.`label` AS `labelName`,`ml`.`systemLabel` AS `systemLabel`,`ml`.`memberID` AS `labelOwnerID`,`mar`.`id` AS `libraryObjectID`,`mar`.`artifactRevisionID` AS `artifactRevisionID`,`mar`.`objectType` AS `objectType`,`mar`.`domainID` AS `domainID`,`mar`.`added` AS `added`,`ar`.`artifactID` AS `artifactID`,`a`.`artifactTypeID` AS `artifactTypeID`,`a`.`name` AS `name`,`a`.`updateTime` AS `updateTime`,`a`.`creationTime` AS `creationTime`,`a`.`creatorID` AS `creatorID` from ((((`MemberLibraryArtifactRevisions` `mar` left join `MemberLibraryObjectHasLabels` `m` on((`mar`.`id` = `m`.`libraryObjectID`))) left join `MemberLabels` `ml` on((`m`.`labelID` = `ml`.`id`))) join `ArtifactRevisions` `ar`) join `Artifacts` `a`) where ((`mar`.`objectType` in ('artifactRevision','domain')) and (`mar`.`artifactRevisionID` = `ar`.`id`) and (`ar`.`artifactID` = `a`.`id`)) */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;

--
-- Final view structure for view `MemberLibraryArtifactRevisionHasLabelsAndBrowseTerms`
--

/*!50001 DROP TABLE IF EXISTS `MemberLibraryArtifactRevisionHasLabelsAndBrowseTerms`*/;
/*!50001 DROP VIEW IF EXISTS `MemberLibraryArtifactRevisionHasLabelsAndBrowseTerms`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = latin1 */;
/*!50001 SET character_set_results     = latin1 */;
/*!50001 SET collation_connection      = latin1_swedish_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`dbadmin`@`localhost` SQL SECURITY DEFINER */
/*!50001 VIEW `MemberLibraryArtifactRevisionHasLabelsAndBrowseTerms` AS select `m`.`labelID` AS `labelID`,`mar`.`memberID` AS `memberID`,`ml`.`label` AS `labelName`,`ml`.`systemLabel` AS `systemLabel`,`ml`.`memberID` AS `labelOwnerID`,`m`.`libraryObjectID` AS `libraryObjectID`,`mar`.`artifactRevisionID` AS `artifactRevisionID`,`mar`.`objectType` AS `objectType`,`mar`.`domainID` AS `domainID`,`mar`.`added` AS `added`,`ar`.`artifactID` AS `artifactID`,`a`.`artifactTypeID` AS `artifactTypeID`,`a`.`name` AS `name`,`a`.`updateTime` AS `updateTime`,`a`.`creationTime` AS `creationTime`,`a`.`creatorID` AS `creatorID`,`b`.`browseTermID` AS `browseTermID`,`b`.`name` AS `term`,`b`.`termTypeID` AS `termTypeID`,`b`.`parentID` AS `parentID`,`b`.`encodedID` AS `encodedID` from (((((`MemberLibraryArtifactRevisions` `mar` left join `MemberLibraryObjectHasLabels` `m` on((`mar`.`id` = `m`.`libraryObjectID`))) left join `MemberLabels` `ml` on((`m`.`labelID` = `ml`.`id`))) join `ArtifactRevisions` `ar`) join `Artifacts` `a`) join `ArtifactsAndBrowseTerms` `b`) where ((`mar`.`objectType` = 'artifactRevision') and (`mar`.`artifactRevisionID` = `ar`.`id`) and (`ar`.`artifactID` = `a`.`id`) and (`a`.`id` = `b`.`id`)) */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;

--
-- Final view structure for view `MemberLibraryArtifactRevisions`
--

/*!50001 DROP TABLE IF EXISTS `MemberLibraryArtifactRevisions`*/;
/*!50001 DROP VIEW IF EXISTS `MemberLibraryArtifactRevisions`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = latin1 */;
/*!50001 SET character_set_results     = latin1 */;
/*!50001 SET collation_connection      = latin1_swedish_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`dbadmin`@`localhost` SQL SECURITY DEFINER */
/*!50001 VIEW `MemberLibraryArtifactRevisions` AS select `m`.`id` AS `id`,`m`.`memberID` AS `memberID`,`m`.`objectID` AS `artifactRevisionID`,`m`.`objectType` AS `objectType`,`m`.`domainID` AS `domainID`,`m`.`created` AS `added`,`ar`.`artifactID` AS `artifactID`,`a`.`artifactTypeID` AS `artifactTypeID`,`a`.`name` AS `name`,`a`.`updateTime` AS `updateTime`,`a`.`creationTime` AS `creationTime`,`a`.`creatorID` AS `creatorID` from ((`MemberLibraryObjects` `m` join `ArtifactRevisions` `ar`) join `Artifacts` `a`) where ((`m`.`objectType` = 'artifactRevision') and (`m`.`objectID` = `ar`.`id`) and (`ar`.`artifactID` = `a`.`id`)) */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;

--
-- Final view structure for view `MemberLibraryArtifactRevisionsAndBrowseTerms`
--

/*!50001 DROP TABLE IF EXISTS `MemberLibraryArtifactRevisionsAndBrowseTerms`*/;
/*!50001 DROP VIEW IF EXISTS `MemberLibraryArtifactRevisionsAndBrowseTerms`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = latin1 */;
/*!50001 SET character_set_results     = latin1 */;
/*!50001 SET collation_connection      = latin1_swedish_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`dbadmin`@`localhost` SQL SECURITY DEFINER */
/*!50001 VIEW `MemberLibraryArtifactRevisionsAndBrowseTerms` AS select `m`.`id` AS `id`,`m`.`memberID` AS `memberID`,`m`.`objectID` AS `artifactRevisionID`,`m`.`objectType` AS `objectType`,`m`.`domainID` AS `domainID`,`m`.`created` AS `added`,`ar`.`artifactID` AS `artifactID`,`a`.`artifactTypeID` AS `artifactTypeID`,`a`.`name` AS `name`,`a`.`updateTime` AS `updateTime`,`a`.`creationTime` AS `creationTime`,`a`.`creatorID` AS `creatorID`,`b`.`browseTermID` AS `browseTermID`,`b`.`name` AS `term`,`b`.`termTypeID` AS `termTypeID`,`b`.`encodedID` AS `encodedID`,`b`.`parentID` AS `parentID` from (((`MemberLibraryObjects` `m` join `ArtifactRevisions` `ar`) join `Artifacts` `a`) join `ArtifactsAndBrowseTerms` `b`) where ((`m`.`objectType` = 'artifactRevision') and (`m`.`objectID` = `ar`.`id`) and (`ar`.`artifactID` = `a`.`id`) and (`a`.`id` = `b`.`id`)) */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;

--
-- Final view structure for view `MemberLibraryResourceRevisionHasLabels`
--

/*!50001 DROP TABLE IF EXISTS `MemberLibraryResourceRevisionHasLabels`*/;
/*!50001 DROP VIEW IF EXISTS `MemberLibraryResourceRevisionHasLabels`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = latin1 */;
/*!50001 SET character_set_results     = latin1 */;
/*!50001 SET collation_connection      = latin1_swedish_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`dbadmin`@`localhost` SQL SECURITY DEFINER */
/*!50001 VIEW `MemberLibraryResourceRevisionHasLabels` AS select `m`.`labelID` AS `labelID`,`mar`.`memberID` AS `memberID`,`ml`.`label` AS `labelName`,`ml`.`systemLabel` AS `systemLabel`,`ml`.`memberID` AS `labelOwnerID`,`mar`.`id` AS `libraryObjectID`,`mar`.`resourceRevisionID` AS `resourceRevisionID`,`mar`.`objectType` AS `objectType`,`mar`.`domainID` AS `domainID`,`mar`.`added` AS `added`,`ar`.`resourceID` AS `resourceID`,`a`.`resourceTypeID` AS `resourceTypeID`,`a`.`name` AS `name`,`a`.`uri` AS `uri`,`a`.`isAttachment` AS `isAttachment`,`a`.`creationTime` AS `creationTime`,`a`.`ownerID` AS `ownerID` from ((((`MemberLibraryResourceRevisions` `mar` left join `MemberLibraryObjectHasLabels` `m` on((`mar`.`id` = `m`.`libraryObjectID`))) left join `MemberLabels` `ml` on((`m`.`labelID` = `ml`.`id`))) join `ResourceRevisions` `ar`) join `Resources` `a`) where ((`mar`.`objectType` = 'resourceRevision') and (`mar`.`resourceRevisionID` = `ar`.`id`) and (`ar`.`resourceID` = `a`.`id`)) */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;

--
-- Final view structure for view `MemberLibraryResourceRevisions`
--

/*!50001 DROP TABLE IF EXISTS `MemberLibraryResourceRevisions`*/;
/*!50001 DROP VIEW IF EXISTS `MemberLibraryResourceRevisions`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = latin1 */;
/*!50001 SET character_set_results     = latin1 */;
/*!50001 SET collation_connection      = latin1_swedish_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`dbadmin`@`localhost` SQL SECURITY DEFINER */
/*!50001 VIEW `MemberLibraryResourceRevisions` AS select `m`.`id` AS `id`,`m`.`memberID` AS `memberID`,`m`.`objectID` AS `resourceRevisionID`,`m`.`objectType` AS `objectType`,`m`.`domainID` AS `domainID`,`m`.`created` AS `added`,`ar`.`resourceID` AS `resourceID`,`a`.`resourceTypeID` AS `resourceTypeID`,`a`.`name` AS `name`,`a`.`uri` AS `uri`,`a`.`creationTime` AS `creationTime`,`a`.`ownerID` AS `ownerID` from ((`MemberLibraryObjects` `m` join `ResourceRevisions` `ar`) join `Resources` `a`) where ((`m`.`objectType` = 'resourceRevision') and (`m`.`objectID` = `ar`.`id`) and (`ar`.`resourceID` = `a`.`id`)) */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;

--
-- Final view structure for view `PublishedArtifacts`
--

/*!50001 DROP TABLE IF EXISTS `PublishedArtifacts`*/;
/*!50001 DROP VIEW IF EXISTS `PublishedArtifacts`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = latin1 */;
/*!50001 SET character_set_results     = latin1 */;
/*!50001 SET collation_connection      = latin1_swedish_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`dbadmin`@`localhost` SQL SECURITY DEFINER */
/*!50001 VIEW `PublishedArtifacts` AS select `a`.`id` AS `id`,`a`.`artifactTypeID` AS `artifactTypeID`,`a`.`encodedID` AS `encodedID`,`a`.`name` AS `name`,`a`.`description` AS `description`,`a`.`handle` AS `handle`,`a`.`creatorID` AS `creatorID`,`a`.`ancestorID` AS `ancestorID`,`a`.`licenseID` AS `licenseID`,`a`.`creationTime` AS `creationTime`,`a`.`updateTime` AS `updateTime`,`ar`.`id` AS `artifactRevisionID`,`ar`.`revision` AS `revision`,`ar`.`publishTime` AS `publishTime` from (`Artifacts` `a` join `ArtifactRevisions` `ar`) where ((`a`.`id` = `ar`.`artifactID`) and (`ar`.`publishTime` is not null) and (`ar`.`id` = (select max(`ArtifactRevisions`.`id`) AS `MAX(id)` from `ArtifactRevisions` where (`ArtifactRevisions`.`artifactID` = `a`.`id`)))) */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;

--
-- Final view structure for view `RelatedArtifactsAndLevels`
--

/*!50001 DROP TABLE IF EXISTS `RelatedArtifactsAndLevels`*/;
/*!50001 DROP VIEW IF EXISTS `RelatedArtifactsAndLevels`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = latin1 */;
/*!50001 SET character_set_results     = latin1 */;
/*!50001 SET collation_connection      = latin1_swedish_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`dbadmin`@`localhost` SQL SECURITY DEFINER */
/*!50001 VIEW `RelatedArtifactsAndLevels` AS select `a`.`id` AS `id`,`a`.`artifactTypeID` AS `artifactTypeID`,`a`.`encodedID` AS `encodedID`,`a`.`name` AS `name`,`a`.`description` AS `description`,`a`.`handle` AS `handle`,`a`.`creatorID` AS `creatorID`,`a`.`ancestorID` AS `ancestorID`,`a`.`licenseID` AS `licenseID`,`a`.`creationTime` AS `creationTime`,`a`.`updateTime` AS `updateTime`,`ar`.`id` AS `artifactRevisionID`,`ar`.`publishTime` AS `publishTime`,`lvl`.`id` AS `levelID`,`lvl`.`name` AS `level`,`ra`.`domainID` AS `domainID`,`ra`.`sequence` AS `sequence`,`d`.`name` AS `domainTerm`,`d`.`handle` AS `domainHandle`,`d`.`encodedID` AS `domainEID`,`d`.`parentID` AS `parentID` from (((((`Artifacts` `a` left join `ArtifactsAndBrowseTerms` `lvl` on(((`a`.`id` = `lvl`.`id`) and (`lvl`.`termTypeID` = 7)))) join `ArtifactRevisions` `ar`) join `RelatedArtifacts` `ra`) join `BrowseTerms` `d`) join `ArtifactTypes` `at`) where ((`ra`.`artifactID` = `a`.`id`) and (`ra`.`domainID` = `d`.`id`) and (`d`.`termTypeID` in (4,10)) and (`ar`.`artifactID` = `a`.`id`) and (`ar`.`id` = (select max(`ArtifactRevisions`.`id`) AS `MAX(id)` from `ArtifactRevisions` where (`ArtifactRevisions`.`artifactID` = `a`.`id`))) and (`a`.`artifactTypeID` = `at`.`id`) and (`at`.`modality` = 1)) */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;

--
-- Final view structure for view `RevisionAndResources`
--

/*!50001 DROP TABLE IF EXISTS `RevisionAndResources`*/;
/*!50001 DROP VIEW IF EXISTS `RevisionAndResources`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = latin1 */;
/*!50001 SET character_set_results     = latin1 */;
/*!50001 SET collation_connection      = latin1_swedish_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`dbadmin`@`localhost` SQL SECURITY DEFINER */
/*!50001 VIEW `RevisionAndResources` AS select `rev`.`artifactRevisionID` AS `revID`,`res`.`id` AS `id`,`res`.`resourceID` AS `resourceID`,`res`.`revision` AS `revision`,`res`.`hash` AS `hash`,`res`.`creationTime` AS `creationTime`,`res`.`filesize` AS `filesize`,`res`.`publishTime` AS `publishTime` from (`ArtifactRevisionHasResources` `rev` join `ResourceRevisions` `res`) where (`rev`.`resourceRevisionID` = `res`.`id`) order by `rev`.`artifactRevisionID`,`res`.`id` */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;

--
-- Final view structure for view `RevisionAndStandards`
--

/*!50001 DROP TABLE IF EXISTS `RevisionAndStandards`*/;
/*!50001 DROP VIEW IF EXISTS `RevisionAndStandards`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = latin1 */;
/*!50001 SET character_set_results     = latin1 */;
/*!50001 SET collation_connection      = latin1_swedish_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`dbadmin`@`localhost` SQL SECURITY DEFINER */
/*!50001 VIEW `RevisionAndStandards` AS select `r`.`artifactRevisionID` AS `rid`,`a`.`artifactID` AS `artifactID`,`s`.`id` AS `standardID`,`s`.`section` AS `section`,`s`.`title` AS `title`,`s`.`description` AS `description`,`sb`.`id` AS `boardID`,`sb`.`name` AS `boardName`,`sb`.`countryID` AS `countryID`,`sub`.`id` AS `subjectID`,`sub`.`name` AS `subjectName` from ((((`ArtifactRevisionHasStandards` `r` join `ArtifactRevisions` `a`) join `Standards` `s`) join `StandardBoards` `sb`) join `Subjects` `sub`) where ((`r`.`artifactRevisionID` = `a`.`id`) and (`r`.`standardID` = `s`.`id`) and (`s`.`standardBoardID` = `sb`.`id`) and (`s`.`subjectID` = `sub`.`id`)) order by `r`.`artifactRevisionID`,`s`.`id` */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;

--
-- Final view structure for view `RwaVotes`
--

/*!50001 DROP TABLE IF EXISTS `RwaVotes`*/;
/*!50001 DROP VIEW IF EXISTS `RwaVotes`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = latin1 */;
/*!50001 SET character_set_results     = latin1 */;
/*!50001 SET collation_connection      = latin1_swedish_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`dbadmin`@`localhost` SQL SECURITY DEFINER */
/*!50001 VIEW `RwaVotes` AS (select `a`.`id` AS `id`,`a`.`updateTime` AS `updatetime`,`a`.`creatorID` AS `creatorID`,0 AS `votes` from ((`Artifacts` `a` join `ArtifactHasBrowseTerms` `ab`) join `BrowseTerms` `b`) where ((`a`.`artifactTypeID` = 13) and (`a`.`id` = `ab`.`artifactID`) and (`ab`.`browseTermID` = `b`.`id`) and (`b`.`termTypeID` = 11) and (not(`a`.`id` in (select distinct `ArtifactFeedbacks`.`artifactID` AS `artifactID` from `ArtifactFeedbacks` where ((`ArtifactFeedbacks`.`type` = 'relevance') or (`ArtifactFeedbacks`.`type` = 'creativity') or (`ArtifactFeedbacks`.`type` = 'clarity') or (`ArtifactFeedbacks`.`type` = 'impactful'))))))) union (select `a`.`id` AS `id`,`a`.`updateTime` AS `updatetime`,`a`.`creatorID` AS `creatorID`,count(0) AS `votes` from (((`Artifacts` `a` join `ArtifactHasBrowseTerms` `ab` on((`a`.`id` = `ab`.`artifactID`))) join `BrowseTerms` `b` on(((`ab`.`browseTermID` = `b`.`id`) and (`b`.`termTypeID` = 11)))) left join `ArtifactFeedbacks` `af` on((`a`.`id` = `af`.`artifactID`))) where (((`a`.`artifactTypeID` = 13) and (`af`.`type` = 'relevance')) or (`af`.`type` = 'creativity') or (`af`.`type` = 'clarity') or (`af`.`type` = 'impactful')) group by `af`.`artifactID`) order by `votes` */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;

--
-- Final view structure for view `StandardAndGrades`
--

/*!50001 DROP TABLE IF EXISTS `StandardAndGrades`*/;
/*!50001 DROP VIEW IF EXISTS `StandardAndGrades`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = latin1 */;
/*!50001 SET character_set_results     = latin1 */;
/*!50001 SET collation_connection      = latin1_swedish_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`dbadmin`@`localhost` SQL SECURITY DEFINER */
/*!50001 VIEW `StandardAndGrades` AS select `s`.`standardID` AS `sid`,`g`.`id` AS `id`,`g`.`name` AS `name` from (`StandardHasGrades` `s` join `Grades` `g`) where (`s`.`gradeID` = `g`.`id`) order by `s`.`standardID` */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;

--
-- Final view structure for view `TypedArtifactFavorites`
--

/*!50001 DROP TABLE IF EXISTS `TypedArtifactFavorites`*/;
/*!50001 DROP VIEW IF EXISTS `TypedArtifactFavorites`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = latin1 */;
/*!50001 SET character_set_results     = latin1 */;
/*!50001 SET collation_connection      = latin1_swedish_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`dbadmin`@`localhost` SQL SECURITY DEFINER */
/*!50001 VIEW `TypedArtifactFavorites` AS select distinct `f`.`memberID` AS `memberID`,`a`.`id` AS `artifactID`,`t`.`name` AS `typeName` from (((`ArtifactRevisionFavorites` `f` join `Artifacts` `a`) join `ArtifactRevisions` `r`) join `ArtifactTypes` `t`) where ((`f`.`artifactRevisionID` = `r`.`id`) and (`r`.`artifactID` = `a`.`id`) and (`a`.`artifactTypeID` = `t`.`id`)) order by `f`.`memberID`,`t`.`name`,`a`.`id` */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;

--
-- Final view structure for view `TypedFeaturedArtifacts`
--

/*!50001 DROP TABLE IF EXISTS `TypedFeaturedArtifacts`*/;
/*!50001 DROP VIEW IF EXISTS `TypedFeaturedArtifacts`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = latin1 */;
/*!50001 SET character_set_results     = latin1 */;
/*!50001 SET collation_connection      = latin1_swedish_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`dbadmin`@`localhost` SQL SECURITY DEFINER */
/*!50001 VIEW `TypedFeaturedArtifacts` AS select `f`.`artifactID` AS `id`,`f`.`listOrder` AS `listOrder`,`f`.`comments` AS `comments`,`t`.`name` AS `typeName` from ((`FeaturedArtifacts` `f` join `Artifacts` `a`) join `ArtifactTypes` `t`) where ((`f`.`artifactID` = `a`.`id`) and (`a`.`artifactTypeID` = `t`.`id`)) order by `f`.`listOrder` */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;

--
-- Final view structure for view `TypedMemberViewedArtifacts`
--

/*!50001 DROP TABLE IF EXISTS `TypedMemberViewedArtifacts`*/;
/*!50001 DROP VIEW IF EXISTS `TypedMemberViewedArtifacts`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = latin1 */;
/*!50001 SET character_set_results     = latin1 */;
/*!50001 SET collation_connection      = latin1_swedish_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`dbadmin`@`localhost` SQL SECURITY DEFINER */
/*!50001 VIEW `TypedMemberViewedArtifacts` AS select `m`.`memberID` AS `memberID`,`m`.`artifactID` AS `artifactID`,`t`.`name` AS `typeName`,`m`.`lastViewTime` AS `lastViewTime` from ((`MemberViewedArtifacts` `m` join `Artifacts` `a`) join `ArtifactTypes` `t`) where ((`m`.`artifactID` = `a`.`id`) and (`a`.`artifactTypeID` = `t`.`id`)) order by `m`.`memberID`,`t`.`name`,`m`.`lastViewTime` desc */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;


--
-- Table structure for table `Retrolation`
--

DROP TABLE IF EXISTS `Retrolation`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;

CREATE TABLE `Retrolation` (
  `domainEID` varchar(255) NOT NULL,
  `sectionEID` varchar(255) NOT NULL,
  PRIMARY KEY (`domainEID`, `sectionEID`),
  CONSTRAINT `Retrolation_ibfk_1` FOREIGN KEY (`domainEID`) REFERENCES `BrowseTerms` (`encodedID`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `ArtifactContributionType`
--

DROP TABLE IF EXISTS `ArtifactContributionType`;
CREATE TABLE `ArtifactContributionType`(
`artifactID` INT NOT NULL COMMENT 'The artifact id.' ,
`typeName` ENUM('original', 'derived', 'modified') COMMENT 'contributionType' ,
CONSTRAINT `ArtifactContributionType_ibfk_1` FOREIGN KEY (`artifactID` ) REFERENCES `Artifacts` (`id` ) ON DELETE NO ACTION ON UPDATE NO ACTION
)ENGINE=InnoDB DEFAULT CHARSET=utf8 COMMENT='Artifacts Contribution Type.';

--
-- Table structure for table `MemberLocations`
--

DROP TABLE IF EXISTS `MemberLocations`;
CREATE TABLE `MemberLocations` (
      `memberID` int(11) NOT NULL COMMENT 'The id of the member.',
      `countryID` int(11) NOT NULL COMMENT 'The country this standard board belongs to.',
      `addressID` int(11) NOT NULL COMMENT 'The address id, from different address tables depending on country.',
      PRIMARY KEY (`memberID`),
      UNIQUE KEY `memberID` (`memberID`,`countryID`,`addressID`),
      KEY `MemberLocations_ibfk_2` (`countryID`),
      CONSTRAINT `MemberLocations_ibfk_1` FOREIGN KEY (`memberID`) REFERENCES `Members` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
      CONSTRAINT `MemberLocations_ibfk_2` FOREIGN KEY (`countryID`) REFERENCES `Countries` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COMMENT='Member Locations.';

--
-- Table structure for table `StopWords`
--

DROP TABLE IF EXISTS `StopWords`;
CREATE TABLE `StopWords` (
	  `word` varchar(255) NOT NULL COMMENT 'The group id.',
	  PRIMARY KEY (`word`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;


DROP TABLE IF EXISTS `ArtifactDraft`;
CREATE TABLE `ArtifactDraft` (
  `id` int(11) NOT NULL AUTO_INCREMENT COMMENT 'The auto generated artifactDraft id.',
  `creatorID` int(11) NOT NULL COMMENT 'The creator of this artifactDraft.',
  `artifactTypeID` smallint(6) NOT NULL COMMENT 'The artifact type id.',
  `handle` varchar(255) NOT NULL COMMENT 'The handle of the artifact. Used for perma URL',
  `artifactRevisionID` int(11) DEFAULT NULL COMMENT 'The artifact revision from which this artifactDraft is derived from.',
  `draft` mediumblob NOT NULL COMMENT 'The draft of the artifact. stored in formats like JSON / XML.',
  `isCompressed` tinyint(1) NOT NULL DEFAULT 0 COMMENT '1 => draft is are compressed. anyThingElse ==> they are not',
  `created` timestamp NOT NULL DEFAULT '0000-00-00 00:00:00' COMMENT 'The creation time of the entry.',
  `updated` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'The last modified time of this entry.',
  PRIMARY KEY (`id`),
  UNIQUE KEY `ArtifactDraft_uk_creator-type-handle` (`creatorID`,`handle`,`artifactTypeID`),
  UNIQUE KEY `ArtifactDraft_uk_creator-revision` (`creatorID`,`artifactRevisionID`),
  CONSTRAINT `ArtifactDraft_fk_creator` FOREIGN KEY (`creatorID`) REFERENCES `Members` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `ArtifactDraft_fk_type` FOREIGN KEY (`artifactTypeID`) REFERENCES `ArtifactTypes` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `ArtifactDraft_fk_revision` FOREIGN KEY (`artifactRevisionID`) REFERENCES `ArtifactRevisions` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COMMENT='The common metadata for artifactdraft.';
-- Dump completed on 2013-05-08 13:23:3

DROP TABLE IF EXISTS `BlockedMembers`;
CREATE TABLE `BlockedMembers` (
  `memberID` int(11) NOT NULL COMMENT 'The member id.',
  `objectType` enum('group','artifact','notifications') NOT NULL,
  `subObjectType` enum('public-forum','study','class','book','concept','email','web') DEFAULT NULL,
  `objectID` varchar(52) DEFAULT NULL COMMENT 'The reference object id',
  `blockedBy` int(11) NOT NULL COMMENT 'The member id.',
  `reason` varchar(16383) DEFAULT NULL COMMENT 'Reason why user is resricted of specific activity.',
  `creationTime` timestamp NOT NULL DEFAULT '0000-00-00 00:00:00' COMMENT 'The creation time.',
   CONSTRAINT `BlockedMembers_ibfk_1` FOREIGN KEY (`memberID`) REFERENCES `Members` (`id`) ON DELETE CASCADE ON UPDATE NO ACTION,
   CONSTRAINT `BlockedMembers_ibfk_2` FOREIGN KEY (`blockedBy`) REFERENCES `Members` (`id`) ON DELETE CASCADE ON UPDATE NO ACTION,
   UNIQUE KEY `memberID` (`memberID`,`objectType`,`subObjectType`, `objectID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COMMENT='Blocked Members list.';

--
-- Table structure for table `GroupHasSubjects`
--
DROP TABLE IF EXISTS `GroupHasSubjects`;

CREATE TABLE `GroupHasSubjects` (
  `groupID` int(11) NOT NULL COMMENT 'Group id',
  `subjectID` smallint(11) NOT NULL COMMENT 'Subjects id',
  KEY `GroupHasSubjects_ibfk_1` (`groupID`),
  KEY `GroupHasSubjects_ibfk_2` (`subjectID`),
  UNIQUE KEY `unq_group_subject` (`groupID`,`subjectID`),
  CONSTRAINT `GroupHasSubjects_ibfk_1` FOREIGN KEY (`groupID`) REFERENCES `Groups` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `GroupHasSubjects_ibfk_2` FOREIGN KEY (`subjectID`) REFERENCES `Subjects` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COMMENT='Group Subjects';

--
-- Table structure for table `GroupHasGrades`
--
DROP TABLE IF EXISTS `GroupHasGrades`;

CREATE TABLE `GroupHasGrades` (
  `groupID` int(11) NOT NULL COMMENT 'Group id',
  `gradeID` smallint(11) NOT NULL COMMENT 'Grade id',
  KEY `GroupHasGrades_ibfk_1` (`groupID`),
  KEY `GroupHasGrades_ibfk_2` (`gradeID`),
  UNIQUE KEY `unq_group_grade` (`groupID`,`gradeID`),
  CONSTRAINT `GroupHasGrades_ibfk_1` FOREIGN KEY (`groupID`) REFERENCES `Groups` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `GroupHasGrades_ibfk_2` FOREIGN KEY (`gradeID`) REFERENCES `Grades` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COMMENT='Group Grades';

--
-- Table structure for table `BookEditingAssignments`
--
DROP TABLE IF EXISTS `BookEditingAssignments`;

CREATE TABLE `BookEditingAssignments` (
    `artifactID` INT(11) NOT NULL COMMENT 'The assigned artifact ID.',
    `bookID` INT(11) NOT NULL COMMENT 'The artifact ID of the book.',
    `assigneeID` INT(11) NOT NULL COMMENT 'The member ID of the assignee.',
    `groupID` INT(11) NOT NULL COMMENT 'The corresponding group ID.',
    `artifactTypeID` SMALLINT(6) NOT NULL COMMENT 'The assigned artifact type ID.',
    `creationTime` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'The creation time.',
    PRIMARY KEY(`artifactID`),
    KEY `BookEditingAssignments_key_1` (`bookID`),
    KEY `BookEditingAssignments_key_2` (`assigneeID`),
    KEY `BookEditingAssignments_key_3` (`groupID`),
    KEY `BookEditingAssignments_key_4` (`artifactTypeID`),
    CONSTRAINT `BookEditingAssignments_ibfk_1` FOREIGN KEY (`artifactID`) REFERENCES `Artifacts` (`id`) ON DELETE CASCADE ON UPDATE NO ACTION,
    CONSTRAINT `BookEditingAssignments_ibfk_2` FOREIGN KEY (`bookID`) REFERENCES `Artifacts` (`id`) ON DELETE CASCADE ON UPDATE NO ACTION,
    CONSTRAINT `BookEditingAssignments_ibfk_3` FOREIGN KEY (`assigneeID`) REFERENCES `Members` (`id`) ON DELETE CASCADE ON UPDATE NO ACTION,
    CONSTRAINT `BookEditingAssignments_ibfk_4` FOREIGN KEY (`groupID`) REFERENCES `Groups` (`id`) ON DELETE CASCADE ON UPDATE NO ACTION,
    CONSTRAINT `BookEditingAssignments_ibfk_5` FOREIGN KEY (`artifactTypeID`) REFERENCES `ArtifactTypes` (`id`) ON DELETE CASCADE ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8 ROW_FORMAT=COMPACT COMMENT='BookEditingAssignments';

--
-- Table structure for table `BookEditingDrafts`
--
DROP TABLE IF EXISTS `BookEditingDrafts`;

CREATE TABLE `BookEditingDrafts` (
    `artifactRevisionID` INT(11) NOT NULL COMMENT 'The editing artifact revision ID.',
    `assigneeID` INT(11) NOT NULL COMMENT 'The member ID of the assignee.',
    `creationTime` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'The creation time.',
    PRIMARY KEY(`artifactRevisionID`),
    KEY `BookEditingDrafts_key_1` (`assigneeID`),
    CONSTRAINT `BookEditingDrafts_ibfk_1` FOREIGN KEY (`artifactRevisionID`) REFERENCES `ArtifactRevisions` (`id`) ON DELETE CASCADE ON UPDATE NO ACTION,
    CONSTRAINT `BookEditingDrafts_ibfk_2` FOREIGN KEY (`assigneeID`) REFERENCES `Members` (`id`) ON DELETE CASCADE ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8 ROW_FORMAT=COMPACT COMMENT='BookEditingDrafts';

--
-- Table structure for table `BookFinalizations`
--
DROP TABLE IF EXISTS `BookFinalizationLocks`;
DROP TABLE IF EXISTS `BookFinalizations`;

CREATE TABLE `BookFinalizations` (
    `bookID` INT(11) NOT NULL COMMENT 'The artifact id of the finalizing book.',
    `taskID` varchar(255) NULL DEFAULT NULL COMMENT 'The task id',
    `total` SMALLINT(6) NOT NULL COMMENT 'The total number of finalizing artifacts within this book.',
    `completed` SMALLINT(6) NOT NULL DEFAULT 0 COMMENT 'The number of completed artifacts.',
    `creationTime` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'The creation time.',
    `updateTime` TIMESTAMP NULL DEFAULT NULL COMMENT 'The update time.',
    PRIMARY KEY(`bookID`),
    UNIQUE KEY `BookFinalizations_key_1` (`taskID`),
    CONSTRAINT `BookFinalizations_ibfk_1` FOREIGN KEY (`bookID`) REFERENCES `Artifacts` (`id`) ON DELETE CASCADE ON UPDATE NO ACTION,
    CONSTRAINT `BookFinalizations_ibfk_2` FOREIGN KEY (`taskID`) REFERENCES `Tasks` (`taskID`) ON DELETE CASCADE ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8 ROW_FORMAT=COMPACT COMMENT='BookFinalizations';

--
-- Table structure for table `BookFinalizationLocks`
--
CREATE TABLE `BookFinalizationLocks` (
    `artifactID` INT(11) NOT NULL COMMENT 'The assigned artifact ID.',
    `bookID` INT(11) NOT NULL COMMENT 'The artifact id of the finalizing book.',
    `message` VARCHAR(4096) COMMENT 'The message during finalization for this artifact.',
    PRIMARY KEY(`artifactID`),
    KEY `BookFinalizationLocks_key_1` (`bookID`),
    CONSTRAINT `BookFinalizationLocks_ibfk_1` FOREIGN KEY (`artifactID`) REFERENCES `Artifacts` (`id`) ON DELETE CASCADE ON UPDATE NO ACTION,
    CONSTRAINT `BookFinalizationLocks_ibfk_2` FOREIGN KEY (`bookID`) REFERENCES `Artifacts` (`id`) ON DELETE CASCADE ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8 ROW_FORMAT=COMPACT COMMENT='BookFinalizationLocks';

--
-- Table structure for table `MigratedConcepts`
--
DROP TABLE IF EXISTS `MigratedConcepts`;

CREATE TABLE `MigratedConcepts` (
    `originalEID` varchar(100) not null, 
    `newEID` varchar(100) not null, 
    PRIMARY KEY (`originalEID`, `newEID`), 
    UNIQUE KEY `originalEID` (`originalEID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 ROW_FORMAT=COMPACT COMMENT='EID Mappings for concept migration';

--
-- Table structure for table `MemberSelfStudyItemStatus`
--

DROP TABLE IF EXISTS `MemberSelfStudyItemStatus`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `MemberSelfStudyItemStatus` (
  `domainID` int(11) NOT NULL COMMENT 'The domain id',
  `memberID` int(11) NOT NULL COMMENT 'The member id.',
  `conceptCollectionHandle` varchar(128) NOT NULL DEFAULT '' COMMENT 'The conceptCollectionHandle for the EID.',
  `collectionCreatorID` int(11) NOT NULL DEFAULT 0 COMMENT 'The cK-12 member id.',
  `status` enum('completed', 'skipped', 'incomplete') DEFAULT 'incomplete' COMMENT 'The status of this item.',
  `score` smallint(6) DEFAULT NULL COMMENT 'The score in the form of percentage x 100, e.g., 6180 is 61.8%. For items with no practice, this field will be NULL.',
  `lastAccess` timestamp NULL DEFAULT 0 COMMENT 'The most recent access time. The value NULL means not yet access.',
  `contextUrl` varchar(1024) DEFAULT NULL COMMENT 'The context url for the domain item.',
  PRIMARY KEY (`domainID`, `memberID`, `conceptCollectionHandle`, `collectionCreatorID`),
  KEY `MemberSelfStudyItemStatus_status` (`status`),
  KEY `MemberSelfStudyItemStatus_score` (`score`),
  KEY `MemberSelfStudyItemStatus_lastAccess` (`lastAccess`),
  CONSTRAINT `MemberSelfStudyItemStatus_domain_ibfk_1` FOREIGN KEY (`domainID`) REFERENCES `Artifacts` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `MemberSelfStudyItemStatus_member_ibfk_2` FOREIGN KEY (`memberID`) REFERENCES `Members` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `MemberStudyTrackItemStatus_collectionCreator_ibfk_2` FOREIGN KEY (`collectionCreatorID`) REFERENCES `Members` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;


