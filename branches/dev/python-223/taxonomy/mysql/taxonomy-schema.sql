-- MySQL dump 10.13  Distrib 5.1.33, for pc-linux-gnu (i686)
--
-- Host: localhost    Database: flx2
-- ------------------------------------------------------
-- Server version	5.1.33

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
-- Table structure for table `ArtifactExtensionTypes`
--

DROP TABLE IF EXISTS `ArtifactExtensionTypes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `ArtifactExtensionTypes` (
    `id` int(11) NOT NULL AUTO_INCREMENT COMMENT 'The object id',
    `typeName` varchar(200) NOT NULL COMMENT 'The name of the type',
    `description` varchar(1024) COMMENT 'The description of the type',
    `shortname` varchar(10) COMMENT 'The short name to be used in artifact encode ID',
    `status` varchar(20) NOT NULL DEFAULT 'published' COMMENT 'The current status of this extension type',
    `created` timestamp NOT NULL DEFAULT '0000-00-00 00:00:00' COMMENT 'The timestamp this type was created',
    `updated` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'The update time',
    PRIMARY KEY (`id`),
    UNIQUE KEY(`shortname`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 ROW_FORMAT=COMPACT COMMENT='ArtifactExtensionTypes';
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
    `shortname` varchar(10) NOT NULL COMMENT 'The short name for the subject (3-letter code for ConceptNode ID)',
    `description` varchar(1023) COMMENT 'The subject description',
    `previewImageUrl` varchar(1023) COMMENT 'The preview image Url',
    `created` timestamp NOT NULL DEFAULT '0000-00-00 00:00:00' COMMENT 'The timestamp this subject was created',
    `updated` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'The update time',
    PRIMARY KEY (`id`),
    UNIQUE KEY (`name`),
    UNIQUE KEY (`shortname`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COMMENT='The subjects.';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `Branches`
--

DROP TABLE IF EXISTS `Branches`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `Branches` (
    `id` smallint(6) NOT NULL AUTO_INCREMENT COMMENT 'The auto generated id.',
    `name` varchar(63) NOT NULL COMMENT 'The branch name.',
    `shortname` varchar(10) NOT NULL COMMENT 'The short name for the branch (3-letter code for ConceptNode ID)',
    `subjectID` smallint(6) COMMENT 'The subject id that is parent of this branch.',
    `description` varchar(1023) COMMENT 'The branch description',
    `previewImageUrl` varchar(1023) COMMENT 'The preview image Url',
    `bisac` varchar(9) COMMENT 'The BISAC code - a book industry standard - for this topic',
    `created` timestamp NOT NULL DEFAULT '0000-00-00 00:00:00' COMMENT 'The timestamp this branch was created',
    `updated` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'The update time',
    PRIMARY KEY (`id`),
    UNIQUE KEY (`name`, `subjectID`),
    UNIQUE KEY(`shortname`, `subjectID`),
    CONSTRAINT `Branches_ibfk_1` FOREIGN KEY (`subjectID`) REFERENCES `Subjects` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COMMENT='The Branches.';
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
    UNIQUE KEY (`code`),
    UNIQUE KEY (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COMMENT='Languages.';
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
    `image` varchar(255) DEFAULT NULL COMMENT 'The Url of the image that represents the country.',
    `created` timestamp NOT NULL DEFAULT '0000-00-00 00:00:00' COMMENT 'The creation time of the entry.',
    `updated` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'The last modified time.',
    PRIMARY KEY (`id`),
    UNIQUE KEY (`name`),
    UNIQUE KEY (`code2Letter`),
    UNIQUE KEY (`code3Letter`),
    UNIQUE KEY (`codeNumeric`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COMMENT='Country information.';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `ConceptNodes`
--

DROP TABLE IF EXISTS `ConceptNodes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `ConceptNodes` (
    `id` int(11) NOT NULL AUTO_INCREMENT COMMENT 'The object id',
    `encodedID` varchar(200) NOT NULL COMMENT 'The encoded id for concept node',
    `subjectID` smallint(6) NOT NULL COMMENT 'The parent subject for this concept node',
    `branchID` smallint(6) NOT NULL COMMENT 'The parent branch for this concept node',
    `name` varchar(255) NOT NULL COMMENT 'The name of the concept node',
    `handle` varchar(255) NOT NULL COMMENT 'The url safe handle of the node',
    `description` varchar(1023) COMMENT 'The description for the concept node',
    `parentID` int(11) COMMENT 'The parent of this concept node',
    `previewImageUrl` varchar(1023) COMMENT 'The preview image Url',
    `status` varchar(20) NOT NULL DEFAULT 'published' COMMENT 'The current status of this concept node',
    `created` timestamp NOT NULL DEFAULT '0000-00-00 00:00:00' COMMENT 'The timestamp this node was created',
    `updated` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'The update time',
    PRIMARY KEY (`id`),
    UNIQUE KEY(`encodedID`),
    UNIQUE KEY(`handle`),
    UNIQUE KEY(`name`, `branchID`),
    CONSTRAINT `ConceptNodes_ibfk_1` FOREIGN KEY (`subjectID`) REFERENCES `Subjects`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
    CONSTRAINT `ConceptNodes_ibfk_2` FOREIGN KEY (`branchID`) REFERENCES `Branches`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
    CONSTRAINT `ConceptNodes_ibfk_3` FOREIGN KEY (`parentID`) REFERENCES `ConceptNodes`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8 ROW_FORMAT=COMPACT COMMENT='ConceptNodes';
/*!40101 SET character_set_client = @saved_cs_client */;


--
-- Table structure for table `ConceptNodeRelations`
--

DROP TABLE IF EXISTS `ConceptNodeRelations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `ConceptNodeRelations` (
    `conceptID` int(11) NOT NULL COMMENT 'The concept ID',
    `relatedConceptID` int(11) NOT NULL COMMENT 'The concept ID of the related concept',
    `relationType` varchar(255) NOT NULL COMMENT 'The relation type between the conceptID and relatedConceptID',
    `created` timestamp NOT NULL DEFAULT '0000-00-00 00:00:00' COMMENT 'The timestamp this node was created',
    `updated` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'The update time',
    PRIMARY KEY (`conceptID`, `relatedConceptID`, `relationType`),
    CONSTRAINT `ConceptNodeRelations_ibfk_1` FOREIGN KEY (`conceptID`) REFERENCES `ConceptNodes`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
    CONSTRAINT `ConceptNodeRelations_ibfk_2` FOREIGN KEY (`relatedConceptID`) REFERENCES `ConceptNodes`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8 ROW_FORMAT=COMPACT COMMENT='ConceptNodeRelations';
/*!40101 SET character_set_client = @saved_cs_client */;
--
-- Table structure for table `ConceptNodeInstances`
--

DROP TABLE IF EXISTS `ConceptNodeInstances`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `ConceptNodeInstances` (
    `conceptNodeID` int(11) NOT NULL COMMENT 'The id of concept node that this use is associated with',
    `artifactTypeID` int(11) NOT NULL COMMENT 'The artifact type ID of this use',
    `seq` int(11) NOT NULL AUTO_INCREMENT COMMENT 'The sequence number for this use',
    `sourceURL` varchar(2048) NOT NULL COMMENT 'The source URL for this use of the concept node',
    `created` timestamp NOT NULL DEFAULT '0000-00-00 00:00:00' COMMENT 'The timestamp this instance was created',
    `updated` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'The update time',
    PRIMARY KEY (`conceptNodeID`, `artifactTypeID`, `seq`),
    CONSTRAINT `ConceptNodeInstances_ibfk_1` FOREIGN KEY (`artifactTypeID`) REFERENCES `ArtifactExtensionTypes`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
    CONSTRAINT `ConceptNodeInstances_ibfk_2` FOREIGN KEY (`conceptNodeID`) REFERENCES `ConceptNodes`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=MyISAM DEFAULT CHARSET=utf8 ROW_FORMAT=COMPACT COMMENT='ConceptNodeInstances';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `ConceptNodeNeighbors`
--

DROP TABLE IF EXISTS `ConceptNodeNeighbors`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `ConceptNodeNeighbors` (
    `conceptNodeID` int(11) NOT NULL COMMENT 'The concept node id',
    `requiredConceptNodeID` int(11) NOT NULL COMMENT 'The required concept node id',
    PRIMARY KEY (`conceptNodeID`, `requiredConceptNodeID`),
    CONSTRAINT `ConceptNodeNeighbors_ibfk_1` FOREIGN KEY (`conceptNodeID`) REFERENCES `ConceptNodes`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
    CONSTRAINT `ConceptNodeNeighbors_ibfk_2` FOREIGN KEY (`requiredConceptNodeID`) REFERENCES `ConceptNodes`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8 ROW_FORMAT=COMPACT COMMENT='ConceptNodeNeighbors';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `ConceptKeywords`
--

DROP TABLE IF EXISTS `ConceptKeywords`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `ConceptKeywords` (
    `id` int(11) NOT NULL AUTO_INCREMENT COMMENT 'The object id',
    `name` varchar(255) NOT NULL COMMENT 'The name of the concept keyword',
    PRIMARY KEY (`id`),
    UNIQUE KEY(`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 ROW_FORMAT=COMPACT COMMENT='ConceptKeywords';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `ConceptNodeHasKeywords`
--

DROP TABLE IF EXISTS `ConceptNodeHasKeywords`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `ConceptNodeHasKeywords` (
    `keywordID` int(11) NOT NULL AUTO_INCREMENT COMMENT 'The keyword id',
    `conceptNodeID` int(11) NOT NULL COMMENT 'The concept node id',
    PRIMARY KEY (`keywordID`,`conceptNodeID`),
    CONSTRAINT `ConceptNodeHasKeywords_ibfk_1` FOREIGN KEY (`keywordID`) REFERENCES `ConceptKeywords`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
    CONSTRAINT `ConceptNodeHasKeywords_ibfk_2` FOREIGN KEY (`conceptNodeID`) REFERENCES `ConceptNodes`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8 ROW_FORMAT=COMPACT COMMENT='ConceptKeywords';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `ActivityLog`
--

DROP TABLE IF EXISTS `ActivityLog`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `ActivityLog` (
    `id` int(11) NOT NULL AUTO_INCREMENT COMMENT 'The log id',
    `activityType` varchar(255) NOT NULL COMMENT 'The concept node activity log',
    `actionObject` varchar(1023) COMMENT 'The object on which the activity happened',
    `memberID` int(11) NOT NULL COMMENT 'The member responsible for the activity',
    `created` timestamp NOT NULL DEFAULT '0000-00-00 00:00:00' COMMENT 'The timestamp this type was created',
    `updated` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'The update time',
    PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 ROW_FORMAT=COMPACT COMMENT='ActivityLog';
/*!40101 SET character_set_client = @saved_cs_client */;


